import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'target_role', type: 'varchar', length: 20 })
  targetRole: string; // 'SUPER_ADMIN' | 'LAB_USER' | 'ALL'

  @Column({ type: 'varchar', length: 100 })
  type: string; // ORDER_AWAITING_APPROVAL | ORDER_APPROVED | ORDER_REJECTED

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'order_id', nullable: true, type: 'int' })
  orderId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
