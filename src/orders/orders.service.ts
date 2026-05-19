import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { FieldType, TestTemplateField } from '../tests/entities/test-template-field.entity';
import { TestTemplate } from '../tests/entities/test-template.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  SubmitOrderResultValueDto,
  SubmitOrderResultsDto,
} from './dto/submit-order-results.dto';
import { OrderStatus, PatientTestOrder } from './entities/patient-test-order.entity';
import { PatientTestResult } from './entities/patient-test-result.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(PatientTestOrder)
    private readonly ordersRepository: Repository<PatientTestOrder>,
    @InjectRepository(PatientTestResult)
    private readonly resultsRepository: Repository<PatientTestResult>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(TestTemplate)
    private readonly templatesRepository: Repository<TestTemplate>,
    @InjectRepository(TestTemplateField)
    private readonly fieldsRepository: Repository<TestTemplateField>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const [patient, template] = await Promise.all([
      this.patientsRepository.findOne({ where: { id: createOrderDto.patientId } }),
      this.templatesRepository.findOne({ where: { id: createOrderDto.templateId } }),
    ]);
    if (!patient) throw new NotFoundException('Patient not found');
    if (!template) throw new NotFoundException('Test template not found');

    const order = this.ordersRepository.create({
      patientId: patient.id,
      templateId: template.id,
      status: OrderStatus.PENDING,
    });
    const saved = await this.ordersRepository.save(order);
    return this.ordersRepository.findOne({
      where: { id: saved.id },
      relations: ['patient', 'template'],
    });
  }

  async getOrders() {
    const orders = await this.ordersRepository.find({
      relations: ['template', 'patient'],
      order: { id: 'DESC' },
    });
    return orders;
  }

  async getOrderForm(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['template', 'patient'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const fields = await this.fieldsRepository.find({
      where: { templateId: order.templateId },
      order: { displayOrder: 'ASC', id: 'ASC' },
    });

    return { order, fields };
  }

  async submitOrderResults(orderId: number, submitOrderResultsDto: SubmitOrderResultsDto) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const fieldIds = submitOrderResultsDto.values.map((v) => v.fieldId);
    const fields = await this.fieldsRepository.find({
      where: { id: In(fieldIds), templateId: order.templateId },
    });
    const fieldsById = new Map(fields.map((f) => [f.id, f]));

    for (const value of submitOrderResultsDto.values) {
      const field = fieldsById.get(value.fieldId);
      if (!field) throw new BadRequestException(`Invalid fieldId ${value.fieldId}`);
      this.validateValueByFieldType(field, value);
    }

    const existingResults = await this.resultsRepository.find({
      where: { orderId, fieldId: In(fieldIds) },
    });
    const existingByFieldId = new Map(existingResults.map((r) => [r.fieldId, r]));

    const entities = submitOrderResultsDto.values.map((value) => {
      const field = fieldsById.get(value.fieldId)!;
      const current = existingByFieldId.get(value.fieldId) ??
        this.resultsRepository.create({ orderId, fieldId: value.fieldId });

      current.valueText = null;
      current.valueNumber = null;
      current.valueBoolean = null;
      current.valueDate = null;

      if (field.fieldType === FieldType.TEXT || field.fieldType === FieldType.SELECT) {
        current.valueText = value.textValue ?? null;
      } else if (field.fieldType === FieldType.NUMBER || field.fieldType === FieldType.CALCULATED) {
        current.valueNumber = value.numberValue ?? null;
      } else if (field.fieldType === FieldType.CHECKBOX) {
        current.valueBoolean = value.booleanValue ?? null;
      } else if (field.fieldType === FieldType.DATE) {
        current.valueDate = value.dateValue ?? null;
      }
      return current;
    });

    await this.resultsRepository.save(entities);
    order.status = OrderStatus.AWAITING_APPROVAL;
    await this.ordersRepository.save(order);
    return this.getOrderResults(orderId);
  }

  async approveOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = OrderStatus.APPROVED;
    await this.ordersRepository.save(order);
    return this.getOrderResults(orderId);
  }

  async rejectOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['patient', 'template'],
    });
    if (!order) throw new NotFoundException('Order not found');
    order.status = OrderStatus.REJECTED;
    await this.ordersRepository.save(order);
    return { order };
  }

  async getOrderResults(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['patient', 'template'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const rawResults = await this.resultsRepository.find({
      where: { orderId },
      relations: ['field'],
      order: { fieldId: 'ASC' },
    });

    const results = rawResults.map((item) => ({
      fieldName: item.field?.fieldName ?? '',
      fieldType: item.field?.fieldType ?? 'text',
      value: item.valueText ?? item.valueNumber ?? item.valueBoolean ?? item.valueDate ?? '',
      unit: item.field?.unit ?? null,
    }));

    return { order, results };
  }

  async reopenOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['patient', 'template'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.REJECTED) {
      throw new BadRequestException('Only rejected orders can be reopened');
    }
    await this.resultsRepository.delete({ orderId });
    order.status = OrderStatus.PENDING;
    return this.ordersRepository.save(order);
  }

  async deleteOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.REJECTED) {
      throw new BadRequestException('Only pending or rejected orders can be deleted');
    }
    await this.ordersRepository.remove(order);
    return { message: 'Order deleted successfully' };
  }

  private validateValueByFieldType(field: TestTemplateField, value: SubmitOrderResultValueDto) {
    if (field.fieldType === FieldType.CALCULATED) return;
    if (field.required) {
      if ((field.fieldType === FieldType.TEXT || field.fieldType === FieldType.SELECT) && !value.textValue) {
        throw new BadRequestException(`${field.fieldName} is required`);
      }
      if (field.fieldType === FieldType.NUMBER && value.numberValue === undefined) {
        throw new BadRequestException(`${field.fieldName} is required`);
      }
      if (field.fieldType === FieldType.CHECKBOX && value.booleanValue === undefined) {
        throw new BadRequestException(`${field.fieldName} is required`);
      }
      if (field.fieldType === FieldType.DATE && !value.dateValue) {
        throw new BadRequestException(`${field.fieldName} is required`);
      }
    }
    if (field.fieldType === FieldType.SELECT && field.optionsJson && value.textValue) {
      const options = JSON.parse(field.optionsJson) as string[];
      if (!options.includes(value.textValue)) {
        throw new BadRequestException(`${field.fieldName} has invalid option`);
      }
    }
  }
}
