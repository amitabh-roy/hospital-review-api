import { Test, TestingModule } from '@nestjs/testing';

import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';

describe('HospitalsController', () => {
  let controller: HospitalsController;

  const hospitalsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HospitalsController],
      providers: [{ provide: HospitalsService, useValue: hospitalsService }],
    }).compile();

    controller = module.get<HospitalsController>(HospitalsController);
  });

  it('should delegate findAll to service', () => {
    hospitalsService.findAll.mockReturnValue({ message: 'ok', data: [] });
    controller.findAll();
    expect(hospitalsService.findAll).toHaveBeenCalled();
  });

  it('should delegate findById to service', () => {
    hospitalsService.findById.mockReturnValue({
      message: 'ok',
      data: { id: '1' },
    });
    controller.findOne('1');
    expect(hospitalsService.findById).toHaveBeenCalledWith('1');
  });
});
