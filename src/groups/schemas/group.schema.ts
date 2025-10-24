import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  admins: Types.ObjectId[];

  @Prop({ type: Map, of: Object, default: {} })
  participantSettings: Map<string, {
    joinedAt: Date;
    isMuted: boolean;
    isAdmin: boolean;
    leftAt?: Date;
  }>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  settings: {
    maxParticipants: number;
    allowInviteLinks: boolean;
    allowMemberAdd: boolean;
    allowMemberRemove: boolean;
    allowMessageEdit: boolean;
    allowMessageDelete: boolean;
  };

  @Prop({ type: [String], default: [] })
  inviteLinks: string[];

  @Prop({ type: Date })
  lastActivity?: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);