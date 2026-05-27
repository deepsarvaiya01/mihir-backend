import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabSetting } from './entities/lab-setting.entity';

const DEFAULTS: Record<string, string> = {
  lab_name: 'Mihir Diagnostic Laboratory',
  lab_address: '',
  lab_email: '',
  lab_phone: '',
  lab_timing: '',
  lab_logo_base64: '',
  doctor_name: '',
  doctor_qualification: '',
};

@Injectable()
export class LabSettingsService {
  constructor(
    @InjectRepository(LabSetting)
    private readonly repo: Repository<LabSetting>,
  ) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.repo.find();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async upsertMany(data: Record<string, string>): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(data)) {
      await this.repo.upsert({ key, value }, ['key']);
    }
    return this.getAll();
  }
}
