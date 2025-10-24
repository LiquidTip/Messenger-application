import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto } from '../src/auth/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    _id: 'user123',
    phoneNumber: '+1234567890',
    username: 'testuser',
    profilePicture: 'profile.jpg',
    lastSeen: new Date(),
  };

  const mockLoginResponse = {
    access_token: 'jwt-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            sendOtp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        phoneNumber: '+1234567890',
        password: 'password123',
        username: 'testuser',
      };

      authService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        registerDto.phoneNumber,
        registerDto.password,
        registerDto.username
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const mockRequest = {
        user: mockUser,
      };

      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockRequest);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('sendOtp', () => {
    it('should send OTP to phone number', async () => {
      const sendOtpDto: SendOtpDto = {
        phoneNumber: '+1234567890',
      };

      const expectedResponse = { message: 'OTP sent successfully' };
      authService.sendOtp.mockResolvedValue(expectedResponse);

      const result = await controller.sendOtp(sendOtpDto);

      expect(authService.sendOtp).toHaveBeenCalledWith(sendOtpDto.phoneNumber);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        phoneNumber: '+1234567890',
        otp: '123456',
      };

      const expectedResponse = { message: 'OTP verified successfully' };
      authService.verifyOtp.mockResolvedValue(expectedResponse);

      const result = await controller.verifyOtp(verifyOtpDto);

      expect(authService.verifyOtp).toHaveBeenCalledWith(
        verifyOtpDto.phoneNumber,
        verifyOtpDto.otp
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockRequest = {
        user: mockUser,
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
