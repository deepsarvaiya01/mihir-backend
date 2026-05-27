import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_settings' })
export class LabSetting {
  @PrimaryGeneratedColumn()
  id: number;

  /** Unique setting key, e.g. "lab_name", "lab_address" */
  @Column({ unique: true, length: 80 })
  key: string;

  @Column({ type: 'text' })
  value: string;
}
