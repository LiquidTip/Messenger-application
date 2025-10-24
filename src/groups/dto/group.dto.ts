import { IsString, IsOptional, IsArray, IsMongoId, IsNumber, IsBoolean } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsArray()
  @IsMongoId({ each: true })
  participants: string[];
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    maxParticipants?: number;
    allowInviteLinks?: boolean;
    allowMemberAdd?: boolean;
    allowMemberRemove?: boolean;
    allowMessageEdit?: boolean;
    allowMessageDelete?: boolean;
  };
}

export class AddMemberDto {
  @IsMongoId()
  memberId: string;
}

export class RemoveMemberDto {
  @IsMongoId()
  memberId: string;
}