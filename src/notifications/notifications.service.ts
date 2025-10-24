import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: any,
    fromUserId?: string,
    chatId?: string,
    groupId?: string,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      type,
      title,
      body,
      data,
      fromUserId: fromUserId ? new Types.ObjectId(fromUserId) : undefined,
      chatId: chatId ? new Types.ObjectId(chatId) : undefined,
      groupId: groupId ? new Types.ObjectId(groupId) : undefined,
    });

    const savedNotification = await notification.save();
    
    // Send push notification
    await this.sendPushNotification(savedNotification);

    return savedNotification;
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<Notification[]> {
    const skip = (page - 1) * limit;
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('fromUserId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Get user's FCM token (this would typically be stored in user profile)
      const user = await this.getUserFCMToken(notification.userId.toString());
      if (!user?.fcmToken) {
        console.log('No FCM token found for user:', notification.userId);
        return;
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type,
          notificationId: notification._id.toString(),
          ...notification.data,
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#2196F3',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: await this.getUnreadCount(notification.userId.toString()),
            },
          },
        },
      };

      await admin.messaging().send(message);
      
      // Update notification as sent
      await this.notificationModel.findByIdAndUpdate(notification._id, {
        isSent: true,
        sentAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private async getUserFCMToken(userId: string): Promise<{ fcmToken: string } | null> {
    // This would typically fetch from user profile
    // For now, return null as we don't have FCM token storage implemented
    return null;
  }

  async sendMessageNotification(
    recipientId: string,
    senderName: string,
    messagePreview: string,
    chatId: string,
    senderId: string,
  ): Promise<void> {
    await this.createNotification(
      recipientId,
      NotificationType.MESSAGE,
      senderName,
      messagePreview,
      { chatId, senderId },
      senderId,
      chatId,
    );
  }

  async sendCallNotification(
    recipientId: string,
    callerName: string,
    callType: 'voice' | 'video',
    callId: string,
    callerId: string,
  ): Promise<void> {
    await this.createNotification(
      recipientId,
      NotificationType.CALL,
      `Incoming ${callType} call`,
      `${callerName} is calling you`,
      { callId, callType, callerId },
      callerId,
    );
  }

  async sendGroupInviteNotification(
    recipientId: string,
    groupName: string,
    inviterName: string,
    groupId: string,
    inviterId: string,
  ): Promise<void> {
    await this.createNotification(
      recipientId,
      NotificationType.GROUP_INVITE,
      'Group Invitation',
      `${inviterName} added you to ${groupName}`,
      { groupId, inviterId },
      inviterId,
      undefined,
      groupId,
    );
  }
}