import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Signature } from './entities/signature.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { AzureStorageService } from '../azure-storage/azure-storage.service';

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(Signature)
    private readonly repo: Repository<Signature>,
    private readonly azureStorage: AzureStorageService,
  ) {}

  getAll(): Promise<Signature[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getActive(): Promise<Signature | null> {
    return this.repo.findOne({ where: { isActive: true } });
  }

  async create(dto: CreateSignatureDto): Promise<Signature> {
    const imageUrl = await this.azureStorage.uploadBase64(dto.imageData, 'signatures', dto.name);
    const sig = this.repo.create({ name: dto.name, imageUrl, isActive: false });
    return this.repo.save(sig);
  }

  async activate(id: number): Promise<Signature> {
    const sig = await this.repo.findOne({ where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');

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
    await this.repo.softDelete(id);
    return { message: 'Signature deleted' };
  }

  getArchived(): Promise<Signature[]> {
    return this.repo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) }, order: { createdAt: 'DESC' } });
  }

  async restore(id: number): Promise<{ message: string }> {
    const sig = await this.repo.findOne({ withDeleted: true, where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');
    await this.repo.restore(id);
    return { message: 'Signature restored' };
  }

  async permanentlyDelete(id: number): Promise<{ message: string }> {
    const sig = await this.repo.findOne({ withDeleted: true, where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');
    await this.azureStorage.deleteByUrl(sig.imageUrl);
    await this.repo.remove(sig);
    return { message: 'Signature permanently deleted' };
  }
}
