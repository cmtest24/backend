import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req,
  ParseIntPipe
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse 
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  @ApiResponse({ status: 200, description: 'Return all addresses.' })
  findAll(@Req() req) {
    return this.addressesService.findAllByUser(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully.' })
  create(@Body() createAddressDto: CreateAddressDto, @Req() req) {
    return this.addressesService.create(createAddressDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @Req() req,
  ) {
    return this.addressesService.update(id, updateAddressDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.addressesService.remove(id, req.user.id);
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({ status:.200, description: 'Address set as default successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  setDefault(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.addressesService.setDefault(id, req.user.id);
  }
}
