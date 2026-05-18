import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  code?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
