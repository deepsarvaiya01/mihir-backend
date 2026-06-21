import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLogoDto {
  @ApiProperty({ example: 'Mihir Diagnostic Lab' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ description: 'Base64 data URI of the logo image' })
  @IsString()
  @IsNotEmpty()
  imageData: string;
}
