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

  @OneToMany(() => PatientTestResult, (result) => result.order, { cascade: true })
  results: PatientTestResult[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
