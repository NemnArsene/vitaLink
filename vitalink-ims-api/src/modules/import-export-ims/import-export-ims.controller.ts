import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { ImportExportImsService } from './import-export-ims.service';
import { ExportImsDataDto, ImportImsDataDto } from './dto/import-export-ims.dto';

@ApiTags('Import/Export IMS')
@Controller('import-export')
export class ImportExportImsController {
  constructor(private readonly importExportImsService: ImportExportImsService) {}

  @Post('export')
  @ApiOperation({ summary: 'Export data to CSV or Excel' })
  exportData(@Body() dto: ExportImsDataDto) {
    return this.importExportImsService.exportData(dto);
  }

  @Post('export/csv')
  @ApiOperation({ summary: 'Export data as CSV file' })
  async exportCsv(@Body() dto: ExportImsDataDto, @Res() res: Response) {
    const result = await this.importExportImsService.exportData({ ...dto, format: 'csv' });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${dto.entity}_export.csv`);
    res.send(result);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import data from CSV or Excel' })
  importData(@Body() dto: ImportImsDataDto) {
    return this.importExportImsService.importData(dto);
  }
}
