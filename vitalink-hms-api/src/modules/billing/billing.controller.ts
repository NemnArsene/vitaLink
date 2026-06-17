import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

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
  findAll() {
    return this.billingService.findAll();
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

  @Post('invoices/:id/submit')
  @ApiOperation({ summary: 'Submit invoice to insurance' })
  submitToInsurance(@Param('id') id: string) {
    return this.billingService.submitToInsurance(id);
  }
}
