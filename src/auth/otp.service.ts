import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class OtpService {
  private client: twilio.Twilio;
  private otpStore = new Map<string, { otp: string; expires: number }>();

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeOtp(phoneNumber: string, otp: string): Promise<void> {
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.otpStore.set(phoneNumber, { otp, expires });
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const stored = this.otpStore.get(phoneNumber);
    if (!stored || stored.expires < Date.now()) {
      this.otpStore.delete(phoneNumber);
      return false;
    }
    
    const isValid = stored.otp === otp;
    if (isValid) {
      this.otpStore.delete(phoneNumber);
    }
    return isValid;
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    if (!this.client) {
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      return;
    }

    try {
      await this.client.messages.create({
        body: `Your verification code is: ${otp}`,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
}