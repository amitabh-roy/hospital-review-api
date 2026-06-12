import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op } from 'sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { ContactSubmissionModel } from '../../database/models/contact-submission.model';
import { HospitalModel } from '../../database/models/hospital.model';
import { LoginEventModel } from '../../database/models/login-event.model';
import { ReviewReportModel } from '../../database/models/review-report.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
import { VerificationSubmissionModel } from '../../database/models/verification-submission.model';
import { UnitModel } from '../../database/models/unit.model';
import { ADMIN_RESPONSE } from './constants/admin.response';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';

type PlatformEvent = {
  id: string;
  tone: 'ok' | 'warn';
  description: string;
  createdAt: Date;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,
    @InjectModel(VerificationSubmissionModel)
    private readonly verificationModel: typeof VerificationSubmissionModel,
    @InjectModel(ContactSubmissionModel)
    private readonly contactModel: typeof ContactSubmissionModel,
    @InjectModel(ReviewReportModel)
    private readonly reviewReportModel: typeof ReviewReportModel,
    @InjectModel(LoginEventModel)
    private readonly loginEventModel: typeof LoginEventModel,
    @InjectModel(HospitalModel)
    private readonly hospitalModel: typeof HospitalModel,
  ) {}

  async getStats(): Promise<ControllerResponse<AdminStatsResponseDto>> {
    try {
      const [
        totalUsers,
        verifiedUsers,
        pendingVerifications,
        pendingReviews,
        unreadMessages,
        flaggedReviews,
        flaggedAccounts,
      ] = await Promise.all([
        this.userModel.count({
          include: [
            {
              model: RoleModel,
              where: { name: { [Op.ne]: 'admin' } },
              required: true,
            },
          ],
        }),
        this.userModel.count({ where: { verificationStatus: 'verified' } }),
        this.verificationModel.count({ where: { status: 'pending' } }),
        this.reviewModel.count({ where: { status: 'pending' } }),
        this.contactModel.count({ where: { isRead: false } }),
        this.reviewReportModel.count({ where: { status: 'pending' } }),
        this.userModel.count({ where: { verificationStatus: 'rejected' } }),
      ]);

      return {
        message: ADMIN_RESPONSE.STATS_FETCHED,
        data: {
          totalUsers,
          verifiedUsers,
          pendingVerifications,
          pendingReviews,
          unreadMessages,
          flaggedReviews,
          flaggedAccounts,
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: AdminService.name,
        operation: 'admin stats',
      });
    }
  }

  async listUsers(): Promise<
    ControllerResponse<{ items: AdminUserResponseDto[] }>
  > {
    try {
      const users = await this.userModel.findAll({
        include: [RoleModel],
        order: [['createdAt', 'DESC']],
      });

      const reviewCounts = (await this.reviewModel.findAll({
        attributes: ['userId', [fn('COUNT', col('id')), 'count']],
        group: ['userId'],
        raw: true,
      })) as unknown as Array<{ userId: number; count: string }>;

      const countByUser = new Map(
        reviewCounts.map((row) => [row.userId, Number(row.count)]),
      );

      const items = users
        .filter((user) => user.role?.name !== 'admin')
        .map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId,
          roleName: user.role?.name ?? '',
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
          reviewCount: countByUser.get(user.id) ?? 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));

      return {
        message: ADMIN_RESPONSE.USERS_FETCHED,
        data: { items },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: AdminService.name,
        operation: 'admin user listing',
      });
    }
  }

  async listFlaggedAccounts(): Promise<
    ControllerResponse<{ items: AdminUserResponseDto[] }>
  > {
    try {
      const users = await this.userModel.findAll({
        where: { verificationStatus: 'rejected' },
        include: [RoleModel],
        order: [['updatedAt', 'DESC']],
      });

      const items = users
        .filter((user) => user.role?.name !== 'admin')
        .map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId,
          roleName: user.role?.name ?? '',
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
          reviewCount: 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));

      return {
        message: ADMIN_RESPONSE.FLAGGED_ACCOUNTS_FETCHED,
        data: { items },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: AdminService.name,
        operation: 'flagged account listing',
      });
    }
  }

  async getSecurityActivity(
    admin: AuthenticatedUser,
  ): Promise<
    ControllerResponse<{
      adminProfile: {
        email: string;
        fullName: string;
        updatedAt: Date;
      };
      recentLogins: Array<{
        id: number;
        email: string;
        success: boolean;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      }>;
      platformEvents: PlatformEvent[];
    }>
  > {
    try {
      const [adminUser, recentLogins, recentUsers, recentReviews, recentVerifications, recentReports] =
        await Promise.all([
          this.userModel.findByPk(admin.id),
          this.loginEventModel.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50,
          }),
          this.userModel.findAll({
            include: [RoleModel],
            order: [['createdAt', 'DESC']],
            limit: 10,
          }),
          this.reviewModel.findAll({
            include: [HospitalModel, UserModel],
            order: [['createdAt', 'DESC']],
            limit: 10,
          }),
          this.verificationModel.findAll({
            include: [UserModel],
            order: [['createdAt', 'DESC']],
            limit: 10,
          }),
          this.reviewReportModel.findAll({
            include: [
              {
                model: ReviewModel,
                include: [HospitalModel],
              },
            ],
            order: [['createdAt', 'DESC']],
            limit: 10,
          }),
        ]);

      const platformEvents: PlatformEvent[] = [
        ...recentUsers
          .filter((user) => user.role?.name !== 'admin')
          .map((user) => ({
            id: `signup-${user.id}`,
            tone: 'ok' as const,
            description: `New signup — ${user.fullName}`,
            createdAt: user.createdAt,
          })),
        ...recentReviews.map((review) => ({
          id: `review-${review.id}`,
          tone: 'ok' as const,
          description: `Review submitted — ${review.hospital?.name ?? `Hospital #${review.hospitalId}`}`,
          createdAt: review.createdAt,
        })),
        ...recentVerifications.map((submission) => ({
          id: `verification-${submission.id}`,
          tone: 'ok' as const,
          description: `Verification submitted — ${submission.user?.fullName ?? `User #${submission.userId}`}`,
          createdAt: submission.createdAt,
        })),
        ...recentReports.map((report) => ({
          id: `report-${report.id}`,
          tone: 'warn' as const,
          description: `Review flagged — ${report.review?.hospital?.name ?? `Review #${report.reviewId}`}`,
          createdAt: report.createdAt,
        })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 25);

      return {
        message: ADMIN_RESPONSE.SECURITY_FETCHED,
        data: {
          adminProfile: {
            email: adminUser?.email ?? admin.email,
            fullName: adminUser?.fullName ?? admin.fullName,
            updatedAt: adminUser?.updatedAt ?? admin.updatedAt,
          },
          recentLogins: recentLogins.map((event) => ({
            id: event.id,
            email: event.email,
            success: event.success,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            createdAt: event.createdAt,
          })),
          platformEvents,
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: AdminService.name,
        operation: 'security activity',
      });
    }
  }

  async exportReviewsCsv(): Promise<string> {
    try {
      const reviews = await this.reviewModel.findAll({
        include: [HospitalModel, UnitModel, RoleModel],
        order: [['createdAt', 'DESC']],
      });

      const headers = [
        'id',
        'hospital',
        'unit',
        'role',
        'status',
        'rating',
        'comment',
        'employment_type',
        'shift_type',
        'hourly_rate',
        'patient_ratio',
        'created_at',
      ];

      const escape = (value: unknown) => {
        const text = value === null || value === undefined ? '' : String(value);
        return `"${text.replace(/"/g, '""')}"`;
      };

      const rows = reviews.map((review) =>
        [
          review.id,
          review.hospital?.name ?? review.hospitalId,
          review.unit?.name ?? review.unitId,
          review.role?.name ?? review.roleId,
          review.status,
          review.rating,
          review.comment,
          review.employmentType,
          review.shiftType,
          review.hourlyRate,
          review.patientRatio,
          review.createdAt.toISOString(),
        ]
          .map(escape)
          .join(','),
      );

      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      handleDatabaseException(error, {
        context: AdminService.name,
        operation: 'review export',
      });
    }
  }
}
