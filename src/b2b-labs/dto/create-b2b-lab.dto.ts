import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateB2bLabDto {
  @IsString() @MaxLength(150) name: string;
  @IsString() @MaxLength(100) @IsOptional() contactPerson?: string;
  @IsString() @MaxLength(20) @IsOptional() phone?: string;
  @IsString() @MaxLength(120) @IsOptional() email?: string;
  @IsString() @MaxLength(255) @IsOptional() address?: string;
  @IsString() @MaxLength(100) @IsOptional() city?: string;
  @IsBoolean() @IsOptional() active?: boolean;
}
