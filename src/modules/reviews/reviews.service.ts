import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { HospitalModel } from '../../database/models/hospital.model';
import { HospitalUnitModel } from '../../database/models/hospital-unit.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
import { UnitModel } from '../../database/models/unit.model';
import { UserModel } from '../../database/models/user.model';
import { REVIEW_RESPONSE } from './constants/review.response';
import { CreateReviewDto } from './dto/create-review.dto';
import { HospitalReviewsResponseDto } from './dto/hospital-reviews-response.dto';
import { ListHospitalReviewsQueryDto } from './dto/list-hospital-reviews-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,
    @InjectModel(HospitalModel)
    private readonly hospitalModel: typeof HospitalModel,
    @InjectModel(HospitalUnitModel)
    private readonly hospitalUnitModel: typeof HospitalUnitModel,
  ) {}

  async create(
    dto: CreateReviewDto,
    user: AuthenticatedUser,
  ): Promise<ControllerResponse<ReviewResponseDto>> {
    try {
      const hospital = await this.hospitalModel.findByPk(dto.hospitalId);

      if (!hospital) {
        throw new NotFoundException(REVIEW_RESPONSE.HOSPITAL_NOT_FOUND);
      }

      const hospitalUnit = await this.hospitalUnitModel.findOne({
        where: { hospitalId: dto.hospitalId, unitId: dto.unitId },
        include: [UnitModel],
      });

      if (!hospitalUnit?.unit) {
        throw new NotFoundException(REVIEW_RESPONSE.UNIT_NOT_FOUND);
      }

      const duplicate = await this.reviewModel.findOne({
        where: { hospitalId: dto.hospitalId, userId: user.id },
      });

      if (duplicate) {
        throw new BadRequestException(REVIEW_RESPONSE.DUPLICATE_REVIEW);
      }

      const createdReview = await this.reviewModel.create({
        hospitalId: dto.hospitalId,
        unitId: dto.unitId,
        userId: user.id,
        roleId: user.roleId,
        rating: dto.rating,
        comment: dto.comment.trim(),
        employmentType: dto.employmentType.trim().toLowerCase(),
        shiftType: dto.shiftType.trim().toLowerCase(),
        status: 'pending',
      });

      const review = await this.reviewModel.findByPk(createdReview.id, {
        include: [UnitModel, UserModel, RoleModel],
      });

      if (!review) {
        throw new NotFoundException(REVIEW_RESPONSE.NOT_FOUND);
      }

      return {
        message: REVIEW_RESPONSE.CREATED,
        data: this.toReviewResponse(review),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ReviewsService.name,
        operation: 'review creation',
        uniqueConstraintMessage: REVIEW_RESPONSE.DUPLICATE_REVIEW,
        uniqueConstraintType: 'badRequest',
        badRequestMessage: REVIEW_RESPONSE.DUPLICATE_REVIEW,
      });
    }
  }

  async findApprovedByHospital(
    hospitalId: number,
    query: ListHospitalReviewsQueryDto,
  ): Promise<ControllerResponse<HospitalReviewsResponseDto>> {
    try {
      const hospital = await this.hospitalModel.findByPk(hospitalId);

      if (!hospital) {
        throw new NotFoundException(REVIEW_RESPONSE.HOSPITAL_NOT_FOUND);
      }

      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const offset = (page - 1) * limit;

      const { rows, count } = await this.reviewModel.findAndCountAll({
        where: { hospitalId, status: 'approved' },
        include: [UnitModel, UserModel, RoleModel],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      return {
        message: REVIEW_RESPONSE.FETCH_BY_HOSPITAL,
        data: {
          items: rows.map((review) => this.toReviewResponse(review)),
          pagination: {
            page,
            limit,
            total: count,
            totalPages: count === 0 ? 0 : Math.ceil(count / limit),
          },
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ReviewsService.name,
        operation: 'hospital review listing',
      });
    }
  }

  private toReviewResponse(review: ReviewModel): ReviewResponseDto {
    return {
      id: review.id,
      hospitalId: review.hospitalId,
      unitId: review.unitId,
      unitName: review.unit?.name ?? '',
      userId: review.userId,
      userFullName: review.user?.fullName ?? '',
      roleId: review.roleId,
      roleName: review.role?.name ?? '',
      rating: review.rating,
      comment: review.comment,
      employmentType: review.employmentType,
      shiftType: review.shiftType,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
