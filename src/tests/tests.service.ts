import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateFieldDto } from './dto/upsert-template-field.dto';
import { FieldType, TestTemplateField } from './entities/test-template-field.entity';
import { TestTemplate } from './entities/test-template.entity';
import { TestTemplateB2bPrice } from './entities/test-template-b2b-price.entity';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(TestTemplate)
    private readonly templatesRepository: Repository<TestTemplate>,
    @InjectRepository(TestTemplateField)
    private readonly fieldsRepository: Repository<TestTemplateField>,
    @InjectRepository(TestTemplateB2bPrice)
    private readonly b2bPricesRepository: Repository<TestTemplateB2bPrice>,
  ) {}

  async createTemplate(dto: CreateTemplateDto) {
    const template = this.templatesRepository.create({
      name: dto.name,
      code: dto.code,
      active: dto.active ?? true,
      amount: dto.amount ?? 0,
    });
    const saved = await this.templatesRepository.save(template);

    if (dto.b2bPrices && dto.b2bPrices.length > 0) {
      const prices = dto.b2bPrices.map(p =>
        this.b2bPricesRepository.create({ templateId: saved.id, b2bLabId: p.b2bLabId, amount: p.amount }),
      );
      await this.b2bPricesRepository.save(prices);
    }

    return this.getTemplateById(saved.id);
  }

  async getTemplates() {
    return this.templatesRepository.find({
      relations: ['fields', 'b2bPrices'],
      order: { id: 'DESC', fields: { displayOrder: 'ASC', id: 'ASC' } },
    });
  }

  async getTemplateById(id: number) {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: ['fields', 'b2bPrices'],
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(templateId: number, dto: UpdateTemplateDto) {
    const template = await this.templatesRepository.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.code !== undefined) template.code = dto.code;
    if (dto.active !== undefined) template.active = dto.active;
    if (dto.amount !== undefined) template.amount = dto.amount;
    await this.templatesRepository.save(template);

    if (dto.b2bPrices !== undefined) {
      await this.b2bPricesRepository.delete({ templateId });
      if (dto.b2bPrices.length > 0) {
        const prices = dto.b2bPrices.map(p =>
          this.b2bPricesRepository.create({ templateId, b2bLabId: p.b2bLabId, amount: p.amount }),
        );
        await this.b2bPricesRepository.save(prices);
      }
    }

    return this.getTemplateById(templateId);
  }

  async deleteTemplate(templateId: number) {
    const template = await this.templatesRepository.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');
    await this.templatesRepository.remove(template);
    return { message: 'Template deleted successfully' };
  }

  async createTemplateField(templateId: number, dto: UpsertTemplateFieldDto) {
    const template = await this.templatesRepository.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');
    this.validateField(dto);

    const field = this.fieldsRepository.create({
      templateId,
      fieldName: dto.fieldName,
      fieldType: dto.fieldType,
      required: dto.required ?? false,
      optionsJson: dto.formulaJson ?? (dto.options ? JSON.stringify(dto.options) : null),
      unit: dto.unit ?? null,
      displayOrder: dto.displayOrder ?? 1,
    });
    return this.fieldsRepository.save(field);
  }

  async updateTemplateField(templateId: number, fieldId: number, dto: UpsertTemplateFieldDto) {
    const field = await this.fieldsRepository.findOne({ where: { id: fieldId, templateId } });
    if (!field) throw new NotFoundException('Template field not found');
    this.validateField(dto);

    field.fieldName = dto.fieldName;
    field.fieldType = dto.fieldType;
    field.required = dto.required ?? false;
    field.optionsJson = dto.formulaJson ?? (dto.options ? JSON.stringify(dto.options) : null);
    field.unit = dto.unit ?? null;
    field.displayOrder = dto.displayOrder ?? 1;
    return this.fieldsRepository.save(field);
  }

  async deleteTemplateField(templateId: number, fieldId: number) {
    const field = await this.fieldsRepository.findOne({ where: { id: fieldId, templateId } });
    if (!field) throw new NotFoundException('Template field not found');
    await this.fieldsRepository.remove(field);
    return { message: 'Field deleted successfully' };
  }

  private validateField(dto: UpsertTemplateFieldDto) {
    if (dto.fieldType === FieldType.SELECT && (!dto.options || dto.options.length === 0)) {
      throw new BadRequestException('Select field requires options');
    }
    if (dto.fieldType !== FieldType.SELECT && dto.fieldType !== FieldType.CALCULATED && dto.options?.length) {
      throw new BadRequestException('Options are only allowed for select fields');
    }
    if (dto.fieldType === FieldType.CALCULATED && !dto.formulaJson) {
      throw new BadRequestException('Calculated field requires a formula');
    }
  }
}
