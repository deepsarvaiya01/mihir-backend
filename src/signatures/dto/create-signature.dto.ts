import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSignatureDto {
  @ApiProperty({ example: 'Dr. Sharma', description: 'Display name for this signature' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ description: 'Base64 data URI of the signature image (data:image/...;base64,...)' })
  @IsString()
  @IsNotEmpty()
  imageData: string;
}
