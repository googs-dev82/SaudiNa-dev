import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRegionDto {
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

export class UpdateRegionDto {
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
