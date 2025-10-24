import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Call, CallDocument, CallType, CallStatus } from './schemas/call.schema';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { CreateCallDto, AnswerCallDto, EndCallDto } from './dto/call.dto';

@Injectable()
export class CallsService {
  constructor(
    @InjectModel(Call.name) private callModel: Model<CallDocument>,
    private webSocketGateway: WebSocketGateway,
  ) {}

  async initiateCall(createCallDto: CreateCallDto, callerId: string): Promise<Call> {
    const { receiverId, type, groupId, participants } = createCallDto;

    const call = new this.callModel({
      callerId: new Types.ObjectId(callerId),
      receiverId: receiverId ? new Types.ObjectId(receiverId) : undefined,
      type,
      groupId: groupId ? new Types.ObjectId(groupId) : undefined,
      participants: participants ? participants.map(id => new Types.ObjectId(id)) : [],
      isGroupCall: !!groupId || (participants && participants.length > 0),
      callSettings: {
        videoEnabled: type === CallType.VIDEO,
        audioEnabled: true,
        screenShareEnabled: false,
      },
    });

    const savedCall = await call.save();

    // Send call notification to receiver(s)
    if (receiverId) {
      this.webSocketGateway.sendToUser(receiverId, 'incoming_call', {
        callId: savedCall._id,
        callerId,
        type,
        callSettings: savedCall.callSettings,
      });
    } else if (participants && participants.length > 0) {
      // Group call
      for (const participantId of participants) {
        if (participantId !== callerId) {
          this.webSocketGateway.sendToUser(participantId, 'incoming_group_call', {
            callId: savedCall._id,
            callerId,
            type,
            groupId,
            callSettings: savedCall.callSettings,
          });
        }
      }
    }

    return savedCall;
  }

  async answerCall(callId: string, answerCallDto: AnswerCallDto, userId: string): Promise<Call> {
    const { sdpAnswer } = answerCallDto;

    const call = await this.callModel.findById(callId);
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.receiverId && call.receiverId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to answer this call');
    }

    if (call.status !== CallStatus.RINGING) {
      throw new ForbiddenException('Call is not in ringing state');
    }

    call.status = CallStatus.ANSWERED;
    call.sdpAnswer = sdpAnswer;
    call.startedAt = new Date();

    const updatedCall = await call.save();

    // Notify caller about answered call
    this.webSocketGateway.sendToUser(call.callerId.toString(), 'call_answered', {
      callId: updatedCall._id,
      sdpAnswer: updatedCall.sdpAnswer,
    });

    return updatedCall;
  }

  async rejectCall(callId: string, userId: string): Promise<Call> {
    const call = await this.callModel.findById(callId);
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.receiverId && call.receiverId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to reject this call');
    }

    call.status = CallStatus.REJECTED;
    call.endedAt = new Date();

    const updatedCall = await call.save();

    // Notify caller about rejected call
    this.webSocketGateway.sendToUser(call.callerId.toString(), 'call_rejected', {
      callId: updatedCall._id,
    });

    return updatedCall;
  }

  async endCall(callId: string, endCallDto: EndCallDto, userId: string): Promise<Call> {
    const { duration } = endCallDto;

    const call = await this.callModel.findById(callId);
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    const isCaller = call.callerId.toString() === userId;
    const isReceiver = call.receiverId && call.receiverId.toString() === userId;
    const isParticipant = call.participants.some(p => p.toString() === userId);

    if (!isCaller && !isReceiver && !isParticipant) {
      throw new ForbiddenException('You are not authorized to end this call');
    }

    call.status = CallStatus.ENDED;
    call.endedAt = new Date();
    call.duration = duration;

    const updatedCall = await call.save();

    // Notify all participants about ended call
    const allParticipants = [call.callerId, ...call.participants];
    if (call.receiverId) {
      allParticipants.push(call.receiverId);
    }

    for (const participantId of allParticipants) {
      if (participantId.toString() !== userId) {
        this.webSocketGateway.sendToUser(participantId.toString(), 'call_ended', {
          callId: updatedCall._id,
          duration: updatedCall.duration,
        });
      }
    }

    return updatedCall;
  }

  async getCallHistory(userId: string, page: number = 1, limit: number = 20): Promise<Call[]> {
    const skip = (page - 1) * limit;

    return this.callModel
      .find({
        $or: [
          { callerId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) },
          { participants: new Types.ObjectId(userId) },
        ],
      })
      .populate('callerId', 'username profilePicture')
      .populate('receiverId', 'username profilePicture')
      .populate('participants', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getActiveCalls(userId: string): Promise<Call[]> {
    return this.callModel
      .find({
        $or: [
          { callerId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) },
          { participants: new Types.ObjectId(userId) },
        ],
        status: { $in: [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.ANSWERED] },
      })
      .populate('callerId', 'username profilePicture')
      .populate('receiverId', 'username profilePicture')
      .populate('participants', 'username profilePicture')
      .exec();
  }

  async addIceCandidate(callId: string, candidate: string, userId: string): Promise<void> {
    const call = await this.callModel.findById(callId);
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    const isParticipant = call.callerId.toString() === userId || 
                         (call.receiverId && call.receiverId.toString() === userId) ||
                         call.participants.some(p => p.toString() === userId);

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this call');
    }

    call.iceCandidates.push(candidate);
    await call.save();

    // Forward ICE candidate to other participants
    const allParticipants = [call.callerId, ...call.participants];
    if (call.receiverId) {
      allParticipants.push(call.receiverId);
    }

    for (const participantId of allParticipants) {
      if (participantId.toString() !== userId) {
        this.webSocketGateway.sendToUser(participantId.toString(), 'ice_candidate', {
          callId,
          candidate,
          fromUserId: userId,
        });
      }
    }
  }
}