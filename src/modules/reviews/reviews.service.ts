import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn } from 'sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { HospitalModel } from '../../database/models/hospital.model';
import { HospitalUnitModel } from '../../database/models/hospital-unit.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
import { UnitModel } from '../../database/models/unit.model';
import { UserModel } from '../../database/models/user.model';
import { VerificationSubmissionModel } from '../../database/models/verification-submission.model';
import { REVIEW_RESPONSE } from './constants/review.response';
import { CreateReviewDto } from './dto/create-review.dto';
import { resolveReviewRoleId } from './utils/resolve-review-role.util';
import { HospitalReviewsResponseDto } from './dto/hospital-reviews-response.dto';
import { ListHospitalReviewsQueryDto } from './dto/list-hospital-reviews-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { EmailService } from '../users/email.service';
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
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
    @InjectModel(VerificationSubmissionModel)
    private readonly verificationSubmissionModel: typeof VerificationSubmissionModel,
    private readonly emailService: EmailService,
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

      if (user.verificationStatus !== 'verified') {
        const pendingVerification = await this.verificationSubmissionModel.findOne({
          where: { userId: user.id, status: 'pending' },
        });

        if (!pendingVerification) {
          throw new BadRequestException(REVIEW_RESPONSE.VERIFICATION_REQUIRED);
        }
      }

      const roleId = await resolveReviewRoleId(
        this.roleModel,
        dto.roleName,
        user.roleId,
      );

      const createdReview = await this.reviewModel.create({
        hospitalId: dto.hospitalId,
        unitId: dto.unitId,
        userId: user.id,
        roleId,
        rating: dto.rating,
        comment: dto.comment.trim(),
        employmentType: dto.employmentType.trim().toLowerCase(),
        shiftType: dto.shiftType.trim().toLowerCase(),
        status: 'pending',
        hourlyRate: dto.hourlyRate ?? null,
        patientRatio: dto.patientRatio?.trim() || null,
        mealBreaks: dto.mealBreaks?.trim() || null,
        bathroomBreaks: dto.bathroomBreaks?.trim() || null,
        parkingCost: dto.parkingCost?.trim() || null,
        managementRating: dto.managementRating ?? null,
        wouldReturn: dto.wouldReturn ?? null,
      });

      const review = await this.reviewModel.findByPk(createdReview.id, {
        include: [UnitModel, UserModel, RoleModel],
      });

      if (!review) {
        throw new NotFoundException(REVIEW_RESPONSE.NOT_FOUND);
      }

      this.emailService.sendReviewSubmittedEmail(user.email, hospital.name);

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

      const where: Record<string, unknown> = {
        hospitalId,
        status: 'approved',
      };

      if (query.roleId) {
        where.roleId = query.roleId;
      }

      if (query.unitId) {
        where.unitId = query.unitId;
      }

      const { rows, count } = await this.reviewModel.findAndCountAll({
        where,
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

  async findByCurrentUser(
    user: AuthenticatedUser,
  ): Promise<ControllerResponse<{ items: ReviewResponseDto[] }>> {
    try {
      const reviews = await this.reviewModel.findAll({
        where: { userId: user.id },
        include: [UnitModel, UserModel, RoleModel, HospitalModel],
        order: [['createdAt', 'DESC']],
      });

      return {
        message: REVIEW_RESPONSE.FETCH_MY_REVIEWS,
        data: {
          items: reviews.map((review) => this.toReviewResponse(review)),
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ReviewsService.name,
        operation: 'current user review listing',
      });
    }
  }

  async findForAdmin(
    status?: ReviewModel['status'],
  ): Promise<ControllerResponse<{ items: ReviewResponseDto[] }>> {
    try {
      const where: Record<string, unknown> = {};

      if (status) {
        where.status = status;
      }

      const reviews = await this.reviewModel.findAll({
        where,
        include: [UnitModel, UserModel, RoleModel, HospitalModel],
        order: [['createdAt', 'DESC']],
      });

      return {
        message: REVIEW_RESPONSE.FETCH_ADMIN_REVIEWS,
        data: {
          items: reviews.map((review) => this.toReviewResponse(review)),
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: ReviewsService.name,
        operation: 'admin review listing',
      });
    }
  }

  async adminUpdateStatus(
    reviewId: number,
    status: ReviewModel['status'],
  ): Promise<ControllerResponse<ReviewResponseDto>> {
    try {
      const review: ReviewModel | null = await this.reviewModel.findByPk(
        reviewId,
        {
          include: [UnitModel, UserModel, RoleModel, HospitalModel],
        },
      );

      if (!review) {
        throw new NotFoundException(REVIEW_RESPONSE.NOT_FOUND);
      }

      const previousStatus = review.status;
      await review.update({ status });

      await this.syncHospitalAverageRating(review.hospitalId);

      if (review.user?.email && previousStatus !== status) {
        const hospitalName = review.hospital?.name ?? '';

        if (status === 'approved') {
          this.emailService.sendReviewApprovedEmail(review.user.email, hospitalName);
        } else if (status === 'rejected') {
          this.emailService.sendReviewRejectedEmail(review.user.email, hospitalName);
        }
      }

      const message =
        status === 'approved'
          ? REVIEW_RESPONSE.APPROVED
          : status === 'rejected'
            ? REVIEW_RESPONSE.REJECTED
            : REVIEW_RESPONSE.UPDATED;

      return {
        message,
        data: this.toReviewResponse(review),
      };
    } catch (error: unknown) {
      handleDatabaseException(error, {
        context: ReviewsService.name,
        operation: 'admin review status update',
      });
    }
  }

  private async syncHospitalAverageRating(hospitalId: number): Promise<void> {
    const row = (await this.reviewModel.findOne({
      attributes: [[fn('AVG', col('rating')), 'avgRating']],
      where: { hospitalId, status: 'approved' },
      raw: true,
    })) as unknown as { avgRating: string | number | null } | null;

    const averageRating = row?.avgRating ? Number(row.avgRating) : 0;

    await this.hospitalModel.update(
      { averageRating },
      { where: { id: hospitalId } },
    );
  }

  private toReviewResponse(review: ReviewModel): ReviewResponseDto {
    return {
      id: review.id,
      hospitalId: review.hospitalId,
      hospitalName: review.hospital?.name,
      unitId: review.unitId,
      unitName: review.unit?.name ?? '',
      roleId: review.roleId,
      roleName: review.role?.name ?? '',
      rating: review.rating,
      comment: review.comment,
      employmentType: review.employmentType,
      shiftType: review.shiftType,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      hourlyRate:
        review.hourlyRate === null || review.hourlyRate === undefined
          ? null
          : Number(review.hourlyRate),
      patientRatio: review.patientRatio,
      mealBreaks: review.mealBreaks,
      bathroomBreaks: review.bathroomBreaks,
      parkingCost: review.parkingCost,
      managementRating:
        review.managementRating === null ||
        review.managementRating === undefined
          ? null
          : Number(review.managementRating),
      wouldReturn: review.wouldReturn,
    };
  }
}
