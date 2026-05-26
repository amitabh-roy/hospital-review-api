import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Taylor Brooks' })
  fullName: string;

  @ApiProperty({ example: 'taylor.brooks@example.com' })
  email: string;

  @ApiProperty({ example: 1 })
  roleId: number;

  @ApiProperty({ example: 'nurse' })
  roleName: string;

  @ApiProperty({ example: false })
  isVerified: boolean;

  @ApiProperty({ example: 'pending' })
  verificationStatus: string;

  @ApiProperty({ example: '2026-05-26T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-26T08:00:00.000Z' })
  updatedAt: Date;
}
