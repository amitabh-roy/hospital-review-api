import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { USER_VERIFICATION_STATUSES } from '../../../database/models/user.model';

export class AdminUpdateVerificationDto {
  @ApiProperty({ enum: USER_VERIFICATION_STATUSES, example: 'verified' })
  @IsIn(USER_VERIFICATION_STATUSES)
  verificationStatus: (typeof USER_VERIFICATION_STATUSES)[number];
}
