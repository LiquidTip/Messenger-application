import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateUserDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  about?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsBoolean()
  showLastSeen?: boolean;

  @IsOptional()
  @IsBoolean()
  showReadReceipts?: boolean;

  @IsOptional()
  @IsObject()
  privacySettings?: {
    profileVisibility?: 'everyone' | 'contacts' | 'nobody';
    lastSeenVisibility?: 'everyone' | 'contacts' | 'nobody';
    readReceipts?: boolean;
  };
}