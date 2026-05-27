import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentType } from '../entities/patient-test-order.entity';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentType, nullable: true })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType | null;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 10, description: 'Discount percentage (0–100)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  netAmount?: number;

  @ApiPropertyOptional({ example: 'RCP1234567890' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  receiptNumber?: string | null;
}
