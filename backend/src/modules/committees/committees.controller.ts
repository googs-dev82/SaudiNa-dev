import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CommitteesService } from './committees.service.js';
import { CreateCommitteeDto, UpdateCommitteeDto } from './committees.dto.js';

@Roles('SUPER_ADMIN')
@Controller('admin/committees')
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  listCommittees() {
    return this.committeesService.listCommittees();
  }

  @Post()
  createCommittee(@Body() input: CreateCommitteeDto) {
    return this.committeesService.createCommittee(input);
  }

  @Get(':id')
  getCommittee(@Param('id') id: string) {
    return this.committeesService.getCommittee(id);
  }

  @Patch(':id')
  updateCommittee(@Param('id') id: string, @Body() input: UpdateCommitteeDto) {
    return this.committeesService.updateCommittee(id, input);
  }

  @Delete(':id')
  deleteCommittee(@Param('id') id: string) {
    return this.committeesService.deleteCommittee(id);
  }
}
