import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { About } from './entities/about.entity';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Post()
  create(@Body() createAboutDto: CreateAboutDto): Promise<About> {
    return this.aboutService.create(createAboutDto);
  }

  @Get()
  findAll(): Promise<About[]> {
    return this.aboutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<About> {
    return this.aboutService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAboutDto: UpdateAboutDto): Promise<About> {
    return this.aboutService.update(+id, updateAboutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.aboutService.remove(+id);
  }
}