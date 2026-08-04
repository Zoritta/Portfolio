import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';

describe('ExperienceController', () => {
  let controller: ExperienceController;

  const serviceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperienceController],
      providers: [{ provide: ExperienceService, useValue: serviceMock }],
    }).compile();

    controller = module.get(ExperienceController);
  });

  it('findAll delegates to ExperienceService.findAll', async () => {
    const experiences = [{ id: '1', company: 'Insighta Inc.' }];
    serviceMock.findAll.mockResolvedValue(experiences);

    const result = await controller.findAll();

    expect(result).toBe(experiences);
    expect(serviceMock.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to ExperienceService.findOne with the id param', async () => {
    const experience = { id: '1', company: 'Insighta Inc.' };
    serviceMock.findOne.mockResolvedValue(experience);

    const result = await controller.findOne('1');

    expect(result).toBe(experience);
    expect(serviceMock.findOne).toHaveBeenCalledWith('1');
  });
});
