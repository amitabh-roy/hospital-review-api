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
} from 'sequelize-typescript';

import { HospitalUnitModel } from './hospital-unit.model';
import { ReviewModel } from './review.model';
import { UnitModel } from './unit.model';

@Table({
  tableName: 'hospitals',
})
export class HospitalModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'cms_id',
  })
  declare cmsId: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare state: string;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
    field: 'facility_type',
  })
  declare facilityType: string;

  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'average_rating',
  })
  declare averageRating: number;

  @HasMany(() => HospitalUnitModel)
  declare hospitalUnits?: HospitalUnitModel[];

  @BelongsToMany(() => UnitModel, () => HospitalUnitModel)
  declare units?: UnitModel[];

  @HasMany(() => ReviewModel)
  declare reviews?: ReviewModel[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
