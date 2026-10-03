import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const EDUCATION_PROVIDER = 'Jensen Yrkeshögskola';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const entries = await this.prisma.experience.findMany({ orderBy: { startDate: 'desc' } });
    // Work experience first, education last — each group keeps its startDate-desc order.
    return [
      ...entries.filter((entry) => entry.company !== EDUCATION_PROVIDER),
      ...entries.filter((entry) => entry.company === EDUCATION_PROVIDER),
    ];
  }

  async findOne(id: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
    });
    if (!experience) {
      throw new NotFoundException(`Experience ${id} not found`);
    }
    return experience;
  }
}
