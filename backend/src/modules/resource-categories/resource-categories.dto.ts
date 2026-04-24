import { IsString, MinLength } from 'class-validator';

export class CreateResourceCategoryDto {
  @IsString()
  @MinLength(2)
  code!: string;

  @IsString()
  @MinLength(2)
  nameAr!: string;

  @IsString()
  @MinLength(2)
  nameEn!: string;
}

export class UpdateResourceCategoryDto extends CreateResourceCategoryDto {}
