import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op } from 'sequelize';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { ContactSubmissionModel } from '../../database/models/contact-submission.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
import { VerificationSubmissionModel } from '../../database/models/verification-submission.model';
import { ADMIN_RESPONSE } from './constants/admin.response';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';

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
  ) {}

  async getStats(): Promise<ControllerResponse<AdminStatsResponseDto>> {
    try {
      const [
        totalUsers,
        verifiedUsers,
        pendingVerifications,
        pendingReviews,
        unreadMessages,
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
      ]);

      return {
        message: ADMIN_RESPONSE.STATS_FETCHED,
        data: {
          totalUsers,
          verifiedUsers,
          pendingVerifications,
          pendingReviews,
          unreadMessages,
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
}
