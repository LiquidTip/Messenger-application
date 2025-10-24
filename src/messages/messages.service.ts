import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, MessageType, MessageStatus } from './schemas/message.schema';
import { Chat, ChatDocument, ChatType } from './schemas/chat.schema';
import { EncryptionService } from '../encryption/encryption.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private encryptionService: EncryptionService,
    private webSocketGateway: WebSocketGateway,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, senderId: string): Promise<Message> {
    const { chatId, type, content, mediaUrl, mediaType, fileName, fileSize, location, contact, replyTo, mentions } = createMessageDto;

    // Verify user is participant in chat
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.participants.includes(new Types.ObjectId(senderId))) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    // Encrypt message content
    const encryptedContent = await this.encryptionService.encryptMessage(content || '');
    const encryptionKey = await this.encryptionService.generateEncryptionKey();

    const message = new this.messageModel({
      chatId: new Types.ObjectId(chatId),
      senderId: new Types.ObjectId(senderId),
      type,
      content,
      mediaUrl,
      mediaType,
      fileName,
      fileSize,
      location,
      contact,
      replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
      mentions: mentions ? mentions.map(id => new Types.ObjectId(id)) : [],
      encryptedContent,
      encryptionKey,
    });

    const savedMessage = await message.save();

    // Update chat's last message
    await this.chatModel.findByIdAndUpdate(chatId, {
      lastMessage: savedMessage._id,
      lastMessageAt: new Date(),
    });

    // Broadcast message to all participants
    await this.broadcastMessage(savedMessage, chat);

    return savedMessage;
  }

  async getMessages(chatId: string, userId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    // Verify user is participant
    const chat = await this.chatModel.findById(chatId);
    if (!chat || !chat.participants.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Access denied');
    }

    const skip = (page - 1) * limit;
    return this.messageModel
      .find({ chatId, isDeleted: false })
      .populate('senderId', 'username profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async updateMessage(messageId: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if message is within edit time limit (15 minutes)
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes
    if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
      throw new ForbiddenException('Message cannot be edited after 15 minutes');
    }

    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        ...updateMessageDto,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true }
    );

    // Broadcast updated message
    const chat = await this.chatModel.findById(message.chatId);
    if (chat) {
      await this.broadcastMessage(updatedMessage, chat);
    }

    return updatedMessage;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageModel.findByIdAndUpdate(messageId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    // Broadcast message deletion
    const chat = await this.chatModel.findById(message.chatId);
    if (chat) {
      await this.broadcastMessageDeletion(messageId, chat);
    }
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: new Types.ObjectId(userId) },
      $set: { status: MessageStatus.READ },
    });

    // Broadcast read receipt
    const message = await this.messageModel.findById(messageId);
    if (message) {
      const chat = await this.chatModel.findById(message.chatId);
      if (chat) {
        await this.broadcastReadReceipt(messageId, userId, chat);
      }
    }
  }

  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      { chatId, readBy: { $ne: new Types.ObjectId(userId) } },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
        $set: { status: MessageStatus.READ },
      }
    );
  }

  private async broadcastMessage(message: Message, chat: Chat): Promise<void> {
    const messageData = {
      id: message._id,
      chatId: message.chatId,
      senderId: message.senderId,
      type: message.type,
      content: message.content,
      mediaUrl: message.mediaUrl,
      mediaType: message.mediaType,
      fileName: message.fileName,
      fileSize: message.fileSize,
      location: message.location,
      contact: message.contact,
      status: message.status,
      createdAt: message.createdAt,
      replyTo: message.replyTo,
      mentions: message.mentions,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
    };

    // Send to all participants
    for (const participantId of chat.participants) {
      this.webSocketGateway.sendToUser(participantId.toString(), 'new_message', messageData);
    }
  }

  private async broadcastMessageDeletion(messageId: string, chat: Chat): Promise<void> {
    for (const participantId of chat.participants) {
      this.webSocketGateway.sendToUser(participantId.toString(), 'message_deleted', { messageId });
    }
  }

  private async broadcastReadReceipt(messageId: string, userId: string, chat: Chat): Promise<void> {
    for (const participantId of chat.participants) {
      if (participantId.toString() !== userId) {
        this.webSocketGateway.sendToUser(participantId.toString(), 'message_read', { messageId, userId });
      }
    }
  }
}