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

import { UserModel } from './user.model';

export const IDENTITY_METHODS = ['selfie', 'license'] as const;
export type IdentityMethod = (typeof IDENTITY_METHODS)[number];

export const VERIFICATION_SUBMISSION_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const;
export type VerificationSubmissionStatus =
  (typeof VERIFICATION_SUBMISSION_STATUSES)[number];

@Table({
  tableName: 'verification_submissions',
  paranoid: true,
})
export class VerificationSubmissionModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: number;

  @Column({
    type: DataType.ENUM(...IDENTITY_METHODS),
    allowNull: false,
    field: 'identity_method',
  })
  declare identityMethod: IdentityMethod;

  @Default('pending')
  @Column({
    type: DataType.ENUM(...VERIFICATION_SUBMISSION_STATUSES),
    allowNull: false,
  })
  declare status: VerificationSubmissionStatus;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'badge_file_path',
  })
  declare badgeFilePath: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'identity_file_path',
  })
  declare identityFilePath: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'admin_note',
  })
  declare adminNote: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'reviewed_at',
  })
  declare reviewedAt: Date | null;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

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
