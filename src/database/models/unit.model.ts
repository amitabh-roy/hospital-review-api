import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  DeletedAt,
} from 'sequelize-typescript';

import { HospitalModel } from './hospital.model';
import { HospitalUnitModel } from './hospital-unit.model';
import { ReviewModel } from './review.model';

@Table({
  tableName: 'units',
  timestamps: false,
  paranoid: true,
})
export class UnitModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;

  @HasMany(() => HospitalUnitModel)
  declare hospitalUnits?: HospitalUnitModel[];

  @BelongsToMany(() => HospitalModel, () => HospitalUnitModel)
  declare hospitals?: HospitalModel[];

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
