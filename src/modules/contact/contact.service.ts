import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async markAsRead(id: string): Promise<Contact> {
    const contact = await this.findOne(id);
    
    contact.isRead = true;
    return this.contactRepository.save(contact);
  }
  
  async markAsReplied(id: string, adminNotes: string): Promise<Contact> {
    const contact = await this.findOne(id);
    
    contact.isReplied = true;
    contact.isRead = true;
    contact.adminNotes = adminNotes;
    
    return this.contactRepository.save(contact);
  }
  
  async delete(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }
}
