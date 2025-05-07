import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

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
  @ApiOperation({ summary: 'Get all contact submissions' })
  @ApiResponse({ status: 200, description: 'Return all contact submissions' })
  findAll() {
    return this.contactService.findAll();
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark contact as read' })
  @ApiResponse({ status: 200, description: 'Contact marked as read' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }
  
  
  @Put(':id/replied')
  @ApiOperation({ summary: 'Mark contact as replied with notes' })
  @ApiResponse({ status: 200, description: 'Contact marked as replied' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  markAsReplied(
    @Param('id') id: string,
    @Body('adminNotes') adminNotes: string,
  ) {
    return this.contactService.markAsReplied(id, adminNotes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact submission' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  remove(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}
