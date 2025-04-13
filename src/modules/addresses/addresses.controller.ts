import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses of the user' })
  @ApiResponse({ status: 200, description: 'Return all addresses of the user' })
  findAll(@Request() req) {
    return this.addressesService.findAllByUser(req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, req.user.id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  remove(@Request() req, @Param('id') id: string) {
    return this.addressesService.remove(id, req.user.id);
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiResponse({ status: 200, description: 'Address set as default successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  setDefault(@Request() req, @Param('id') id: string) {
    return this.addressesService.setDefault(id, req.user.id);
  }
}
