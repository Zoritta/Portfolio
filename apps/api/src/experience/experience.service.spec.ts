import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExperienceService', () => {
  let service: ExperienceService;

  const prismaMock = {
    experience: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(ExperienceService);
  });

  describe('findAll', () => {
    it('queries ordered by startDate descending', async () => {
      const experiences = [{ id: '1', company: 'Insighta Inc.' }];
      prismaMock.experience.findMany.mockResolvedValue(experiences);

      await service.findAll();

      expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
        orderBy: { startDate: 'desc' },
      });
    });

    it('moves education entries after work experience, preserving relative order within each group', async () => {
      const education = { id: 'edu-1', company: 'Jensen Yrkeshögskola' };
      const workNewer = { id: 'work-1', company: 'Insighta Inc.' };
      const workOlder = { id: 'work-2', company: 'Polestar' };
      // Prisma already returned these startDate-desc, with education interleaved.
      prismaMock.experience.findMany.mockResolvedValue([workNewer, education, workOlder]);

      const result = await service.findAll();

      expect(result).toEqual([workNewer, workOlder, education]);
    });
  });

  describe('findOne', () => {
    it('returns the experience when found', async () => {
      const experience = { id: '1', company: 'Insighta Inc.' };
      prismaMock.experience.findUnique.mockResolvedValue(experience);

      const result = await service.findOne('1');

      expect(result).toBe(experience);
      expect(prismaMock.experience.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('throws NotFoundException when the experience does not exist', async () => {
      prismaMock.experience.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
