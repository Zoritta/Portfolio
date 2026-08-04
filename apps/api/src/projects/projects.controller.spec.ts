import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  const serviceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(ProjectsController);
  });

  it('findAll delegates to ProjectsService.findAll', async () => {
    const projects = [{ id: '1', title: 'Project A' }];
    serviceMock.findAll.mockResolvedValue(projects);

    const result = await controller.findAll();

    expect(result).toBe(projects);
    expect(serviceMock.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to ProjectsService.findOne with the id param', async () => {
    const project = { id: '1', title: 'Project A' };
    serviceMock.findOne.mockResolvedValue(project);

    const result = await controller.findOne('1');

    expect(result).toBe(project);
    expect(serviceMock.findOne).toHaveBeenCalledWith('1');
  });
});
