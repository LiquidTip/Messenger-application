import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCallDto, AnswerCallDto, EndCallDto } from './dto/call.dto';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private callsService: CallsService) {}

  @Post()
  initiateCall(@Body() createCallDto: CreateCallDto, @Request() req) {
    return this.callsService.initiateCall(createCallDto, req.user.userId);
  }

  @Post(':id/answer')
  answerCall(@Param('id') id: string, @Body() answerCallDto: AnswerCallDto, @Request() req) {
    return this.callsService.answerCall(id, answerCallDto, req.user.userId);
  }

  @Post(':id/reject')
  rejectCall(@Param('id') id: string, @Request() req) {
    return this.callsService.rejectCall(id, req.user.userId);
  }

  @Post(':id/end')
  endCall(@Param('id') id: string, @Body() endCallDto: EndCallDto, @Request() req) {
    return this.callsService.endCall(id, endCallDto, req.user.userId);
  }

  @Get('history')
  getCallHistory(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.callsService.getCallHistory(req.user.userId, page, limit);
  }

  @Get('active')
  getActiveCalls(@Request() req) {
    return this.callsService.getActiveCalls(req.user.userId);
  }

  @Post(':id/ice-candidate')
  addIceCandidate(@Param('id') id: string, @Body() body: { candidate: string }, @Request() req) {
    return this.callsService.addIceCandidate(id, body.candidate, req.user.userId);
  }
}