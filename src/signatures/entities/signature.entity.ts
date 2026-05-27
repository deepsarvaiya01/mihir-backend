import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'signatures' })
export class Signature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  /** Base64-encoded image data URI (e.g. "data:image/png;base64,...") */
  @Column({ type: 'longtext', name: 'image_data' })
  imageData: string;

  /** Only one signature can be active at a time */
  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
