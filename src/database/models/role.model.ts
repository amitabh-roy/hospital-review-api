import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  DeletedAt,
} from 'sequelize-typescript';

import { ReviewModel } from './review.model';
import { UserModel } from './user.model';

@Table({
  tableName: 'roles',
  timestamps: false,
  paranoid: true,
})
export class RoleModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @HasMany(() => UserModel)
  declare users?: UserModel[];

  @HasMany(() => ReviewModel)
  declare reviews?: ReviewModel[];

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'deleted_at',
  })
  declare deletedAt: Date | null;
}
