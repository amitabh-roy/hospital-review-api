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
} from 'sequelize-typescript';

import { HospitalModel } from './hospital.model';
import { RoleModel } from './role.model';
import { UnitModel } from './unit.model';
import { UserModel } from './user.model';

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

@Table({
  tableName: 'reviews',
  indexes: [
    {
      unique: true,
      fields: ['hospital_id', 'user_id'],
      name: 'reviews_hospital_user_unique',
    },
  ],
})
export class ReviewModel extends Model {
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

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: number;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'role_id',
  })
  declare roleId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rating: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare comment: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'employment_type',
  })
  declare employmentType: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'shift_type',
  })
  declare shiftType: string;

  @Default('pending')
  @Column({
    type: DataType.ENUM(...REVIEW_STATUSES),
    allowNull: false,
  })
  declare status: ReviewStatus;

  @Column({
    type: DataType.DECIMAL(8, 2),
    allowNull: true,
    field: 'hourly_rate',
  })
  declare hourlyRate: number | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'patient_ratio',
  })
  declare patientRatio: string | null;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
    field: 'meal_breaks',
  })
  declare mealBreaks: string | null;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
    field: 'bathroom_breaks',
  })
  declare bathroomBreaks: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'parking_cost',
  })
  declare parkingCost: string | null;

  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: true,
    field: 'management_rating',
  })
  declare managementRating: number | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    field: 'would_return',
  })
  declare wouldReturn: boolean | null;

  @BelongsTo(() => HospitalModel)
  declare hospital?: HospitalModel;

  @BelongsTo(() => UnitModel)
  declare unit?: UnitModel;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @BelongsTo(() => RoleModel)
  declare role?: RoleModel;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
