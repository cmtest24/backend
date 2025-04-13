import { 
  Injectable, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationOptions, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, phone } = createUserDto;

    // Check if user with same email or phone exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('Email or phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    // Remove password from response
    delete user.password;
    return user;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<User>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const sortBy = options.sortBy || 'createdAt';
    const order = options.order || 'DESC';
    
    const [users, total] = await this.usersRepository.findAndCount({
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['addresses'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // If email is being updated, check for uniqueness
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }
    
    // If phone is being updated, check for uniqueness
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.usersRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      
      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }
    }
    
    // If password is provided, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Update and return user
    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
    
    // Remove password from response
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    
    // Soft delete by marking as inactive
    user.status = UserStatus.INACTIVE;
    await this.usersRepository.save(user);
    
    return { message: `User with ID ${id} has been deactivated` };
  }
}
