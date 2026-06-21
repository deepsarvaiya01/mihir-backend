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
    const sig = await this.repo.findOne({ where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');

    // Deactivate any currently active signature by finding and saving it individually
    // (avoids bulk UPDATE without a key-based WHERE which fails in MySQL safe-update mode)
    const currentlyActive = await this.repo.findOne({ where: { isActive: true } });
    if (currentlyActive && currentlyActive.id !== id) {
      currentlyActive.isActive = false;
      await this.repo.save(currentlyActive);
    }

    sig.isActive = true;
    return this.repo.save(sig);
  }

  async deactivateAll(): Promise<{ message: string }> {
    const active = await this.repo.find({ where: { isActive: true } });
    for (const sig of active) {
      sig.isActive = false;
      await this.repo.save(sig);
    }
    return { message: 'All signatures deactivated' };
  }

  async delete(id: number): Promise<{ message: string }> {
    const sig = await this.repo.findOne({ where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');
    await this.repo.remove(sig);
    return { message: 'Signature deleted' };
  }
}
