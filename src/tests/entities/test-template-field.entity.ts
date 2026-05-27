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
  CALCULATED = 'calculated',
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

  /** Normal reference range string, e.g. "13.0-18.0" or "4000-10000" */
  @Column({ name: 'reference_range', type: 'varchar', length: 100, nullable: true })
  referenceRange: string | null;

  /** When true this field acts as a section heading in the report (no value/unit/range) */
  @Column({ name: 'is_section_header', default: false })
  isSectionHeader: boolean;
}
