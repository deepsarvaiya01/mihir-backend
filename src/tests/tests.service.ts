import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateFieldDto } from './dto/upsert-template-field.dto';
import { FieldType, TestTemplateField } from './entities/test-template-field.entity';
import { TestTemplate } from './entities/test-template.entity';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(TestTemplate)
    private readonly templatesRepository: Repository<TestTemplate>,
    @InjectRepository(TestTemplateField)
    private readonly fieldsRepository: Repository<TestTemplateField>,
  ) {}

  async createTemplate(createTemplateDto: CreateTemplateDto) {
    const template = this.templatesRepository.create(createTemplateDto);
    return this.templatesRepository.save(template);
  }

  async getTemplates() {
    return this.templatesRepository.find({
      relations: ['fields'],
      order: { id: 'DESC', fields: { displayOrder: 'ASC', id: 'ASC' } },
    });
  }

  async updateTemplate(templateId: number, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.templatesRepository.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    Object.assign(template, updateTemplateDto);
    return this.templatesRepository.save(template);
  }

  async createTemplateField(templateId: number, dto: UpsertTemplateFieldDto) {
    const template = await this.templatesRepository.findOne({ where: { id: templateId } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    this.validateField(dto);

    const field = this.fieldsRepository.create({
      templateId,
      fieldName: dto.fieldName,
      fieldType: dto.fieldType,
      required: dto.required ?? false,
      optionsJson: dto.options ? JSON.stringify(dto.options) : null,
      unit: dto.unit ?? null,
      displayOrder: dto.displayOrder ?? 1,
    });
    return this.fieldsRepository.save(field);
  }

  async updateTemplateField(templateId: number, fieldId: number, dto: UpsertTemplateFieldDto) {
    const field = await this.fieldsRepository.findOne({
      where: { id: fieldId, templateId },
    });
    if (!field) {
      throw new NotFoundException('Template field not found');
    }
    this.validateField(dto);

    field.fieldName = dto.fieldName;
    field.fieldType = dto.fieldType;
    field.required = dto.required ?? false;
    field.optionsJson = dto.options ? JSON.stringify(dto.options) : null;
    field.unit = dto.unit ?? null;
    field.displayOrder = dto.displayOrder ?? 1;
    return this.fieldsRepository.save(field);
  }

  private validateField(dto: UpsertTemplateFieldDto) {
    if (dto.fieldType === FieldType.SELECT && (!dto.options || dto.options.length === 0)) {
      throw new BadRequestException('Select field requires options');
    }
    if (dto.fieldType !== FieldType.SELECT && dto.options && dto.options.length > 0) {
      throw new BadRequestException('Options are only allowed for select fields');
    }
  }
}
