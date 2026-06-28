import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Logo } from './entities/logo.entity';
import { CreateLogoDto } from './dto/create-logo.dto';
import { AzureStorageService } from '../azure-storage/azure-storage.service';

@Injectable()
export class LogosService {
  constructor(
    @InjectRepository(Logo)
    private readonly repo: Repository<Logo>,
    private readonly azureStorage: AzureStorageService,
  ) {}

  getAll(): Promise<Logo[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getActive(): Promise<Logo | null> {
    return this.repo.findOne({ where: { isActive: true } });
  }

  async create(dto: CreateLogoDto): Promise<Logo> {
    const imageUrl = await this.azureStorage.uploadBase64(dto.imageData, 'logos', dto.name);
    const logo = this.repo.create({ name: dto.name, imageUrl, isActive: false });
    return this.repo.save(logo);
  }

  async activate(id: number): Promise<Logo> {
    const logo = await this.repo.findOne({ where: { id } });
    if (!logo) throw new NotFoundException('Logo not found');

    const currentlyActive = await this.repo.findOne({ where: { isActive: true } });
    if (currentlyActive && currentlyActive.id !== id) {
      currentlyActive.isActive = false;
      await this.repo.save(currentlyActive);
    }

    logo.isActive = true;
    return this.repo.save(logo);
  }

  async deactivateAll(): Promise<{ message: string }> {
    const active = await this.repo.find({ where: { isActive: true } });
    for (const logo of active) {
      logo.isActive = false;
      await this.repo.save(logo);
    }
    return { message: 'All logos deactivated' };
  }

  async delete(id: number): Promise<{ message: string }> {
    const logo = await this.repo.findOne({ where: { id } });
    if (!logo) throw new NotFoundException('Logo not found');
    await this.repo.softDelete(id);
    return { message: 'Logo deleted' };
  }

  getArchived(): Promise<Logo[]> {
    return this.repo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) }, order: { createdAt: 'DESC' } });
  }

  async restore(id: number): Promise<{ message: string }> {
    const logo = await this.repo.findOne({ withDeleted: true, where: { id } });
    if (!logo) throw new NotFoundException('Logo not found');
    await this.repo.restore(id);
    return { message: 'Logo restored' };
  }

  async permanentlyDelete(id: number): Promise<{ message: string }> {
    const logo = await this.repo.findOne({ withDeleted: true, where: { id } });
    if (!logo) throw new NotFoundException('Logo not found');
    await this.azureStorage.deleteByUrl(logo.imageUrl);
    await this.repo.remove(logo);
    return { message: 'Logo permanently deleted' };
  }
}
