import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Messaging')
@ApiBearerAuth('access-token')
@Scopes(Scope.HOSPITAL)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message (sender from JWT)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  send(@Body() dto: CreateMessageDto, @CurrentUser() user: JwtPayload) {
    return this.messagingService.sendMessage(dto, user);
  }

  @Get('inbox/:userId')
  @ApiOperation({ summary: 'Get inbox messages' })
  getInbox(@Param('userId') userId: string) {
    return this.messagingService.getInbox(userId);
  }

  @Get('sent/:senderId')
  @ApiOperation({ summary: 'Get sent messages' })
  getSent(@Param('senderId') senderId: string) {
    return this.messagingService.getSentMessages(senderId);
  }

  @Get('unread/:userId')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.messagingService.getUnreadCount(userId);
  }

  @Get('conversation/:messageId')
  @ApiOperation({ summary: 'Get conversation thread' })
  getConversation(@Param('messageId') messageId: string) {
    return this.messagingService.getConversation(messageId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@Param('id') id: string) {
    return this.messagingService.markAsRead(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive message' })
  archive(@Param('id') id: string) {
    return this.messagingService.archive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete message' })
  delete(@Param('id') id: string) {
    return this.messagingService.deleteMessage(id);
  }
}
