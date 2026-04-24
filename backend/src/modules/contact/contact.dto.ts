import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CONTACT_STATUSES } from '../../common/domain.constants.js';

export class CreateContactSubmissionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message!: string;
}

export class UpdateContactSubmissionDto {
  @IsIn(CONTACT_STATUSES)
  status!: (typeof CONTACT_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;
}
