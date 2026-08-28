import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { ReviewModel } from './review.model';
import { RoleModel } from './role.model';

export const USER_VERIFICATION_STATUSES = [
  'pending',
  'verified',
  'rejected',
] as const;

export type UserVerificationStatus =
  (typeof USER_VERIFICATION_STATUSES)[number];

@Table({
  tableName: 'users',
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['passwordHash'] },
  },
})
export class UserModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    field: 'full_name',
  })
  declare fullName: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash',
  })
  declare passwordHash: string;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'role_id',
  })
  declare roleId: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_verified',
  })
  declare isVerified: boolean;

  @Default('pending')
  @Column({
    type: DataType.ENUM(...USER_VERIFICATION_STATUSES),
    allowNull: false,
    field: 'verification_status',
  })
  declare verificationStatus: UserVerificationStatus;

  @BelongsTo(() => RoleModel)
  declare role?: RoleModel;

  @HasMany(() => ReviewModel)
  declare reviews?: ReviewModel[];

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'deleted_at',
  })
  declare deletedAt: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'warning_message',
  })
  declare warningMessage: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
