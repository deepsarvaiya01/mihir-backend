import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private sanitize(user: User) {
    const { passwordHash, refreshTokenHash, ...safe } = user;
    void passwordHash;
    void refreshTokenHash;
    return safe;
  }

  async getAll() {
    const users = await this.usersRepository.find({ order: { id: 'ASC' } });
    return users.map((u) => this.sanitize(u));
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already in use');
    }

    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;
    if (dto.role) user.role = dto.role;
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 10);

    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async delete(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.softDelete(id);
    return { message: 'User archived successfully' };
  }

  async getArchived() {
    const users = await this.usersRepository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: 'DESC' },
    });
    return users.map(u => this.sanitize(u));
  }

  async restore(id: number) {
    const user = await this.usersRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.restore(id);
    return { message: 'User restored successfully' };
  }

  async permanentlyDelete(id: number) {
    const user = await this.usersRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.remove(user);
    return { message: 'User permanently deleted' };
  }

  async deactivate(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async activate(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = true;
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }
}
