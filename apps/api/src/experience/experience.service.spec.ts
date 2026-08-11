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
    it('returns all experiences ordered by startDate descending', async () => {
      const experiences = [{ id: '1', company: 'Insighta Inc.' }];
      prismaMock.experience.findMany.mockResolvedValue(experiences);

      const result = await service.findAll();

      expect(result).toBe(experiences);
      expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
        orderBy: { startDate: 'desc' },
      });
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
