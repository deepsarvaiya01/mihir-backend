import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { B2bPriceItemDto } from './create-template.dto';

export class UpdateTemplateDto {
  @IsString() @IsOptional() @MaxLength(150) name?: string;
  @IsString() @IsOptional() @MaxLength(60) code?: string;
  @IsBoolean() @IsOptional() active?: boolean;
  @IsNumber() @Min(0) @IsOptional() amount?: number;
  @IsString() @IsOptional() @MaxLength(255) summaryTitle?: string;
  @IsString() @IsOptional() summary?: string;
  @IsArray() @IsOptional() b2bPrices?: B2bPriceItemDto[];
}
