import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TestTemplate } from './test-template.entity';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  SELECT = 'select',
}

@Entity({ name: 'test_template_fields' })
export class TestTemplateField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id' })
  templateId: number;

  @ManyToOne(() => TestTemplate, (template) => template.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: TestTemplate;

  @Column({ name: 'field_name', length: 120 })
  fieldName: string;

  @Column({ type: 'enum', enum: FieldType })
  fieldType: FieldType;

  @Column({ default: false })
  required: boolean;

  @Column({ name: 'options_json', type: 'text', nullable: true })
  optionsJson: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  unit: string | null;

  @Column({ name: 'display_order', type: 'int', default: 1 })
  displayOrder: number;
}
