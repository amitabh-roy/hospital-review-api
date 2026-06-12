import {
  AutoIncrement,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'contact_submissions',
})
export class ContactSubmissionModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'first_name',
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'last_name',
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare topic: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare message: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_read',
  })
  declare isRead: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
