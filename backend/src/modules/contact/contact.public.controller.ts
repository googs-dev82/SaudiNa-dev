import { Body, Controller, Post, Req } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import type { RequestWithContext } from '../../common/types/request-context.type.js';
import { CreateContactSubmissionDto } from './contact.dto.js';
import { ContactService } from './contact.service.js';

@Public()
@Controller('public/contact')
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @RateLimit({ limit: 3, windowMs: 60 * 60 * 1000, key: 'ip' })
  @Post()
  submit(
    @Body() input: CreateContactSubmissionDto,
    @Req() request: RequestWithContext & { ip: string },
  ) {
    return this.contactService.submit(input, request.ip, request.correlationId);
  }
}
