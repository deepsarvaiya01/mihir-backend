import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabBranch } from './entities/lab-branch.entity';
import { CreateLabBranchDto } from './dto/create-lab-branch.dto';

@Injectable()
export class LabBranchesService {
  constructor(@InjectRepository(LabBranch) private readonly repo: Repository<LabBranch>) {}

  getAll() { return this.repo.find({ order: { name: 'ASC' } }); }

  create(dto: CreateLabBranchDto) {
    const branch = this.repo.create({ ...dto, active: dto.active ?? true });
    return this.repo.save(branch);
  }

  async update(id: number, dto: Partial<CreateLabBranchDto>) {
    const branch = await this.repo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Lab branch not found');
    Object.assign(branch, dto);
    return this.repo.save(branch);
  }

  async delete(id: number) {
    const branch = await this.repo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Lab branch not found');
    await this.repo.remove(branch);
    return { message: 'Lab branch deleted' };
  }
}
