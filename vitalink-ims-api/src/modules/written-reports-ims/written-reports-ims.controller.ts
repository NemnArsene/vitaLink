import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WrittenReportsImsService } from './written-reports-ims.service';
import { CreateWrittenReportImsDto } from './dto/create-written-report-ims.dto';
import { UpdateWrittenReportImsDto } from './dto/update-written-report-ims.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Written Reports IMS')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('written-reports')
export class WrittenReportsImsController {
  constructor(private readonly writtenReportsImsService: WrittenReportsImsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft written report' })
  create(@Body() dto: CreateWrittenReportImsDto, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.create(dto, user.sub);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get all sent reports authored by current user' })
  findAllSent(@CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.findAllSent(user.sub);
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Get all draft reports authored by current user' })
  findAllDrafts(@CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.findAllDrafts(user.sub);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get all reports received by current user' })
  findReceived(@CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.findReceived(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.findOne(id, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a draft report' })
  update(@Param('id') id: string, @Body() dto: UpdateWrittenReportImsDto, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.update(id, dto, user.sub);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a draft report to the recipient' })
  send(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.send(id, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft report' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsImsService.remove(id, user.sub);
  }
}
