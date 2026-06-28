import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { MailService } from '../mail/mail.service';
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
    private readonly mailService: MailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /** Generates PAT-YYYY-NNNNN format, e.g. PAT-2025-00042 */
  private generatePatientCode(id: number): string {
    const year = new Date().getFullYear();
    return `PAT-${year}-${String(id).padStart(5, '0')}`;
  }

  async createPatient(createPatientDto: CreatePatientDto) {
    // Step 1: save with a unique temporary code to obtain the auto-increment ID
    const temp = this.patientsRepository.create({
      ...createPatientDto,
      patientCode: `TMP-${Date.now()}`,
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
      isB2b: createPatientDto.isB2b ?? false,
      b2bLabId: createPatientDto.b2bLabId ?? null,
      labBranchId: createPatientDto.labBranchId ?? null,
      doctorName: createPatientDto.doctorName ?? null,
      reportDate: createPatientDto.reportDate ?? null,
    });
    const saved = await this.patientsRepository.save(temp);

    // Step 2: update with the properly formatted code
    saved.patientCode = this.generatePatientCode(saved.id);
    const patient = await this.patientsRepository.save(saved);

    this.auditLogsService.log({ userName: 'Lab User', action: 'PATIENT_CREATED', entityType: 'Patient', entityId: patient.id, details: { name: patient.fullName, code: patient.patientCode } });

    // Step 3: send registration email (fire-and-forget)
    if (patient.email) {
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
      void this.mailService.sendPatientRegistration({
        to: patient.email,
        patientName: patient.fullName,
        patientCode: patient.patientCode,
        registrationDate: dateStr,
      });
    }

    return patient;
  }

  async getPatients(search?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const baseQuery = this.patientsRepository.createQueryBuilder('p');

    if (search) {
      baseQuery.where(
        'p.full_name ILIKE :q OR p.patient_code ILIKE :q OR p.phone_number ILIKE :q',
        { q: `%${search}%` }
      );
    }

    const [data, total] = await baseQuery
      .orderBy('p.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getPatientById(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async updatePatient(id: number, dto: Partial<CreatePatientDto>) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    // Never overwrite the auto-generated code
    const { patientCode: _ignored, ...safeDto } = dto;
    Object.assign(patient, safeDto);
    return this.patientsRepository.save(patient);
  }

  async deletePatient(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    this.auditLogsService.log({ userName: 'Lab User', action: 'PATIENT_DELETED', entityType: 'Patient', entityId: id });
    await this.patientsRepository.softDelete(id);
    return { message: 'Patient archived successfully' };
  }

  async getArchivedPatients() {
    return this.patientsRepository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: 'DESC' },
    });
  }

  async restorePatient(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id }, withDeleted: true });
    if (!patient) throw new NotFoundException('Patient not found');
    await this.patientsRepository.restore(id);
    return { message: 'Patient restored successfully' };
  }

  async permanentlyDeletePatient(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id }, withDeleted: true });
    if (!patient) throw new NotFoundException('Patient not found');
    await this.patientsRepository.remove(patient);
    return { message: 'Patient permanently deleted' };
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
