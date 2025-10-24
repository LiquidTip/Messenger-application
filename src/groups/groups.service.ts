import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto, RemoveMemberDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private webSocketGateway: WebSocketGateway,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto, creatorId: string): Promise<Group> {
    const { name, description, profilePicture, participants } = createGroupDto;

    const group = new this.groupModel({
      name,
      description,
      profilePicture,
      createdBy: new Types.ObjectId(creatorId),
      participants: [new Types.ObjectId(creatorId), ...participants.map(id => new Types.ObjectId(id))],
      admins: [new Types.ObjectId(creatorId)],
      participantSettings: new Map([
        [creatorId, {
          joinedAt: new Date(),
          isMuted: false,
          isAdmin: true,
        }],
        ...participants.map(id => [id, {
          joinedAt: new Date(),
          isMuted: false,
          isAdmin: false,
        }]),
      ]),
    });

    const savedGroup = await group.save();

    // Notify all participants about group creation
    await this.notifyGroupUpdate(savedGroup, 'group_created');

    return savedGroup;
  }

  async getGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId).populate('participants', 'username profilePicture');
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!group.participants.some(p => p._id.toString() === userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return group;
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    return this.groupModel
      .find({
        participants: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('participants', 'username profilePicture')
      .sort({ lastActivity: -1 })
      .exec();
  }

  async updateGroup(groupId: string, updateGroupDto: UpdateGroupDto, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!group.admins.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Only admins can update group settings');
    }

    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      groupId,
      { ...updateGroupDto, lastActivity: new Date() },
      { new: true }
    );

    // Notify all participants about group update
    await this.notifyGroupUpdate(updatedGroup, 'group_updated');

    return updatedGroup;
  }

  async addMember(groupId: string, addMemberDto: AddMemberDto, userId: string): Promise<Group> {
    const { memberId } = addMemberDto;
    const group = await this.groupModel.findById(groupId);
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!group.admins.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Only admins can add members');
    }

    if (group.participants.includes(new Types.ObjectId(memberId))) {
      throw new ForbiddenException('User is already a member of this group');
    }

    if (group.participants.length >= group.settings.maxParticipants) {
      throw new ForbiddenException('Group has reached maximum participants limit');
    }

    group.participants.push(new Types.ObjectId(memberId));
    group.participantSettings.set(memberId, {
      joinedAt: new Date(),
      isMuted: false,
      isAdmin: false,
    });

    const updatedGroup = await group.save();

    // Notify all participants about new member
    await this.notifyGroupUpdate(updatedGroup, 'member_added', { newMemberId: memberId });

    return updatedGroup;
  }

  async removeMember(groupId: string, removeMemberDto: RemoveMemberDto, userId: string): Promise<Group> {
    const { memberId } = removeMemberDto;
    const group = await this.groupModel.findById(groupId);
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isAdmin = group.admins.includes(new Types.ObjectId(userId));
    const isRemovingSelf = userId === memberId;

    if (!isAdmin && !isRemovingSelf) {
      throw new ForbiddenException('Only admins can remove members or you can leave yourself');
    }

    if (isRemovingSelf && group.admins.includes(new Types.ObjectId(memberId)) && group.admins.length === 1) {
      throw new ForbiddenException('Cannot leave group as the only admin');
    }

    group.participants = group.participants.filter(p => p.toString() !== memberId);
    group.admins = group.admins.filter(a => a.toString() !== memberId);
    group.participantSettings.delete(memberId);

    const updatedGroup = await group.save();

    // Notify all participants about member removal
    await this.notifyGroupUpdate(updatedGroup, 'member_removed', { removedMemberId: memberId });

    return updatedGroup;
  }

  async promoteToAdmin(groupId: string, memberId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!group.admins.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Only admins can promote members');
    }

    if (!group.participants.includes(new Types.ObjectId(memberId))) {
      throw new ForbiddenException('User is not a member of this group');
    }

    if (!group.admins.includes(new Types.ObjectId(memberId))) {
      group.admins.push(new Types.ObjectId(memberId));
      const updatedGroup = await group.save();

      // Notify all participants about admin promotion
      await this.notifyGroupUpdate(updatedGroup, 'member_promoted', { promotedMemberId: memberId });

      return updatedGroup;
    }

    return group;
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await this.removeMember(groupId, { memberId: userId }, userId);
  }

  private async notifyGroupUpdate(group: Group, event: string, additionalData?: any): Promise<void> {
    const groupData = {
      id: group._id,
      name: group.name,
      description: group.description,
      profilePicture: group.profilePicture,
      participants: group.participants,
      admins: group.admins,
      settings: group.settings,
      lastActivity: group.lastActivity,
      ...additionalData,
    };

    for (const participantId of group.participants) {
      this.webSocketGateway.sendToUser(participantId.toString(), event, groupData);
    }
  }
}