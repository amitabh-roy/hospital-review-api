import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { HospitalModel } from '../../database/models/hospital.model';
import { HospitalUnitModel } from '../../database/models/hospital-unit.model';
import { ReviewModel } from '../../database/models/review.model';
import { UnitModel } from '../../database/models/unit.model';
import { HOSPITAL_RESPONSE } from './constants/hospital.response';
import { HospitalDetailResponseDto } from './dto/hospital-detail-response.dto';
import { HospitalResponseDto } from './dto/hospital-response.dto';
import { HospitalsListResponseDto } from './dto/hospitals-list-response.dto';
import { ListHospitalsQueryDto } from './dto/list-hospitals-query.dto';
import { SearchHospitalsQueryDto } from './dto/search-hospitals-query.dto';
import { UnitResponseDto } from './dto/unit-response.dto';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectModel(HospitalModel)
    private readonly hospitalModel: typeof HospitalModel,
    @InjectModel(HospitalUnitModel)
    private readonly hospitalUnitModel: typeof HospitalUnitModel,
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,
  ) {}

  async findAll(
    query: ListHospitalsQueryDto,
  ): Promise<ControllerResponse<HospitalsListResponseDto>> {
    try {
      const data = await this.findHospitals(query);

      return {
        message: HOSPITAL_RESPONSE.FETCH_ALL,
        data,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: HospitalsService.name,
        operation: 'hospital listing',
      });
    }
  }

  async searchHospitals(
    query: SearchHospitalsQueryDto,
  ): Promise<ControllerResponse<HospitalsListResponseDto>> {
    try {
      const data = await this.findHospitals(query, query.query.trim());

      return {
        message: HOSPITAL_RESPONSE.FETCH_SEARCH_RESULTS,
        data,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: HospitalsService.name,
        operation: 'hospital search',
      });
    }
  }

  async findById(
    id: number,
  ): Promise<ControllerResponse<HospitalDetailResponseDto>> {
    try {
      const hospital = await this.hospitalModel.findByPk(id);

      if (!hospital) {
        throw new NotFoundException(HOSPITAL_RESPONSE.NOT_FOUND);
      }

      const [hospitalUnits, approvedReviewCount] = await Promise.all([
        this.hospitalUnitModel.findAll({
          where: { hospitalId: id },
          include: [UnitModel],
        }),
        this.reviewModel.count({
          where: { hospitalId: id, status: 'approved' },
        }),
      ]);

      const units = hospitalUnits
        .map((hospitalUnit) => hospitalUnit.unit)
        .filter((unit): unit is UnitModel => Boolean(unit))
        .sort((left, right) => left.name.localeCompare(right.name));

      return {
        message: HOSPITAL_RESPONSE.FETCH_ONE,
        data: {
          ...this.toHospitalResponse(hospital),
          units: units.map((unit) => this.toUnitResponse(unit)),
          approvedReviewCount,
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: HospitalsService.name,
        operation: 'hospital detail lookup',
      });
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      return (await this.hospitalModel.count({ where: { id } })) > 0;
    } catch (error) {
      handleDatabaseException(error, {
        context: HospitalsService.name,
        operation: 'hospital existence check',
      });
    }
  }

  private async findHospitals(
    query: ListHospitalsQueryDto,
    searchText?: string,
  ): Promise<HospitalsListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const where: Record<string | symbol, unknown> = {};

    if (query.city) {
      where.city = { [Op.iLike]: `%${query.city.trim()}%` };
    }

    if (query.state) {
      where.state = { [Op.iLike]: `%${query.state.trim()}%` };
    }

    if (query.facilityType) {
      where.facilityType = { [Op.iLike]: `%${query.facilityType.trim()}%` };
    }

    if (query.minRating !== undefined || query.maxRating !== undefined) {
      where.averageRating = {
        ...(query.minRating !== undefined ? { [Op.gte]: query.minRating } : {}),
        ...(query.maxRating !== undefined ? { [Op.lte]: query.maxRating } : {}),
      };
    }

    if (searchText) {
      where[Op.or] = [
        { cmsId: { [Op.iLike]: `%${searchText}%` } },
        { name: { [Op.iLike]: `%${searchText}%` } },
        { city: { [Op.iLike]: `%${searchText}%` } },
        { state: { [Op.iLike]: `%${searchText}%` } },
        { facilityType: { [Op.iLike]: `%${searchText}%` } },
      ];
    }

    const { rows, count } = await this.hospitalModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['averageRating', 'DESC'],
        ['name', 'ASC'],
      ],
    });

    return {
      items: rows.map((hospital) => this.toHospitalResponse(hospital)),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: count === 0 ? 0 : Math.ceil(count / limit),
      },
    };
  }

  private toHospitalResponse(hospital: HospitalModel): HospitalResponseDto {
    return {
      id: hospital.id,
      cmsId: hospital.cmsId,
      name: hospital.name,
      city: hospital.city,
      state: hospital.state,
      facilityType: hospital.facilityType,
      averageRating: Number(hospital.averageRating ?? 0),
    };
  }

  private toUnitResponse(unit: UnitModel): UnitResponseDto {
    return {
      id: unit.id,
      name: unit.name,
    };
  }
}
