import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WrittenReportsService } from './written-reports.service';
import { CreateWrittenReportDto } from './dto/create-written-report.dto';
import { UpdateWrittenReportDto } from './dto/update-written-report.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Written Reports')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('written-reports')
export class WrittenReportsController {
  constructor(private readonly writtenReportsService: WrittenReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft written report' })
  create(@Body() dto: CreateWrittenReportDto, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.create(dto, user.sub);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get all sent reports authored by current user' })
  findAllSent(@CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.findAllSent(user.sub);
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Get all draft reports authored by current user' })
  findAllDrafts(@CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.findAllDrafts(user.sub);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get all reports received by current user' })
  findReceived(@CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.findReceived(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.findOne(id, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a draft report' })
  update(@Param('id') id: string, @Body() dto: UpdateWrittenReportDto, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.update(id, dto, user.sub);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a draft report to the recipient' })
  send(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.send(id, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft report' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.writtenReportsService.remove(id, user.sub);
  }
}
