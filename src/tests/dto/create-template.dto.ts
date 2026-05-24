import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class B2bPriceItemDto {
  @IsInt() @Min(1) b2bLabId: number;
  @IsNumber() @Min(0) amount: number;
}

export class CreateTemplateDto {
  @IsString() @IsNotEmpty() @MaxLength(150)
  name: string;

  @IsString() @IsNotEmpty() @MaxLength(60)
  code: string;

  @IsBoolean() @IsOptional()
  active?: boolean;

  @IsNumber() @Min(0) @IsOptional()
  amount?: number;

  @IsArray() @IsOptional()
  b2bPrices?: B2bPriceItemDto[];
}
