import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
  STICKER = 'sticker',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Chat' })
  chatId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ required: true, enum: MessageType })
  type: MessageType;

  @Prop()
  content?: string;

  @Prop()
  mediaUrl?: string;

  @Prop()
  mediaType?: string;

  @Prop()
  fileName?: string;

  @Prop()
  fileSize?: number;

  @Prop({ type: Object })
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @Prop({ type: Object })
  contact?: {
    name: string;
    phoneNumber: string;
  };

  @Prop({ default: MessageStatus.SENT, enum: MessageStatus })
  status: MessageStatus;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  readBy: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyTo?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentions: Types.ObjectId[];

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: Date })
  editedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ required: true })
  encryptedContent: string;

  @Prop({ required: true })
  encryptionKey: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);