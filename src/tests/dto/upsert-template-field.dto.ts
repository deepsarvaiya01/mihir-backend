import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { FieldType } from '../entities/test-template-field.entity';

export class UpsertTemplateFieldDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fieldName: string;

  @IsEnum(FieldType)
  fieldType: FieldType;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(40)
  unit?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  displayOrder?: number;
}
