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

@Table({
  tableName: 'refresh_tokens',
})
export class RefreshTokenModel extends Model {
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
    field: 'revoked_at',
  })
  declare revokedAt: Date | null;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
