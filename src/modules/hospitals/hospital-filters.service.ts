import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { HospitalModel } from '../../database/models/hospital.model';
import { HOSPITAL_RESPONSE } from './constants/hospital.response';
import { HospitalFiltersResponseDto } from './dto/hospital-filters-response.dto';
import { loadHospitalFilterOptions } from './utils/hospital-filters.util';

@Injectable()
export class HospitalFiltersService {
  constructor(
    @InjectModel(HospitalModel)
    private readonly hospitalModel: typeof HospitalModel,
  ) {}

  async getFilters(): Promise<ControllerResponse<HospitalFiltersResponseDto>> {
    try {
      const data = await loadHospitalFilterOptions(this.hospitalModel);

      return {
        message: HOSPITAL_RESPONSE.FETCH_FILTERS,
        data,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: HospitalFiltersService.name,
        operation: 'hospital filter lookup',
      });
    }
  }
}
