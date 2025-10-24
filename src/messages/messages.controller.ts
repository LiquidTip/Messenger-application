import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messagesService.createMessage(createMessageDto, req.user.userId);
  }

  @Get('chat/:chatId')
  getMessages(
    @Param('chatId') chatId: string,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.messagesService.getMessages(chatId, req.user.userId, page, limit);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto, @Request() req) {
    return this.messagesService.updateMessage(id, updateMessageDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.messagesService.deleteMessage(id, req.user.userId);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markAsRead(id, req.user.userId);
  }

  @Post('chat/:chatId/read')
  markChatAsRead(@Param('chatId') chatId: string, @Request() req) {
    return this.messagesService.markChatAsRead(chatId, req.user.userId);
  }
}