import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  about?: string;

  @Prop({ default: Date.now })
  lastSeen: Date;

  @Prop({ default: true })
  isOnline: boolean;

  @Prop({ default: true })
  showLastSeen: boolean;

  @Prop({ default: true })
  showReadReceipts: boolean;

  @Prop({ type: [String], default: [] })
  contacts: string[];

  @Prop({ type: [String], default: [] })
  blockedUsers: string[];

  @Prop({ type: Object, default: {} })
  privacySettings: {
    profileVisibility: 'everyone' | 'contacts' | 'nobody';
    lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);