import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'signatures' })
export class Signature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  /** Azure Blob Storage URL for this signature image */
  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl: string;

  /** Only one signature can be active at a time */
  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
