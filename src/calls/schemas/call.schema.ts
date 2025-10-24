import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CallDocument = Call & Document;

export enum CallType {
  VOICE = 'voice',
  VIDEO = 'video',
}

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  ANSWERED = 'answered',
  REJECTED = 'rejected',
  MISSED = 'missed',
  ENDED = 'ended',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Call {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  callerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  receiverId: Types.ObjectId;

  @Prop({ required: true, enum: CallType })
  type: CallType;

  @Prop({ required: true, enum: CallStatus, default: CallStatus.INITIATED })
  status: CallStatus;

  @Prop()
  duration?: number; // in seconds

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  endedAt?: Date;

  @Prop()
  sdpOffer?: string;

  @Prop()
  sdpAnswer?: string;

  @Prop({ type: [String], default: [] })
  iceCandidates: string[];

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  groupId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  participants: Types.ObjectId[];

  @Prop({ default: false })
  isGroupCall: boolean;

  @Prop({ type: Object, default: {} })
  callSettings: {
    videoEnabled: boolean;
    audioEnabled: boolean;
    screenShareEnabled: boolean;
  };
}

export const CallSchema = SchemaFactory.createForClass(Call);