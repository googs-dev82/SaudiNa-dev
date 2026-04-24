import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IDENTITY_PROVIDERS } from '../../common/domain.constants.js';

export class ExchangeTokenDto {
  @IsIn(IDENTITY_PROVIDERS)
  provider!: (typeof IDENTITY_PROVIDERS)[number];

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  externalSubject?: string;
}
