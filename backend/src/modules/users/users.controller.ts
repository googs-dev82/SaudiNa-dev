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
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { UsersService } from './users.service.js';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateLanguageDto,
} from './users.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: CurrentUserContext | undefined) {
    return user;
  }

  @Patch('me/language')
  updateMyLanguage(
    @Body() input: UpdateLanguageDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.usersService.updatePreferredLanguage(
      user.id,
      input.preferredLanguage,
    );
  }

  @Roles('SUPER_ADMIN')
  @Get()
  listUsers(@CurrentUser() user: CurrentUserContext) {
    return this.usersService.listUsers(user);
  }

  @Roles('SUPER_ADMIN')
  @Get(':id')
  getUser(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.usersService.getGovernanceUser(id, user);
  }

  @Roles('SUPER_ADMIN')
  @Post()
  createUser(
    @Body() input: CreateUserDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.usersService.createUser(input, user);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() input: UpdateUserDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.usersService.updateUser(id, input, user);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.usersService.deleteUser(id, user);
  }
}
