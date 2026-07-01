import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StatusDto } from '../../common/dto/status.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoices')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.billingService.create(createInvoiceDto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ type: PaginationDto })
  findAll(@Query() pagination: PaginationDto) {
    return this.billingService.findAll(pagination);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Put('invoices/:id')
  @ApiOperation({ summary: 'Update invoice' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.billingService.update(id, updateInvoiceDto);
  }

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Delete invoice' })
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }

  @Post('invoices/:id/submit')
  @ApiOperation({ summary: 'Submit invoice to insurance' })
  submitToInsurance(@Param('id') id: string) {
    return this.billingService.submitToInsurance(id);
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.billingService.update(id, { statut: dto.statut } as any);
  }
}
