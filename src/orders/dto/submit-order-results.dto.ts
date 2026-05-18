import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SubmitOrderResultValueDto {
  @IsInt()
  fieldId: number;

  @IsString()
  @IsOptional()
  textValue?: string;

  @IsNumber()
  @IsOptional()
  numberValue?: number;

  @IsBoolean()
  @IsOptional()
  booleanValue?: boolean;

  @IsString()
  @IsOptional()
  dateValue?: string;
}

export class SubmitOrderResultsDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubmitOrderResultValueDto)
  values: SubmitOrderResultValueDto[];
}

export { SubmitOrderResultValueDto };
