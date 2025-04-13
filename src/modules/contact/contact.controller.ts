import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiResponse({ status: 201, description: 'Contact form submitted successfully' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all contact submissions (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all contact submissions' })
  @ApiBearerAuth()
  findAll() {
    return this.contactService.findAll();
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark contact as read (admin only)' })
  @ApiResponse({ status: 200, description: 'Contact marked as read' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiBearerAuth()
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }
  
  @Put(':id/replied')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark contact as replied with notes (admin only)' })
  @ApiResponse({ status: 200, description: 'Contact marked as replied' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiBearerAuth()
  markAsReplied(
    @Param('id') id: string,
    @Body('adminNotes') adminNotes: string,
  ) {
    return this.contactService.markAsReplied(id, adminNotes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a contact submission (admin only)' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}
