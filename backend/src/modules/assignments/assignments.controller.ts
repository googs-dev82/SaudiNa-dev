import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AssignmentsService } from './assignments.service.js';
import { CreateAssignmentDto, UpdateAssignmentDto } from './assignments.dto.js';

@Roles('SUPER_ADMIN')
@Controller('admin/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  createAssignment(
    @Body() input: CreateAssignmentDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.assignmentsService.createAssignment(input, user);
  }

  @Get(':id')
  getAssignment(@Param('id') id: string) {
    return this.assignmentsService.getAssignment(id);
  }

  @Patch(':id')
  updateAssignment(
    @Param('id') id: string,
    @Body() input: UpdateAssignmentDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.assignmentsService.updateAssignment(id, input, user);
  }

  @Delete(':id')
  deleteAssignment(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.assignmentsService.deleteAssignment(id, user);
  }

  @Get()
  listAssignments(@CurrentUser() user: CurrentUserContext) {
    return this.assignmentsService.listAssignments(user);
  }
}
