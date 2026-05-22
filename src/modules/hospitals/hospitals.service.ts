import { Injectable, NotFoundException } from '@nestjs/common';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { HOSPITAL_RESPONSE } from './constants/hospital.response';
import { HOSPITALS_MOCK } from './data/hospitals.mock';
import { Hospital } from './interfaces/hospital.interface';

/** In-memory hospital store — swap for a repository when Sequelize is integrated. */
@Injectable()
export class HospitalsService {
  private readonly hospitals: Hospital[] = [...HOSPITALS_MOCK];

  findAll(): ControllerResponse<Hospital[]> {
    return {
      message: HOSPITAL_RESPONSE.FETCH_ALL,
      data: this.hospitals,
    };
  }

  findById(id: string): ControllerResponse<Hospital> {
    const hospital = this.hospitals.find((item) => item.id === id);

    if (!hospital) {
      throw new NotFoundException(HOSPITAL_RESPONSE.NOT_FOUND);
    }

    return {
      message: HOSPITAL_RESPONSE.FETCH_ONE,
      data: hospital,
    };
  }

  /** Used by ReviewsService to validate hospitalId before DB layer exists. */
  exists(id: string): boolean {
    return this.hospitals.some((hospital) => hospital.id === id);
  }
}
