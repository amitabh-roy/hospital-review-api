import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op } from 'sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { toHospitalSlug } from '../../common/utils/hospital-slug.util';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { HospitalModel } from '../../database/models/hospital.model';
import { ReviewModel } from '../../database/models/review.model';
import { SavedHospitalModel } from '../../database/models/saved-hospital.model';
import { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { SAVED_HOSPITAL_RESPONSE } from './constants/saved-hospital.response';
import { SavedHospitalResponseDto } from './dto/saved-hospital-response.dto';

@Injectable()
export class SavedHospitalsService {
  constructor(
    @InjectModel(SavedHospitalModel)
    private readonly savedHospitalModel: typeof SavedHospitalModel,
    @InjectModel(HospitalModel)
    private readonly hospitalModel: typeof HospitalModel,
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,
  ) {}

  async list(
    user: AuthenticatedUser,
  ): Promise<ControllerResponse<{ items: SavedHospitalResponseDto[] }>> {
    try {
      const rows = await this.savedHospitalModel.findAll({
        where: { userId: user.id },
        include: [HospitalModel],
        order: [['createdAt', 'DESC']],
      });

      const hospitalIds = rows.map((row) => row.hospitalId);
      const reviewCounts = await this.getApprovedReviewCounts(hospitalIds);

      return {
        message: SAVED_HOSPITAL_RESPONSE.FETCHED,
        data: {
          items: rows.map((row) =>
            this.toResponse(row, reviewCounts.get(row.hospitalId) ?? 0),
          ),
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: SavedHospitalsService.name,
        operation: 'list saved hospitals',
      });
    }
  }

  async save(
    user: AuthenticatedUser,
    hospitalId: number,
  ): Promise<ControllerResponse<SavedHospitalResponseDto>> {
    try {
      const hospital = await this.hospitalModel.findByPk(hospitalId);

      if (!hospital) {
        throw new NotFoundException(SAVED_HOSPITAL_RESPONSE.HOSPITAL_NOT_FOUND);
      }

      const existing = await this.savedHospitalModel.findOne({
        where: { userId: user.id, hospitalId },
        include: [HospitalModel],
      });

      if (existing) {
        return {
          message: SAVED_HOSPITAL_RESPONSE.ALREADY_SAVED,
          data: this.toResponse(existing, 0),
        };
      }

      const created = await this.savedHospitalModel.create({
        userId: user.id,
        hospitalId,
      });

      const loaded = await this.savedHospitalModel.findByPk(created.id, {
        include: [HospitalModel],
      });

      if (!loaded) {
        throw new NotFoundException(SAVED_HOSPITAL_RESPONSE.NOT_FOUND);
      }

      return {
        message: SAVED_HOSPITAL_RESPONSE.SAVED,
        data: this.toResponse(loaded, 0),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: SavedHospitalsService.name,
        operation: 'save hospital',
        uniqueConstraintMessage: SAVED_HOSPITAL_RESPONSE.ALREADY_SAVED,
        uniqueConstraintType: 'conflict',
      });
    }
  }

  async remove(
    user: AuthenticatedUser,
    hospitalId: number,
  ): Promise<ControllerResponse<null>> {
    try {
      const row = await this.savedHospitalModel.findOne({
        where: { userId: user.id, hospitalId },
      });

      if (!row) {
        throw new NotFoundException(SAVED_HOSPITAL_RESPONSE.NOT_FOUND);
      }

      await row.destroy();

      return {
        message: SAVED_HOSPITAL_RESPONSE.REMOVED,
        data: null,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: SavedHospitalsService.name,
        operation: 'remove saved hospital',
      });
    }
  }

  async isSaved(userId: number, hospitalId: number): Promise<boolean> {
    const row = await this.savedHospitalModel.findOne({
      where: { userId, hospitalId },
    });

    return Boolean(row);
  }

  private async getApprovedReviewCounts(
    hospitalIds: number[],
  ): Promise<Map<number, number>> {
    if (hospitalIds.length === 0) {
      return new Map();
    }

    const rows = await this.reviewModel.findAll({
      attributes: ['hospitalId', [fn('COUNT', col('id')), 'count']],
      where: {
        hospitalId: { [Op.in]: hospitalIds },
        status: 'approved',
      },
      group: ['hospitalId'],
      raw: true,
    });

    return new Map(
      rows.map((row) => {
        const entry = row as unknown as {
          hospitalId: number;
          count: string | number;
        };

        return [Number(entry.hospitalId), Number(entry.count ?? 0)];
      }),
    );
  }

  private toResponse(
    row: SavedHospitalModel,
    approvedReviewCount = 0,
  ): SavedHospitalResponseDto {
    const hospital = row.hospital;

    return {
      id: row.id,
      hospitalId: row.hospitalId,
      slug: hospital ? toHospitalSlug(hospital.name, hospital.id) : '',
      hospitalName: hospital?.name ?? '',
      city: hospital?.city ?? '',
      state: hospital?.state ?? '',
      facilityType: hospital?.facilityType ?? '',
      averageRating: hospital ? Number(hospital.averageRating) : 0,
      approvedReviewCount,
      savedAt: row.createdAt,
    };
  }
}
