import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media, MediaDocument, MediaType } from './schemas/media.schema';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

@Injectable()
export class MediaService {
  private s3: AWS.S3;

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    private configService: ConfigService,
  ) {
    // Configure AWS S3
    AWS.config.update({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
    });
    this.s3 = new AWS.S3();
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<Media> {
    const fileType = this.getMediaType(file.mimetype);
    const fileName = this.generateFileName(file.originalname);
    const filePath = `media/${userId}/${fileName}`;

    try {
      // Upload to S3
      const uploadResult = await this.uploadToS3(file.buffer, filePath, file.mimetype);
      
      // Generate thumbnail for images and videos
      let thumbnailUrl: string | undefined;
      if (fileType === MediaType.IMAGE || fileType === MediaType.VIDEO) {
        thumbnailUrl = await this.generateThumbnail(file.buffer, fileType, userId);
      }

      // Compress media if needed
      const compressedBuffer = await this.compressMedia(file.buffer, fileType);
      const isCompressed = compressedBuffer.length < file.buffer.length;

      // Get metadata
      const metadata = await this.extractMetadata(file.buffer, fileType);

      const media = new this.mediaModel({
        uploadedBy: new Types.ObjectId(userId),
        originalName: file.originalname,
        fileName,
        filePath,
        fileUrl: uploadResult.Location,
        mimeType: file.mimetype,
        fileSize: file.size,
        type: fileType,
        thumbnailUrl,
        metadata,
        isCompressed,
      });

      return media.save();
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async getMedia(mediaId: string, userId: string): Promise<Media> {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      throw new BadRequestException('Media not found');
    }

    // Check if user has access to this media
    if (media.uploadedBy.toString() !== userId) {
      throw new BadRequestException('Access denied');
    }

    return media;
  }

  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      throw new BadRequestException('Media not found');
    }

    if (media.uploadedBy.toString() !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Delete from S3
    await this.deleteFromS3(media.filePath);

    // Delete thumbnail if exists
    if (media.thumbnailUrl) {
      const thumbnailPath = media.thumbnailUrl.split('/').pop();
      await this.deleteFromS3(`thumbnails/${userId}/${thumbnailPath}`);
    }

    // Delete from database
    await this.mediaModel.findByIdAndDelete(mediaId);
  }

  async getUserMedia(userId: string, page: number = 1, limit: number = 20): Promise<Media[]> {
    const skip = (page - 1) * limit;
    return this.mediaModel
      .find({ uploadedBy: new Types.ObjectId(userId), isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  private async uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    };

    return this.s3.upload(params).promise();
  }

  private async deleteFromS3(key: string): Promise<void> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  private async generateThumbnail(buffer: Buffer, type: MediaType, userId: string): Promise<string> {
    const thumbnailName = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    const thumbnailPath = `thumbnails/${userId}/${thumbnailName}`;

    try {
      let thumbnailBuffer: Buffer;

      if (type === MediaType.IMAGE) {
        thumbnailBuffer = await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } else if (type === MediaType.VIDEO) {
        thumbnailBuffer = await this.generateVideoThumbnail(buffer);
      } else {
        return null;
      }

      const uploadResult = await this.uploadToS3(thumbnailBuffer, thumbnailPath, 'image/jpeg');
      return uploadResult.Location;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return null;
    }
  }

  private async generateVideoThumbnail(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      ffmpeg(buffer)
        .screenshots({
          timestamps: ['00:00:01.000'],
          filename: 'thumbnail.jpg',
          folder: '/tmp',
          size: '300x300'
        })
        .on('end', () => {
          const fs = require('fs');
          const thumbnailPath = '/tmp/thumbnail.jpg';
          const thumbnailBuffer = fs.readFileSync(thumbnailPath);
          fs.unlinkSync(thumbnailPath);
          resolve(thumbnailBuffer);
        })
        .on('error', reject);
    });
  }

  private async compressMedia(buffer: Buffer, type: MediaType): Promise<Buffer> {
    try {
      if (type === MediaType.IMAGE) {
        return await sharp(buffer)
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();
      } else if (type === MediaType.VIDEO) {
        // Video compression would require more complex logic
        // For now, return original buffer
        return buffer;
      } else if (type === MediaType.AUDIO) {
        // Audio compression would require additional libraries
        // For now, return original buffer
        return buffer;
      }
      return buffer;
    } catch (error) {
      console.error('Compression failed:', error);
      return buffer;
    }
  }

  private async extractMetadata(buffer: Buffer, type: MediaType): Promise<any> {
    try {
      if (type === MediaType.IMAGE) {
        const metadata = await sharp(buffer).metadata();
        return {
          width: metadata.width,
          height: metadata.height,
        };
      } else if (type === MediaType.VIDEO) {
        // Video metadata extraction would require additional libraries
        return {};
      } else if (type === MediaType.AUDIO) {
        // Audio metadata extraction would require additional libraries
        return {};
      }
      return {};
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return {};
    }
  }
}