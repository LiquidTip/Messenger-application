import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateLastSeen(id: string, isOnline: boolean = false): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      lastSeen: new Date(),
      isOnline,
    }).exec();
  }

  async addContact(userId: string, contactPhoneNumber: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { contacts: contactPhoneNumber },
    }).exec();
  }

  async removeContact(userId: string, contactPhoneNumber: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { contacts: contactPhoneNumber },
    }).exec();
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockedUserId },
    }).exec();
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: blockedUserId },
    }).exec();
  }
}