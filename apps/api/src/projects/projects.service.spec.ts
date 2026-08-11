import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const prismaMock = {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  describe('findAll', () => {
    it('returns all projects ordered by createdAt ascending', async () => {
      const projects = [{ id: '1', title: 'Project A' }];
      prismaMock.project.findMany.mockResolvedValue(projects);

      const result = await service.findAll();

      expect(result).toBe(projects);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the project when found', async () => {
      const project = { id: '1', title: 'Project A' };
      prismaMock.project.findUnique.mockResolvedValue(project);

      const result = await service.findOne('1');

      expect(result).toBe(project);
      expect(prismaMock.project.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('throws NotFoundException when the project does not exist', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
