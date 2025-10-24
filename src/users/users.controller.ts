import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Post('contacts/:phoneNumber')
  addContact(@Request() req, @Param('phoneNumber') phoneNumber: string) {
    return this.usersService.addContact(req.user.userId, phoneNumber);
  }

  @Delete('contacts/:phoneNumber')
  removeContact(@Request() req, @Param('phoneNumber') phoneNumber: string) {
    return this.usersService.removeContact(req.user.userId, phoneNumber);
  }

  @Post('block/:userId')
  blockUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.blockUser(req.user.userId, userId);
  }

  @Delete('block/:userId')
  unblockUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.unblockUser(req.user.userId, userId);
  }
}