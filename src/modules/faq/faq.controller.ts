import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(+id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an FAQ by slug' })
  @ApiResponse({ status: 200, description: 'Return the FAQ' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.faqService.findBySlug(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(+id, updateFaqDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqService.remove(+id);
  }
}