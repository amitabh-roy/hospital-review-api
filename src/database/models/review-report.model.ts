import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  DeletedAt,
} from 'sequelize-typescript';

import { ReviewModel } from './review.model';
import { UserModel } from './user.model';

export const REVIEW_REPORT_REASONS = [
  'individual',
  'false_claim',
  'not_hcp',
  'other',
] as const;
export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number];

export const REVIEW_REPORT_STATUSES = [
  'pending',
  'resolved',
  'dismissed',
] as const;
export type ReviewReportStatus = (typeof REVIEW_REPORT_STATUSES)[number];

@Table({
  tableName: 'review_reports',
  indexes: [
    {
      unique: true,
      fields: ['review_id', 'reporter_user_id'],
      name: 'review_reports_review_reporter_unique',
    },
  ],
})
export class ReviewReportModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ReviewModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'review_id',
  })
  declare reviewId: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'reporter_user_id',
  })
  declare reporterUserId: number;

  @Column({
    type: DataType.ENUM(...REVIEW_REPORT_REASONS),
    allowNull: false,
  })
  declare reason: ReviewReportReason;

  @Default('pending')
  @Column({
    type: DataType.ENUM(...REVIEW_REPORT_STATUSES),
    allowNull: false,
  })
  declare status: ReviewReportStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'admin_notes',
  })
  declare adminNotes: string | null;

  @BelongsTo(() => ReviewModel)
  declare review?: ReviewModel;

  @BelongsTo(() => UserModel, {
    foreignKey: 'reporterUserId',
    as: 'reporter',
  })
  declare reporter?: UserModel;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'deleted_at',
  })
  declare deletedAt: Date | null;
}
