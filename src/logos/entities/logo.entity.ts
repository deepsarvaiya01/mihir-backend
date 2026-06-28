import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'logos' })
export class Logo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  /** Azure Blob Storage URL for this logo image */
  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl: string;

  /** Only one logo can be active at a time */
  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
