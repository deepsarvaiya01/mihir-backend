import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TestTemplateField } from '../../tests/entities/test-template-field.entity';
import { PatientTestOrder } from './patient-test-order.entity';

@Entity({ name: 'patient_test_results' })
@Unique(['orderId', 'fieldId'])
export class PatientTestResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => PatientTestOrder, (order) => order.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: PatientTestOrder;

  @Column({ name: 'field_id' })
  fieldId: number;

  @ManyToOne(() => TestTemplateField, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: TestTemplateField;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string | null;

  @Column({ name: 'value_number', type: 'float', nullable: true })
  valueNumber: number | null;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean: boolean | null;

  @Column({ name: 'value_date', type: 'date', nullable: true })
  valueDate: string | null;
}
