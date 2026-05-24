import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @MaxLength(60)
  patientCode: string;

  @IsInt()
  @Min(0)
  @Max(130)
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  gender?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  addressLine?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  state?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  postalCode?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  emergencyContactPhone?: string;

  @IsBoolean() @IsOptional() isB2b?: boolean;
  @IsInt() @Min(1) @IsOptional() b2bLabId?: number;
  @IsInt() @Min(1) @IsOptional() labBranchId?: number;
  @IsString() @MaxLength(120) @IsOptional() doctorName?: string;
  @IsString() @IsOptional() reportDate?: string;
}
