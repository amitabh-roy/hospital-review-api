import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { TempFileStorageService } from '../../common/services/temp-file-storage.service';
import { assertSelfieLiveness } from '../../common/utils/selfie-liveness.util';
import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
import {
  IdentityMethod,
  VerificationSubmissionModel,
} from '../../database/models/verification-submission.model';
import { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { VERIFICATION_RESPONSE } from './constants/verification.response';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { VerificationSubmissionResponseDto } from './dto/verification-submission-response.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(VerificationSubmissionModel)
    private readonly verificationModel: typeof VerificationSubmissionModel,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    private readonly tempFileStorage: TempFileStorageService,
  ) {}

  async submit(
    user: AuthenticatedUser,
    identityMethod: IdentityMethod,
    badgeFile: Express.Multer.File,
    identityFile: Express.Multer.File,
    captureTimestamp?: string,
  ): Promise<ControllerResponse<VerificationSubmissionResponseDto>> {
    try {
      if (identityMethod === 'selfie') {
        assertSelfieLiveness(identityFile, captureTimestamp);
      }

      if (user.verificationStatus === 'verified') {
        throw new BadRequestException(VERIFICATION_RESPONSE.ALREADY_VERIFIED);
      }

      const existingPending = await this.verificationModel.findOne({
        where: { userId: user.id, status: 'pending' },
      });

      if (existingPending) {
        throw new BadRequestException(VERIFICATION_RESPONSE.ALREADY_PENDING);
      }

      const badgeFilePath = await this.tempFileStorage.saveUploadedFile(
        badgeFile,
        'badge',
      );
      const identityFilePath = await this.tempFileStorage.saveUploadedFile(
        identityFile,
        'identity',
      );

      const submission = await this.verificationModel.create({
        userId: user.id,
        identityMethod,
        status: 'pending',
        badgeFilePath,
        identityFilePath,
      });

      const loaded = await this.loadSubmission(submission.id);

      return {
        message: VERIFICATION_RESPONSE.SUBMITTED,
        data: this.toResponse(loaded),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: VerificationService.name,
        operation: 'verification submission',
      });
    }
  }

  async listPending(): Promise<
    ControllerResponse<{ items: VerificationSubmissionResponseDto[] }>
  > {
    try {
      const items = await this.verificationModel.findAll({
        where: { status: 'pending' },
        include: [{ model: UserModel, include: [RoleModel] }],
        order: [['createdAt', 'ASC']],
      });

      return {
        message: VERIFICATION_RESPONSE.FETCHED,
        data: {
          items: items.map((item) => this.toResponse(item)),
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: VerificationService.name,
        operation: 'list pending verifications',
      });
    }
  }

  async getImage(
    submissionId: number,
    type: 'badge' | 'identity',
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    const submission = await this.verificationModel.findByPk(submissionId);

    if (!submission || submission.status !== 'pending') {
      throw new NotFoundException(VERIFICATION_RESPONSE.NOT_FOUND);
    }

    const filePath =
      type === 'badge' ? submission.badgeFilePath : submission.identityFilePath;

    if (!filePath) {
      throw new NotFoundException(VERIFICATION_RESPONSE.NOT_FOUND);
    }

    const buffer = await this.tempFileStorage.readFile(filePath);
    const mimeType = this.guessMimeType(filePath);

    return { buffer, mimeType };
  }

  async review(
    submissionId: number,
    dto: ReviewVerificationDto,
  ): Promise<ControllerResponse<VerificationSubmissionResponseDto>> {
    try {
      const submission = await this.verificationModel.findByPk(submissionId, {
        include: [{ model: UserModel, include: [RoleModel] }],
      });

      if (!submission || submission.status !== 'pending') {
        throw new NotFoundException(VERIFICATION_RESPONSE.NOT_FOUND);
      }

      if (dto.status === 'pending') {
        throw new BadRequestException(
          'Review decision must be approved or rejected',
        );
      }

      await this.tempFileStorage.deleteFiles([
        submission.badgeFilePath,
        submission.identityFilePath,
      ]);

      await submission.update({
        status: dto.status,
        adminNote: dto.adminNote?.trim() || null,
        reviewedAt: new Date(),
        badgeFilePath: null,
        identityFilePath: null,
      });

      const user = await this.userModel.findByPk(submission.userId);

      if (user) {
        await user.update({
          verificationStatus:
            dto.status === 'approved' ? 'verified' : 'rejected',
        });
      }

      await submission.reload({
        include: [{ model: UserModel, include: [RoleModel] }],
      });

      return {
        message: VERIFICATION_RESPONSE.UPDATED,
        data: this.toResponse(submission),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: VerificationService.name,
        operation: 'review verification submission',
      });
    }
  }

  private async loadSubmission(
    id: number,
  ): Promise<VerificationSubmissionModel> {
    const submission = await this.verificationModel.findByPk(id, {
      include: [{ model: UserModel, include: [RoleModel] }],
    });

    if (!submission) {
      throw new NotFoundException(VERIFICATION_RESPONSE.NOT_FOUND);
    }

    return submission;
  }

  private toResponse(
    submission: VerificationSubmissionModel,
  ): VerificationSubmissionResponseDto {
    return {
      id: submission.id,
      userId: submission.userId,
      userFullName: submission.user?.fullName,
      userEmail: submission.user?.email,
      userRoleName: submission.user?.role?.name,
      identityMethod: submission.identityMethod,
      status: submission.status,
      hasBadgeImage: Boolean(submission.badgeFilePath),
      hasIdentityImage: Boolean(submission.identityFilePath),
      adminNote: submission.adminNote,
      reviewedAt: submission.reviewedAt,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }

  private guessMimeType(filePath: string): string {
    const lower = filePath.toLowerCase();

    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.heic')) return 'image/heic';
    if (lower.endsWith('.pdf')) return 'application/pdf';

    return 'image/jpeg';
  }
}
