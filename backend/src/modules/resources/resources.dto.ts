import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateResourceDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @MinLength(2)
  titleAr!: string;

  @IsString()
  @MinLength(2)
  titleEn!: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsString()
  filePath!: string;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(0)
  fileSize!: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class InitResourceUploadDto {
  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
