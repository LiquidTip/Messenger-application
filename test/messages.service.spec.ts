import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MessagesService } from '../src/messages/messages.service';
import { Message, MessageDocument } from '../src/messages/schemas/message.schema';
import { Chat, ChatDocument } from '../src/messages/schemas/chat.schema';
import { EncryptionService } from '../src/encryption/encryption.service';
import { WebSocketGateway } from '../src/websocket/websocket.gateway';
import { Types } from 'mongoose';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageModel: any;
  let chatModel: any;
  let encryptionService: jest.Mocked<EncryptionService>;
  let webSocketGateway: jest.Mocked<WebSocketGateway>;

  const mockMessage = {
    _id: 'message123',
    chatId: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    type: 'text',
    content: 'Hello world',
    status: 'sent',
    createdAt: new Date(),
    isEdited: false,
    isDeleted: false,
    save: jest.fn(),
  };

  const mockChat = {
    _id: 'chat123',
    participants: [new Types.ObjectId(), new Types.ObjectId()],
    lastMessage: new Types.ObjectId(),
    lastMessageAt: new Date(),
  };

  const mockMessageModel = {
    new: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockChatModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
        {
          provide: getModelToken(Chat.name),
          useValue: mockChatModel,
        },
        {
          provide: EncryptionService,
          useValue: {
            encryptMessage: jest.fn(),
            generateEncryptionKey: jest.fn(),
          },
        },
        {
          provide: WebSocketGateway,
          useValue: {
            sendToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageModel = module.get(getModelToken(Message.name));
    chatModel = module.get(getModelToken(Chat.name));
    encryptionService = module.get(EncryptionService);
    webSocketGateway = module.get(WebSocketGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMessage', () => {
    it('should create a new message successfully', async () => {
      const createMessageDto = {
        chatId: 'chat123',
        type: 'text',
        content: 'Hello world',
      };
      const senderId = 'sender123';

      chatModel.findById.mockResolvedValue(mockChat);
      encryptionService.encryptMessage.mockResolvedValue('encryptedContent');
      encryptionService.generateEncryptionKey.mockResolvedValue('encryptionKey');
      
      const mockCreatedMessage = { ...mockMessage, save: jest.fn().mockResolvedValue(mockMessage) };
      messageModel.new.mockReturnValue(mockCreatedMessage);
      chatModel.findByIdAndUpdate.mockResolvedValue(mockChat);

      const result = await service.createMessage(createMessageDto, senderId);

      expect(chatModel.findById).toHaveBeenCalledWith(createMessageDto.chatId);
      expect(encryptionService.encryptMessage).toHaveBeenCalledWith(createMessageDto.content);
      expect(encryptionService.generateEncryptionKey).toHaveBeenCalled();
      expect(messageModel.new).toHaveBeenCalled();
      expect(mockCreatedMessage.save).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });

    it('should throw NotFoundException when chat not found', async () => {
      const createMessageDto = {
        chatId: 'nonexistent',
        type: 'text',
        content: 'Hello world',
      };
      const senderId = 'sender123';

      chatModel.findById.mockResolvedValue(null);

      await expect(service.createMessage(createMessageDto, senderId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      const createMessageDto = {
        chatId: 'chat123',
        type: 'text',
        content: 'Hello world',
      };
      const senderId = 'nonparticipant123';
      const chatWithoutSender = {
        ...mockChat,
        participants: [new Types.ObjectId(), new Types.ObjectId()],
      };

      chatModel.findById.mockResolvedValue(chatWithoutSender);

      await expect(service.createMessage(createMessageDto, senderId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMessages', () => {
    it('should return messages for valid chat and user', async () => {
      const chatId = 'chat123';
      const userId = 'user123';
      const page = 1;
      const limit = 50;

      const mockMessages = [mockMessage, { ...mockMessage, _id: 'message456' }];
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMessages),
      };

      chatModel.findById.mockResolvedValue(mockChat);
      messageModel.find.mockReturnValue(mockQuery);

      const result = await service.getMessages(chatId, userId, page, limit);

      expect(chatModel.findById).toHaveBeenCalledWith(chatId);
      expect(messageModel.find).toHaveBeenCalledWith({ chatId, isDeleted: false });
      expect(result).toEqual(mockMessages);
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      const chatId = 'chat123';
      const userId = 'nonparticipant123';
      const chatWithoutUser = {
        ...mockChat,
        participants: [new Types.ObjectId(), new Types.ObjectId()],
      };

      chatModel.findById.mockResolvedValue(chatWithoutUser);

      await expect(service.getMessages(chatId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMessage', () => {
    it('should update message when user is sender and within time limit', async () => {
      const messageId = 'message123';
      const updateMessageDto = { content: 'Updated content' };
      const userId = 'sender123';
      const updatedMessage = { ...mockMessage, content: 'Updated content', isEdited: true };

      messageModel.findById.mockResolvedValue(mockMessage);
      messageModel.findByIdAndUpdate.mockResolvedValue(updatedMessage);
      chatModel.findById.mockResolvedValue(mockChat);

      const result = await service.updateMessage(messageId, updateMessageDto, userId);

      expect(messageModel.findById).toHaveBeenCalledWith(messageId);
      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        messageId,
        {
          ...updateMessageDto,
          isEdited: true,
          editedAt: expect.any(Date),
        },
        { new: true }
      );
      expect(result).toEqual(updatedMessage);
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = 'nonexistent';
      const updateMessageDto = { content: 'Updated content' };
      const userId = 'sender123';

      messageModel.findById.mockResolvedValue(null);

      await expect(service.updateMessage(messageId, updateMessageDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not sender', async () => {
      const messageId = 'message123';
      const updateMessageDto = { content: 'Updated content' };
      const userId = 'otheruser123';
      const messageWithDifferentSender = {
        ...mockMessage,
        senderId: new Types.ObjectId(),
      };

      messageModel.findById.mockResolvedValue(messageWithDifferentSender);

      await expect(service.updateMessage(messageId, updateMessageDto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message when user is sender', async () => {
      const messageId = 'message123';
      const userId = 'sender123';

      messageModel.findById.mockResolvedValue(mockMessage);
      messageModel.findByIdAndUpdate.mockResolvedValue(mockMessage);
      chatModel.findById.mockResolvedValue(mockChat);

      await service.deleteMessage(messageId, userId);

      expect(messageModel.findById).toHaveBeenCalledWith(messageId);
      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(messageId, {
        isDeleted: true,
        deletedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = 'nonexistent';
      const userId = 'sender123';

      messageModel.findById.mockResolvedValue(null);

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not sender', async () => {
      const messageId = 'message123';
      const userId = 'otheruser123';
      const messageWithDifferentSender = {
        ...mockMessage,
        senderId: new Types.ObjectId(),
      };

      messageModel.findById.mockResolvedValue(messageWithDifferentSender);

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const messageId = 'message123';
      const userId = 'user123';

      messageModel.findByIdAndUpdate.mockResolvedValue(mockMessage);
      messageModel.findById.mockResolvedValue(mockMessage);
      chatModel.findById.mockResolvedValue(mockChat);

      await service.markAsRead(messageId, userId);

      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(messageId, {
        $addToSet: { readBy: new Types.ObjectId(userId) },
        $set: { status: 'read' },
      });
    });
  });

  describe('markChatAsRead', () => {
    it('should mark all messages in chat as read', async () => {
      const chatId = 'chat123';
      const userId = 'user123';

      messageModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      await service.markChatAsRead(chatId, userId);

      expect(messageModel.updateMany).toHaveBeenCalledWith(
        { chatId, readBy: { $ne: new Types.ObjectId(userId) } },
        {
          $addToSet: { readBy: new Types.ObjectId(userId) },
          $set: { status: 'read' },
        }
      );
    });
  });
});
