import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Team } from './team.entity';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team member' })
  @ApiResponse({ status: 201, description: 'The team member has been successfully created.', type: Team })
  create(@Body() createTeamDto: CreateTeamDto): Promise<Team> {
    return this.teamService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @ApiResponse({ status: 200, description: 'List of all team members.', type: [Team] })
  findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team member by ID' })
  @ApiResponse({ status: 200, description: 'The found team member.', type: Team })
  @ApiResponse({ status: 404, description: 'Team member not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Team> {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team member by ID' })
  @ApiResponse({ status: 200, description: 'The team member has been successfully updated.', type: Team })
  @ApiResponse({ status: 404, description: 'Team member not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTeamDto: UpdateTeamDto): Promise<Team> {
    return this.teamService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team member by ID' })
  @ApiResponse({ status: 200, description: 'The team member has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Team member not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.teamService.remove(id);
  }
}