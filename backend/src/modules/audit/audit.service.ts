import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository.js';
import { CreateAuditLogDto, AuditQueryDto } from './audit.dto.js';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  log(input: CreateAuditLogDto) {
    return this.auditRepository.create(input);
  }

  list(query: AuditQueryDto) {
    return this.auditRepository.findMany(query);
  }
}
