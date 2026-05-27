import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from './entities/signature.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(Signature)
    private readonly repo: Repository<Signature>,
  ) {}

  getAll(): Promise<Signature[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getActive(): Promise<Signature | null> {
    return this.repo.findOne({ where: { isActive: true } });
  }

  async create(dto: CreateSignatureDto): Promise<Signature> {
    const sig = this.repo.create({ ...dto, isActive: false });
    return this.repo.save(sig);
  }

  async activate(id: number): Promise<Signature> {
    // Deactivate all first
    await this.repo.update({}, { isActive: false });
    const sig = await this.repo.findOne({ where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');
    sig.isActive = true;
    return this.repo.save(sig);
  }

  async deactivateAll(): Promise<{ message: string }> {
    await this.repo.update({}, { isActive: false });
    return { message: 'All signatures deactivated' };
  }

  async delete(id: number): Promise<{ message: string }> {
    const sig = await this.repo.findOne({ where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');
    await this.repo.remove(sig);
    return { message: 'Signature deleted' };
  }
}
