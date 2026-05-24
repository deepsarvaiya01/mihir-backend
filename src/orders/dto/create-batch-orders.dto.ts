import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class BatchOrderItemDto {
  @IsInt() @Min(1) templateId: number;
}

export class CreateBatchOrdersDto {
  @IsInt() @Min(1) patientId: number;
  @IsArray() orders: BatchOrderItemDto[];
  @IsNumber() @Min(0) @Max(100) @IsOptional() discount?: number;
  @IsEnum(['PENDING', 'PAID', 'PARTIAL']) @IsOptional() paymentStatus?: string;
  @IsEnum(['CASH', 'CHEQUE', 'ONLINE']) @IsOptional() paymentType?: string;
}
