import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto, RemoveMemberDto } from './dto/group.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    return this.groupsService.createGroup(createGroupDto, req.user.userId);
  }

  @Get()
  getUserGroups(@Request() req) {
    return this.groupsService.getUserGroups(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.groupsService.getGroup(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto, @Request() req) {
    return this.groupsService.updateGroup(id, updateGroupDto, req.user.userId);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto, @Request() req) {
    return this.groupsService.addMember(id, addMemberDto, req.user.userId);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req) {
    return this.groupsService.removeMember(id, { memberId }, req.user.userId);
  }

  @Post(':id/members/:memberId/promote')
  promoteToAdmin(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req) {
    return this.groupsService.promoteToAdmin(id, memberId, req.user.userId);
  }

  @Post(':id/leave')
  leaveGroup(@Param('id') id: string, @Request() req) {
    return this.groupsService.leaveGroup(id, req.user.userId);
  }
}