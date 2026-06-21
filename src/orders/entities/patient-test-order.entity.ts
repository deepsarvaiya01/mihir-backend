import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { TestTemplate } from '../../tests/entities/test-template.entity';
import { PatientTestResult } from './patient-test-result.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
}

export enum PaymentType {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
}

@Entity({ name: 'patient_test_orders' })
export class PatientTestOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id' })
  patientId: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'template_id' })
  templateId: number;

  @ManyToOne(() => TestTemplate)
  @JoinColumn({ name: 'template_id' })
  template: TestTemplate;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  netAmount: number;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_type', type: 'enum', enum: PaymentType, nullable: true })
  paymentType: PaymentType | null;

  @Column({ name: 'receipt_number', type: 'varchar', length: 30, nullable: true })
  receiptNumber: string | null;

  /** Base64 data URI of an attached PDF to be merged with the final report */
  @Column({ name: 'attachment_base64', type: 'longtext', nullable: true })
  attachmentBase64: string | null;

  @Column({ name: 'attachment_name', type: 'varchar', length: 255, nullable: true })
  attachmentName: string | null;

  /** Remark written by SUPER_ADMIN when reverting an approved order for correction */
  @Column({ name: 'revert_remark', type: 'varchar', length: 500, nullable: true })
  revertRemark: string | null;

  @OneToMany(() => PatientTestResult, (result) => result.order, { cascade: true })
  results: PatientTestResult[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
