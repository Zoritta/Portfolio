import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.experience.findMany({ orderBy: { startDate: 'desc' } });
  }

  async findOne(id: string) {
    const experience = await this.prisma.experience.findUnique({ where: { id } });
    if (!experience) {
      throw new NotFoundException(`Experience ${id} not found`);
    }
    return experience;
  }
}
