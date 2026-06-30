import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import uploadConfig from '../../config/upload.config';
import { IDENTITY_METHODS } from '../../database/models/verification-submission.model';
import type { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { VERIFICATION_RESPONSE } from './constants/verification.response';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { VerificationService } from './verification.service';

const verificationUploadLimits = uploadConfig();

@ApiTags('Verification')
@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verifications')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'badge', maxCount: 1 },
        { name: 'identity', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: verificationUploadLimits.maxFileSizeBytes },
      },
    ),
  )
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFiles()
    files: {
      badge?: Express.Multer.File[];
      identity?: Express.Multer.File[];
    },
    @Body('identityMethod') identityMethodRaw?: string,
    @Body('captureTimestamp') captureTimestamp?: string,
  ) {
    const badgeFile = files.badge?.[0];
    const identityFile = files.identity?.[0];

    if (!badgeFile || !identityFile) {
      throw new BadRequestException(VERIFICATION_RESPONSE.FILES_REQUIRED);
    }

    const identityMethod = identityMethodRaw?.trim() as
      | (typeof IDENTITY_METHODS)[number]
      | undefined;

    if (!identityMethod || !IDENTITY_METHODS.includes(identityMethod)) {
      throw new BadRequestException(
        VERIFICATION_RESPONSE.INVALID_IDENTITY_METHOD,
      );
    }

    return this.verificationService.submit(
      user,
      identityMethod,
      badgeFile,
      identityFile,
      captureTimestamp,
    );
  }

  @Get('admin/verifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listPending() {
    return this.verificationService.listPending();
  }

  @Get('admin/verifications/:id/images/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    if (type !== 'badge' && type !== 'identity') {
      throw new BadRequestException('Image type must be badge or identity');
    }

    const { buffer, mimeType } = await this.verificationService.getImage(
      id,
      type,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  }

  @Patch('admin/verifications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.verificationService.review(id, dto);
  }
}
