import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HOSPITAL_RESPONSE } from './constants/hospital.response';
import { HospitalsService } from './hospitals.service';

describe('HospitalsService', () => {
  let service: HospitalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HospitalsService],
    }).compile();

    service = module.get<HospitalsService>(HospitalsService);
  });

  it('should return all hospitals', () => {
    const result = service.findAll();
    expect(result.message).toBe(HOSPITAL_RESPONSE.FETCH_ALL);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should return a hospital by id', () => {
    const result = service.findById('1');
    expect(result.message).toBe(HOSPITAL_RESPONSE.FETCH_ONE);
    expect(result.data.id).toBe('1');
  });

  it('should throw when hospital is not found', () => {
    expect(() => service.findById('missing')).toThrow(NotFoundException);
  });

  it('should report existence correctly', () => {
    expect(service.exists('1')).toBe(true);
    expect(service.exists('missing')).toBe(false);
  });
});
