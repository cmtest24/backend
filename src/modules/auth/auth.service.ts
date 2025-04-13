import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordUtil } from '../../common/utils/password.util';
import { User } from '../users/entities/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create({
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: registerDto.password,
        phoneNumber: registerDto.phoneNumber,
      });

      // Remove password from response
      const { password, ...result } = user;
      
      return {
        user: result,
        message: 'Registration successful',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Could not register user');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      const isPasswordValid = await PasswordUtil.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateTokenResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour
      
      // Save token to user
      await this.usersService.update(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      });
      
      // Here you would send an email with the reset token
      // For now, just return the token (in a real app this should be emailed)
      
      return {
        message: 'Password reset email sent',
        // Include token here only for testing, remove in production
        resetToken,
      };
    } catch (error) {
      // Don't reveal whether the email exists or not
      return {
        message: 'Password reset email sent if the email exists',
      };
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Find user with this reset token and valid expiration
      const user = await this.findUserByResetToken(token);
      
      // Hash the new password
      const hashedPassword = await PasswordUtil.hash(newPassword);
      
      // Update the user's password and clear the reset token
      await this.usersService.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      
      return {
        message: 'Password reset successful',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
  }

  private async findUserByResetToken(token: string): Promise<User> {
    const users = await this.usersService.findAll();
    
    const user = users.find(
      u => u.resetPasswordToken === token && 
      u.resetPasswordExpires > new Date()
    );
    
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    
    return user;
  }

  async socialLogin(socialData: any) {
    // This is a simplified implementation
    // In a real app, you would verify the token with the social provider
    
    try {
      let user: User;
      
      // Try to find user by email
      try {
        user = await this.usersService.findByEmail(socialData.email);
      } catch (error) {
        // If user doesn't exist, create a new one
        user = await this.usersService.create({
          email: socialData.email,
          fullName: socialData.name,
          password: randomBytes(16).toString('hex'), // Generate random password
          avatarUrl: socialData.picture,
        });
      }
      
      return this.generateTokenResponse(user);
    } catch (error) {
      throw new BadRequestException('Could not authenticate with social provider');
    }
  }

  private generateTokenResponse(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };
    
    const { password, resetPasswordToken, resetPasswordExpires, ...result } = user;
    
    return {
      user: result,
      accessToken: this.jwtService.sign(payload),
      expiresIn: this.configService.get('jwt.expiresIn'),
    };
  }
}
