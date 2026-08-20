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

@Table({
  tableName: 'login_events',
  paranoid: true,
})
export class LoginEventModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  declare userId: number | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    field: 'ip_address',
  })
  declare ipAddress: string | null;

  @Column({
    type: DataType.STRING(512),
    allowNull: true,
    field: 'user_agent',
  })
  declare userAgent: string | null;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare success: boolean;

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
