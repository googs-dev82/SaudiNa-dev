import { IsBoolean, IsIn, IsObject, IsOptional } from 'class-validator';
import { REPORT_TYPES } from '../../common/domain.constants.js';

export class CreateReportDto {
  @IsIn(REPORT_TYPES)
  type!: (typeof REPORT_TYPES)[number];

  @IsObject()
  filters!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;
}
