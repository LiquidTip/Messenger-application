import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async validateUser(phoneNumber: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      phoneNumber: user.phoneNumber, 
      sub: user._id,
      username: user.username 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        profilePicture: user.profilePicture,
        lastSeen: user.lastSeen,
      },
    };
  }

  async register(phoneNumber: string, password: string, username: string) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.usersService.create({
      phoneNumber,
      password: hashedPassword,
      username,
    });
    
    const { password: _, ...result } = user;
    return result;
  }

  async sendOtp(phoneNumber: string) {
    const otp = this.otpService.generateOtp();
    await this.otpService.storeOtp(phoneNumber, otp);
    await this.otpService.sendOtp(phoneNumber, otp);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const isValid = await this.otpService.verifyOtp(phoneNumber, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }
    return { message: 'OTP verified successfully' };
  }
}