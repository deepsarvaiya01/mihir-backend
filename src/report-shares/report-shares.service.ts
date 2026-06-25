import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { ReportShareToken } from './entities/report-share-token.entity';
import { PatientTestOrder } from '../orders/entities/patient-test-order.entity';

@Injectable()
export class ReportSharesService {
  constructor(
    @InjectRepository(ReportShareToken)
    private readonly tokenRepo: Repository<ReportShareToken>,
    @InjectRepository(PatientTestOrder)
    private readonly ordersRepo: Repository<PatientTestOrder>,
  ) {}

  async createToken(orderId: number): Promise<{ token: string; expiresAt: Date }> {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // Invalidate any existing token for this order
    await this.tokenRepo.delete({ orderId });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.tokenRepo.save(this.tokenRepo.create({ token, orderId, expiresAt }));
    return { token, expiresAt };
  }

  async getReportByToken(token: string) {
    const shareToken = await this.tokenRepo.findOne({ where: { token } });
    if (!shareToken) throw new NotFoundException('Invalid or expired report link');
    if (shareToken.expiresAt < new Date()) throw new UnauthorizedException('Report link has expired');

    const order = await this.ordersRepo.findOne({
      where: { id: shareToken.orderId },
      relations: ['patient', 'template'],
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        patient: order.patient ? {
          fullName: order.patient.fullName,
          patientCode: order.patient.patientCode,
          age: order.patient.age,
          gender: order.patient.gender,
          doctorName: order.patient.doctorName,
          city: order.patient.city,
        } : null,
        template: order.template ? {
          name: order.template.name,
          code: order.template.code,
        } : null,
      },
      expiresAt: shareToken.expiresAt,
    };
  }
}
