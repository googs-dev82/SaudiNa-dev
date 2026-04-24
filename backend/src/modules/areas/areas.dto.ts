import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateAreaDto {
  @IsUUID()
  regionId!: string;

  @IsString()
  @MinLength(2)
  code!: string;

  @IsString()
  @MinLength(2)
  nameAr!: string;

  @IsString()
  @MinLength(2)
  nameEn!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAreaDto {
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nameAr?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nameEn?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
