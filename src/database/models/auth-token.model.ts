import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { UserModel } from './user.model';

export const AUTH_TOKEN_TYPES = [
  'email_verification',
  'password_reset',
] as const;
export type AuthTokenType = (typeof AUTH_TOKEN_TYPES)[number];

@Table({
  tableName: 'auth_tokens',
  updatedAt: false,
})
export class AuthTokenModel extends Model {
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
    type: DataType.ENUM(...AUTH_TOKEN_TYPES),
    allowNull: false,
  })
  declare type: AuthTokenType;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    field: 'token_hash',
  })
  declare tokenHash: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at',
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'consumed_at',
  })
  declare consumedAt: Date | null;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  declare readonly createdAt: Date;
}
