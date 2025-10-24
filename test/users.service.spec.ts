import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  const mockUser = {
    _id: 'user123',
    phoneNumber: '+1234567890',
    username: 'testuser',
    password: 'hashedPassword',
    profilePicture: 'profile.jpg',
    lastSeen: new Date(),
    isOnline: false,
    contacts: [],
    blockedUsers: [],
    save: jest.fn(),
  };

  const mockUserModel = {
    new: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        phoneNumber: '+1234567890',
        password: 'hashedPassword',
        username: 'testuser',
      };

      const mockCreatedUser = { ...mockUser, save: jest.fn().mockResolvedValue(mockUser) };
      userModel.new.mockReturnValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(userModel.new).toHaveBeenCalledWith(createUserDto);
      expect(mockCreatedUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [mockUser, { ...mockUser, _id: 'user456' }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers),
      };

      userModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const userId = 'user123';
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      userModel.findById.mockReturnValue(mockQuery);

      const result = await service.findById(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'nonexistent';
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      userModel.findById.mockReturnValue(mockQuery);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPhoneNumber', () => {
    it('should return user when found by phone number', async () => {
      const phoneNumber = '+1234567890';
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByPhoneNumber(phoneNumber);

      expect(userModel.findOne).toHaveBeenCalledWith({ phoneNumber });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user and return updated user', async () => {
      const userId = 'user123';
      const updateUserDto = { username: 'updateduser' };
      const updatedUser = { ...mockUser, username: 'updateduser' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser),
      };

      userModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update(userId, updateUserDto);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        { new: true }
      );
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'nonexistent';
      const updateUserDto = { username: 'updateduser' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      userModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user when found', async () => {
      const userId = 'user123';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.remove(userId);

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'nonexistent';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastSeen', () => {
    it('should update user last seen and online status', async () => {
      const userId = 'user123';
      const isOnline = true;

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.updateLastSeen(userId, isOnline);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {
          lastSeen: expect.any(Date),
          isOnline,
        }
      );
    });
  });

  describe('addContact', () => {
    it('should add contact to user contacts', async () => {
      const userId = 'user123';
      const contactPhoneNumber = '+9876543210';

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.addContact(userId, contactPhoneNumber);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $addToSet: { contacts: contactPhoneNumber },
      });
    });
  });

  describe('removeContact', () => {
    it('should remove contact from user contacts', async () => {
      const userId = 'user123';
      const contactPhoneNumber = '+9876543210';

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.removeContact(userId, contactPhoneNumber);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $pull: { contacts: contactPhoneNumber },
      });
    });
  });

  describe('blockUser', () => {
    it('should add user to blocked users list', async () => {
      const userId = 'user123';
      const blockedUserId = 'blocked123';

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.blockUser(userId, blockedUserId);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $addToSet: { blockedUsers: blockedUserId },
      });
    });
  });

  describe('unblockUser', () => {
    it('should remove user from blocked users list', async () => {
      const userId = 'user123';
      const blockedUserId = 'blocked123';

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.unblockUser(userId, blockedUserId);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $pull: { blockedUsers: blockedUserId },
      });
    });
  });
});
