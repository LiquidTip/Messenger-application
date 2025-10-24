import { IsString, IsOptional, IsEnum, IsArray, IsMongoId, IsNumber, IsBoolean } from 'class-validator';
import { CallType } from '../schemas/call.schema';

export class CreateCallDto {
  @IsOptional()
  @IsMongoId()
  receiverId?: string;

  @IsEnum(CallType)
  type: CallType;

  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participants?: string[];

  @IsOptional()
  @IsObject()
  callSettings?: {
    videoEnabled?: boolean;
    audioEnabled?: boolean;
    screenShareEnabled?: boolean;
  };
}

export class AnswerCallDto {
  @IsString()
  sdpAnswer: string;
}

export class EndCallDto {
  @IsOptional()
  @IsNumber()
  duration?: number;
}