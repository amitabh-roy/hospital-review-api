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

import { HospitalModel } from './hospital.model';
import { UserModel } from './user.model';

@Table({
  tableName: 'saved_hospitals',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'hospital_id'],
      name: 'saved_hospitals_user_hospital_unique',
    },
  ],
})
export class SavedHospitalModel extends Model {
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

  @ForeignKey(() => HospitalModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'hospital_id',
  })
  declare hospitalId: number;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @BelongsTo(() => HospitalModel)
  declare hospital?: HospitalModel;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
