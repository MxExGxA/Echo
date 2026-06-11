import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { User } from './entities/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserData: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserData: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.usersService.delete(id);
  }
}
