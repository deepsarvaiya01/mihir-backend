import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TestTemplateField } from './test-template-field.entity';
import { TestTemplateB2bPrice } from './test-template-b2b-price.entity';

@Entity({ name: 'test_templates' })
export class TestTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 60, unique: true })
  code: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @OneToMany(() => TestTemplateField, (field) => field.template, {
    cascade: true,
  })
  fields: TestTemplateField[];

  @OneToMany(() => TestTemplateB2bPrice, (p) => p.template)
  b2bPrices: TestTemplateB2bPrice[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
