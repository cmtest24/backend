import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException, 
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, phone } = registerDto;

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      status: UserStatus.ACTIVE,
    });

    await this.usersRepository.save(user);

    // Remove password from response
    const { password: _, ...result } = user;
    
    return {
      ...result,
      access_token: this.generateToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with password included
    const user = await this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'role', 'status']
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive or banned');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password: _, ...result } = user;
    
    return {
      ...result,
      access_token: this.generateToken(user),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that email doesn't exist
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    // Generate reset token and expiry
    const resetToken = uuidv4();
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1); // Token valid for 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await this.usersRepository.save(user);

    // In production, send email with reset link
    // For now, just return the token
    return { 
      message: 'If your email is registered, you will receive a password reset link',
      // In development only, return the token
      resetToken, 
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.usersRepository.findOne({ 
      where: { resetPasswordToken: token } 
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const { provider, accessToken, userData } = socialLoginDto;
    
    // In a real implementation, you would verify the access token
    // with the respective social provider
    
    // For demo purposes, we'll assume the token is valid and use the provided user data
    
    // Check if user exists with this social ID
    let user = await this.usersRepository.findOne({ 
      where: { 
        socialProvider: provider,
        socialId: userData.id
      } 
    });
    
    if (!user) {
      // Check if email already exists
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: userData.email }
      });
      
      if (existingUserByEmail) {
        // Link social account to existing email
        existingUserByEmail.socialId = userData.id;
        existingUserByEmail.socialProvider = provider;
        user = await this.usersRepository.save(existingUserByEmail);
      } else {
        // Create new user
        const newUser = this.usersRepository.create({
          email: userData.email,
          fullName: userData.name,
          socialId: userData.id,
          socialProvider: provider,
          status: UserStatus.ACTIVE,
        });
        
        user = await this.usersRepository.save(newUser);
      }
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      access_token: this.generateToken(user),
    };
  }

  private generateToken(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }
}
