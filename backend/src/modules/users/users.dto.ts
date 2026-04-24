import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IDENTITY_PROVIDERS } from '../../common/domain.constants.js';

export class UpsertExternalUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @IsString()
  provider!: string;

  @IsOptional()
  @IsString()
  externalSubject?: string;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @IsIn(IDENTITY_PROVIDERS)
  provider!: (typeof IDENTITY_PROVIDERS)[number];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE';
}

export class UpdateLanguageDto {
  @IsIn(['ar', 'en'])
  preferredLanguage!: 'ar' | 'en';
}
