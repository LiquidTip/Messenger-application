import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  BROADCAST = 'broadcast',
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, enum: ChatType })
  type: ChatType;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ type: Map, of: Object, default: {} })
  participantSettings: Map<string, {
    isAdmin: boolean;
    isMuted: boolean;
    joinedAt: Date;
    leftAt?: Date;
  }>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  groupSettings?: {
    maxParticipants: number;
    allowInviteLinks: boolean;
    allowMemberAdd: boolean;
    allowMemberRemove: boolean;
  };
}

export const ChatSchema = SchemaFactory.createForClass(Chat);