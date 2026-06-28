import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { B2bLab } from './entities/b2b-lab.entity';
import { CreateB2bLabDto } from './dto/create-b2b-lab.dto';

@Injectable()
export class B2bLabsService {
  constructor(@InjectRepository(B2bLab) private readonly repo: Repository<B2bLab>) {}

  getAll() { return this.repo.find({ order: { name: 'ASC' } }); }

  create(dto: CreateB2bLabDto) {
    const lab = this.repo.create({ ...dto, active: dto.active ?? true });
    return this.repo.save(lab);
  }

  async update(id: number, dto: Partial<CreateB2bLabDto>) {
    const lab = await this.repo.findOne({ where: { id } });
    if (!lab) throw new NotFoundException('B2B Lab not found');
    Object.assign(lab, dto);
    return this.repo.save(lab);
  }

  async delete(id: number) {
    const lab = await this.repo.findOne({ where: { id } });
    if (!lab) throw new NotFoundException('B2B Lab not found');
    await this.repo.softDelete(id);
    return { message: 'B2B Lab deleted' };
  }

  getArchived() {
    return this.repo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) }, order: { name: 'ASC' } });
  }

  async restore(id: number) {
    const lab = await this.repo.findOne({ withDeleted: true, where: { id } });
    if (!lab) throw new NotFoundException('B2B Lab not found');
    await this.repo.restore(id);
    return { message: 'B2B Lab restored' };
  }

  async permanentlyDelete(id: number) {
    const lab = await this.repo.findOne({ withDeleted: true, where: { id } });
    if (!lab) throw new NotFoundException('B2B Lab not found');
    await this.repo.remove(lab);
    return { message: 'B2B Lab permanently deleted' };
  }
}
