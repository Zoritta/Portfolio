import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SkillsService', () => {
  let service: SkillsService;

  const prismaMock = {
    skill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(SkillsService);
  });

  describe('findAll', () => {
    it('returns all skills ordered by category then proficiency descending', async () => {
      const skills = [{ id: '1', name: 'TypeScript' }];
      prismaMock.skill.findMany.mockResolvedValue(skills);

      const result = await service.findAll();

      expect(result).toBe(skills);
      expect(prismaMock.skill.findMany).toHaveBeenCalledWith({
        orderBy: [{ category: 'asc' }, { proficiency: 'desc' }],
      });
    });
  });

  describe('findOne', () => {
    it('returns the skill when found', async () => {
      const skill = { id: '1', name: 'TypeScript' };
      prismaMock.skill.findUnique.mockResolvedValue(skill);

      const result = await service.findOne('1');

      expect(result).toBe(skill);
      expect(prismaMock.skill.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('throws NotFoundException when the skill does not exist', async () => {
      prismaMock.skill.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
