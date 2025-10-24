import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId
  private socketUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user-socket mapping
      this.userSockets.set(userId, client.id);
      this.socketUsers.set(client.id, userId);

      // Update user online status
      await this.usersService.updateLastSeen(userId, true);

      // Join user to their personal room
      client.join(`user_${userId}`);

      // Notify contacts about online status
      this.notifyContactsOnlineStatus(userId, true);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      // Update user offline status
      await this.usersService.updateLastSeen(userId, false);

      // Notify contacts about offline status
      this.notifyContactsOnlineStatus(userId, false);

      // Clean up mappings
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);

      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    client.join(`chat_${data.chatId}`);
    console.log(`User joined chat ${data.chatId}`);
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    client.leave(`chat_${data.chatId}`);
    console.log(`User left chat ${data.chatId}`);
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      client.to(`chat_${data.chatId}`).emit('user_typing', {
        userId,
        chatId: data.chatId,
        isTyping: true,
      });
    }
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      client.to(`chat_${data.chatId}`).emit('user_typing', {
        userId,
        chatId: data.chatId,
        isTyping: false,
      });
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  sendToChat(chatId: string, event: string, data: any) {
    this.server.to(`chat_${chatId}`).emit(event, data);
  }

  private async notifyContactsOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const user = await this.usersService.findById(userId);
      if (user && user.contacts) {
        for (const contactPhoneNumber of user.contacts) {
          const contact = await this.usersService.findByPhoneNumber(contactPhoneNumber);
          if (contact) {
            this.sendToUser(contact._id.toString(), 'contact_status', {
              userId,
              isOnline,
              lastSeen: user.lastSeen,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error notifying contacts:', error);
    }
  }
}