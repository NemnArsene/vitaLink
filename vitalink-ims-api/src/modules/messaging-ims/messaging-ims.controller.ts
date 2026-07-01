import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingImsService } from './messaging-ims.service';
import { CreateMessageImsDto } from './dto/message-ims.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Messaging IMS')
@ApiBearerAuth('access-token')
@Scopes(Scope.INSURANCE)
@Controller('messaging')
export class MessagingImsController {
  constructor(private readonly messagingImsService: MessagingImsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message (sender from JWT)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  send(@Body() dto: CreateMessageImsDto, @CurrentUser() user: JwtPayload) {
    return this.messagingImsService.sendMessage(dto, user);
  }

  @Get('inbox/:userId')
  @ApiOperation({ summary: 'Get inbox messages' })
  getInbox(@Param('userId') userId: string) {
    return this.messagingImsService.getInbox(userId);
  }

  @Get('sent/:senderId')
  @ApiOperation({ summary: 'Get sent messages' })
  getSent(@Param('senderId') senderId: string) {
    return this.messagingImsService.getSentMessages(senderId);
  }

  @Get('unread/:userId')
  @ApiOperation({ summary: 'Get unread count' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.messagingImsService.getUnreadCount(userId);
  }

  @Get('conversation/:messageId')
  @ApiOperation({ summary: 'Get conversation thread' })
  getConversation(@Param('messageId') messageId: string) {
    return this.messagingImsService.getConversation(messageId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@Param('id') id: string) {
    return this.messagingImsService.markAsRead(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive message' })
  archive(@Param('id') id: string) {
    return this.messagingImsService.archive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete message' })
  delete(@Param('id') id: string) {
    return this.messagingImsService.deleteMessage(id);
  }
}
