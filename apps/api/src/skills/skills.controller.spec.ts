import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;

  const serviceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(SkillsController);
  });

  it('findAll delegates to SkillsService.findAll', async () => {
    const skills = [{ id: '1', name: 'TypeScript' }];
    serviceMock.findAll.mockResolvedValue(skills);

    const result = await controller.findAll();

    expect(result).toBe(skills);
    expect(serviceMock.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to SkillsService.findOne with the id param', async () => {
    const skill = { id: '1', name: 'TypeScript' };
    serviceMock.findOne.mockResolvedValue(skill);

    const result = await controller.findOne('1');

    expect(result).toBe(skill);
    expect(serviceMock.findOne).toHaveBeenCalledWith('1');
  });
});
