import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewAccountDeletionDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  adminNote?: string;
}
