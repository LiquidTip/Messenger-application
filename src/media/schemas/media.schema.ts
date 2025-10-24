import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true, enum: MediaType })
  type: MediaType;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: Object })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
    resolution?: string;
  };

  @Prop({ default: false })
  isCompressed: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);