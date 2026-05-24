import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLabBranchDto {
  @IsString() @MaxLength(150) name: string;
  @IsString() @MaxLength(255) @IsOptional() address?: string;
  @IsString() @MaxLength(20) @IsOptional() phone?: string;
  @IsBoolean() @IsOptional() active?: boolean;
}
