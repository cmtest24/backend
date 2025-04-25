import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policyService.create(createPolicyDto);
  }

  @Get()
  findAll() {
    return this.policyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policyService.findOne(+id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a policy by slug' })
  @ApiResponse({ status: 200, description: 'Return the policy' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.policyService.findBySlug(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    return this.policyService.update(+id, updatePolicyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.policyService.remove(+id);
  }
}