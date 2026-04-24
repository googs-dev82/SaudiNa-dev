import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { ContactService } from './contact.service.js';
import { UpdateContactSubmissionDto } from './contact.dto.js';

@Controller('admin/contact')
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserContext) {
    return this.contactService.list(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() input: UpdateContactSubmissionDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.contactService.update(id, input, user);
  }
}
