import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const teamMember = this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(teamMember);
  }

  async findAll(): Promise<Team[]> {
    const teamMembers = await this.teamRepository.find();
    return teamMembers.map(member => ({
      ...member,
      image: `${process.env.DOMAIN}${member.image}`,
    }));
  }

  async findOne(id: number): Promise<Team> {
    const teamMember = await this.teamRepository.findOne({ where: { id } });
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    return {
      ...teamMember,
      image: `${process.env.DOMAIN}/public/${teamMember.image}`,
    };
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const teamMember = await this.findOne(id); // Check if exists
    this.teamRepository.merge(teamMember, updateTeamDto);
    return this.teamRepository.save(teamMember);
  }

  async remove(id: number): Promise<void> {
    const result = await this.teamRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
  }
}