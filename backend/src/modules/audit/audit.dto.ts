import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  action!: string;

  @IsString()
  resourceType!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  userRoleSnapshot?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  beforeState?: Record<string, unknown>;

  @IsOptional()
  afterState?: Record<string, unknown>;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
