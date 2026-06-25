import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true, type: 'int' })
  userId: number | null;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 100 })
  action: string; // ORDER_APPROVED, ORDER_REJECTED, PATIENT_CREATED, etc.

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', nullable: true, type: 'int' })
  entityId: number | null;

  @Column({ type: 'text', nullable: true })
  details: string | null; // JSON string for extra context

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
