import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PatientTestOrder } from '../orders/entities/patient-test-order.entity';
import { PatientTestResult } from '../orders/entities/patient-test-result.entity';
import { TestTemplateField } from '../tests/entities/test-template-field.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(PatientTestOrder)
    private readonly ordersRepository: Repository<PatientTestOrder>,
    @InjectRepository(PatientTestResult)
    private readonly resultsRepository: Repository<PatientTestResult>,
    @InjectRepository(TestTemplateField)
    private readonly fieldsRepository: Repository<TestTemplateField>,
  ) {}

  async createPatient(createPatientDto: CreatePatientDto) {
    const patient = this.patientsRepository.create({
      ...createPatientDto,
      age: createPatientDto.age ?? null,
      dateOfBirth: createPatientDto.dateOfBirth ?? null,
      gender: createPatientDto.gender ?? null,
      bloodGroup: createPatientDto.bloodGroup ?? null,
      email: createPatientDto.email ?? null,
      phoneNumber: createPatientDto.phoneNumber ?? null,
      addressLine: createPatientDto.addressLine ?? null,
      city: createPatientDto.city ?? null,
      state: createPatientDto.state ?? null,
      postalCode: createPatientDto.postalCode ?? null,
      emergencyContactName: createPatientDto.emergencyContactName ?? null,
      emergencyContactPhone: createPatientDto.emergencyContactPhone ?? null,
    });
    return this.patientsRepository.save(patient);
  }

  async getPatients(search?: string) {
    if (search) {
      return this.patientsRepository.find({
        where: [
          { fullName: ILike(`%${search}%`) },
          { patientCode: ILike(`%${search}%`) },
          { phoneNumber: ILike(`%${search}%`) },
        ],
        order: { id: 'DESC' },
      });
    }
    return this.patientsRepository.find({ order: { id: 'DESC' } });
  }

  async getPatientById(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async updatePatient(id: number, dto: Partial<CreatePatientDto>) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }

  async deletePatient(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    await this.patientsRepository.remove(patient);
    return { message: 'Patient deleted successfully' };
  }

  async getPatientResultHistory(patientId: number) {
    const patient = await this.patientsRepository.findOne({ where: { id: patientId } });
    if (!patient) return { patient: null, history: [] };

    const orders = await this.ordersRepository.find({
      where: { patientId },
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });

    if (orders.length === 0) return { patient, history: [] };

    const orderIds = orders.map((o) => o.id);
    const results = await this.resultsRepository.find({
      where: orderIds.map((orderId) => ({ orderId })),
      relations: ['field'],
      order: { orderId: 'DESC', fieldId: 'ASC' },
    });

    const groupedByOrder = new Map<number, PatientTestResult[]>();
    for (const result of results) {
      const bucket = groupedByOrder.get(result.orderId) ?? [];
      bucket.push(result);
      groupedByOrder.set(result.orderId, bucket);
    }

    const history = orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      testName: order.template?.name ?? '',
      testCode: order.template?.code ?? '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      results: (groupedByOrder.get(order.id) ?? []).map((item) => ({
        fieldName: item.field?.fieldName ?? '',
        fieldType: item.field?.fieldType ?? 'text',
        value: item.valueText ?? item.valueNumber ?? item.valueBoolean ?? item.valueDate ?? '',
        unit: item.field?.unit ?? null,
      })),
    }));

    return { patient, history };
  }
}
