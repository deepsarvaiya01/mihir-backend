import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'patients' })
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ name: 'patient_code', length: 60, unique: true })
  patientCode: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null;

  @Column({ name: 'blood_group', type: 'varchar', length: 10, nullable: true })
  bloodGroup: string | null;

  @Column({ name: 'email', type: 'varchar', length: 120, nullable: true })
  email: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'address_line', type: 'varchar', length: 255, nullable: true })
  addressLine: string | null;

  @Column({ name: 'city', type: 'varchar', length: 120, nullable: true })
  city: string | null;

  @Column({ name: 'state', type: 'varchar', length: 120, nullable: true })
  state: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 120, nullable: true })
  emergencyContactName: string | null;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone: string | null;

  @Column({ name: 'is_b2b', default: false })
  isB2b: boolean;

  @Column({ name: 'b2b_lab_id', type: 'int', nullable: true })
  b2bLabId: number | null;

  @Column({ name: 'lab_branch_id', type: 'int', nullable: true })
  labBranchId: number | null;

  @Column({ name: 'doctor_name', type: 'varchar', length: 120, nullable: true })
  doctorName: string | null;

  @Column({ name: 'report_date', type: 'date', nullable: true })
  reportDate: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
