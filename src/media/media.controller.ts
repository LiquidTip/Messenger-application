import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.mediaService.uploadFile(file, req.user.userId);
  }

  @Get(':id')
  getMedia(@Param('id') id: string, @Request() req) {
    return this.mediaService.getMedia(id, req.user.userId);
  }

  @Delete(':id')
  deleteMedia(@Param('id') id: string, @Request() req) {
    return this.mediaService.deleteMedia(id, req.user.userId);
  }

  @Get()
  getUserMedia(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.mediaService.getUserMedia(req.user.userId, page, limit);
  }
}