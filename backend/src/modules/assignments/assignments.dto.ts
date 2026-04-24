import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ROLE_CODES, SCOPE_TYPES } from '../../common/domain.constants.js';

export class CreateAssignmentDto {
  @IsUUID()
  userId!: string;

  @IsIn(ROLE_CODES)
  roleCode!: (typeof ROLE_CODES)[number];

  @IsIn(SCOPE_TYPES)
  scopeType!: (typeof SCOPE_TYPES)[number];

  @IsOptional()
  @IsString()
  scopeId?: string;

  @IsOptional()
  @IsString()
  scopeCode?: string;

  @IsOptional()
  @IsDateString()
  activeFrom?: string;

  @IsOptional()
  @IsDateString()
  activeUntil?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsIn(ROLE_CODES)
  roleCode?: (typeof ROLE_CODES)[number];

  @IsOptional()
  @IsIn(SCOPE_TYPES)
  scopeType?: (typeof SCOPE_TYPES)[number];

  @IsOptional()
  @IsString()
  scopeId?: string;

  @IsOptional()
  @IsString()
  scopeCode?: string;

  @IsOptional()
  @IsDateString()
  activeFrom?: string;

  @IsOptional()
  @IsDateString()
  activeUntil?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
