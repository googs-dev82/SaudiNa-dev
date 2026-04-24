import { Body, Controller, Post, Req } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import type { RequestWithContext } from '../../common/types/request-context.type.js';
import { ChatbotQueryDto } from './chatbot.dto.js';
import { ChatbotService } from './chatbot.service.js';

@Public()
@Controller('public/chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @RateLimit({ limit: 20, windowMs: 60_000, key: 'ip' })
  @Post('query')
  query(
    @Body() input: ChatbotQueryDto,
    @Req() request: RequestWithContext & { ip: string },
  ) {
    return this.chatbotService.query(input, request.ip, request.correlationId);
  }
}
