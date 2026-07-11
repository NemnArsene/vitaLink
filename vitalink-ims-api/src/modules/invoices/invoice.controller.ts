import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Invoices')
@ApiBearerAuth('access-token')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @Scopes(Scope.INSURANCE)
  @ApiOperation({ summary: 'Get all invoices received from hospitals' })
  findAll(@Query('status') status?: string, @Query() pagination?: PaginationDto) {
    return this.invoiceService.findAll(status, pagination);
  }

  @Get(':id')
  @Scopes(Scope.INSURANCE)
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }
}
