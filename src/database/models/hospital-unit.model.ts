import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  DeletedAt,
} from 'sequelize-typescript';

import { HospitalModel } from './hospital.model';
import { UnitModel } from './unit.model';

@Table({
  tableName: 'hospital_units',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['hospital_id', 'unit_id'],
      name: 'hospital_units_hospital_unit_unique',
    },
    {
      fields: ['hospital_id'],
      name: 'hospital_units_hospital_id_idx',
    },
    {
      fields: ['unit_id'],
      name: 'hospital_units_unit_id_idx',
    },
  ],
})
export class HospitalUnitModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => HospitalModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'hospital_id',
  })
  declare hospitalId: number;

  @ForeignKey(() => UnitModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'unit_id',
  })
  declare unitId: number;

  @BelongsTo(() => HospitalModel)
  declare hospital?: HospitalModel;

  @BelongsTo(() => UnitModel)
  declare unit?: UnitModel;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'deleted_at',
  })
  declare deletedAt: Date | null;
}
