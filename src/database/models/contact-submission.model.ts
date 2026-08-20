import {
  AutoIncrement,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  DeletedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'contact_submissions',
  paranoid: true,
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

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'admin_reply',
  })
  declare adminReply: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'replied_at',
  })
  declare repliedAt: Date | null;

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
