import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsArray, IsMongoId } from 'class-validator';
import { MessageType } from '../schemas/message.schema';

export class CreateMessageDto {
  @IsMongoId()
  chatId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  mediaType?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @IsOptional()
  @IsObject()
  contact?: {
    name: string;
    phoneNumber: string;
  };

  @IsOptional()
  @IsMongoId()
  replyTo?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  mentions?: string[];
}

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}