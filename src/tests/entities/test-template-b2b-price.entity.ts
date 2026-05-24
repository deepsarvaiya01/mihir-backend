import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TestTemplate } from './test-template.entity';

@Entity({ name: 'test_template_b2b_prices' })
export class TestTemplateB2bPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id' })
  templateId: number;

  @Column({ name: 'b2b_lab_id' })
  b2bLabId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @ManyToOne(() => TestTemplate, (t) => t.b2bPrices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: TestTemplate;
}
