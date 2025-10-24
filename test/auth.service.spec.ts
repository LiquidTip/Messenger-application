import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { OtpService } from '../src/auth/otp.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let otpService: jest.Mocked<OtpService>;

  const mockUser = {
    _id: 'user123',
    phoneNumber: '+1234567890',
    username: 'testuser',
    password: 'hashedPassword',
    profilePicture: 'profile.jpg',
    lastSeen: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByPhoneNumber: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generateOtp: jest.fn(),
            storeOtp: jest.fn(),
            sendOtp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    otpService = module.get(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const phoneNumber = '+1234567890';
      const password = 'password123';
      
      usersService.findByPhoneNumber.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser(phoneNumber, password);

      expect(usersService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual({
        _id: mockUser._id,
        phoneNumber: mockUser.phoneNumber,
        username: mockUser.username,
        profilePicture: mockUser.profilePicture,
        lastSeen: mockUser.lastSeen,
      });
    });

    it('should return null when user is not found', async () => {
      const phoneNumber = '+1234567890';
      const password = 'password123';
      
      usersService.findByPhoneNumber.mockResolvedValue(null);

      const result = await service.validateUser(phoneNumber, password);

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const phoneNumber = '+1234567890';
      const password = 'wrongpassword';
      
      usersService.findByPhoneNumber.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      const result = await service.validateUser(phoneNumber, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = { _id: 'user123', phoneNumber: '+1234567890', username: 'testuser' };
      const expectedToken = 'jwt-token';
      
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        phoneNumber: user.phoneNumber,
        sub: user._id,
        username: user.username,
      });
      expect(result).toEqual({
        access_token: expectedToken,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          username: user.username,
          profilePicture: user.profilePicture,
          lastSeen: user.lastSeen,
        },
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return user data without password', async () => {
      const phoneNumber = '+1234567890';
      const password = 'password123';
      const username = 'testuser';
      const hashedPassword = 'hashedPassword123';
      
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as any);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register(phoneNumber, password, username);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        phoneNumber,
        password: hashedPassword,
        username,
      });
      expect(result).toEqual({
        _id: mockUser._id,
        phoneNumber: mockUser.phoneNumber,
        username: mockUser.username,
        profilePicture: mockUser.profilePicture,
        lastSeen: mockUser.lastSeen,
      });
    });
  });

  describe('sendOtp', () => {
    it('should generate, store, and send OTP', async () => {
      const phoneNumber = '+1234567890';
      const otp = '123456';
      
      otpService.generateOtp.mockReturnValue(otp);
      otpService.storeOtp.mockResolvedValue(undefined);
      otpService.sendOtp.mockResolvedValue(undefined);

      const result = await service.sendOtp(phoneNumber);

      expect(otpService.generateOtp).toHaveBeenCalled();
      expect(otpService.storeOtp).toHaveBeenCalledWith(phoneNumber, otp);
      expect(otpService.sendOtp).toHaveBeenCalledWith(phoneNumber, otp);
      expect(result).toEqual({ message: 'OTP sent successfully' });
    });
  });

  describe('verifyOtp', () => {
    it('should return success message when OTP is valid', async () => {
      const phoneNumber = '+1234567890';
      const otp = '123456';
      
      otpService.verifyOtp.mockResolvedValue(true);

      const result = await service.verifyOtp(phoneNumber, otp);

      expect(otpService.verifyOtp).toHaveBeenCalledWith(phoneNumber, otp);
      expect(result).toEqual({ message: 'OTP verified successfully' });
    });

    it('should throw UnauthorizedException when OTP is invalid', async () => {
      const phoneNumber = '+1234567890';
      const otp = 'wrongotp';
      
      otpService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp(phoneNumber, otp)).rejects.toThrow(UnauthorizedException);
      expect(otpService.verifyOtp).toHaveBeenCalledWith(phoneNumber, otp);
    });
  });
});
