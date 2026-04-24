import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AuditService } from './audit.service.js';
import { AuditQueryDto } from './audit.dto.js';

@Roles('SUPER_ADMIN')
@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(@Query() query: AuditQueryDto) {
    return this.auditService.list(query);
  }
}
