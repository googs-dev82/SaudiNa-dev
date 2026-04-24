import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { COMMITTEE_LEVELS } from '../../common/domain.constants.js';

export class CreateCommitteeDto {
  @IsString()
  @MinLength(2)
  code!: string;

  @IsIn(COMMITTEE_LEVELS)
  level!: (typeof COMMITTEE_LEVELS)[number];

  @IsUUID()
  regionId!: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsString()
  @MinLength(2)
  nameAr!: string;

  @IsString()
  @MinLength(2)
  nameEn!: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCommitteeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  code?: string;

  @IsOptional()
  @IsIn(COMMITTEE_LEVELS)
  level?: (typeof COMMITTEE_LEVELS)[number];

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nameAr?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nameEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
