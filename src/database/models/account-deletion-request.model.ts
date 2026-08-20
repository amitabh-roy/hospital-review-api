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

export const ACCOUNT_DELETION_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const;
export type AccountDeletionRequestStatus =
  (typeof ACCOUNT_DELETION_REQUEST_STATUSES)[number];

@Table({
  tableName: 'account_deletion_requests',
  paranoid: true,
})
export class AccountDeletionRequestModel extends Model {
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
    type: DataType.TEXT,
    allowNull: false,
  })
  declare reason: string;

  @Default('pending')
  @Column({
    type: DataType.ENUM(...ACCOUNT_DELETION_REQUEST_STATUSES),
    allowNull: false,
  })
  declare status: AccountDeletionRequestStatus;

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
