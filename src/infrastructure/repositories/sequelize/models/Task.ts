import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { TaskStatus } from '@domain/entities/Task';
import { Task as TaskEntity } from '@domain/entities/Task';

@Table
export class Task extends Model<TaskEntity, TaskCreationAttributes> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
    allowNull: false,
    defaultValue: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export interface TaskCreationAttributes {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface TaskAttributes {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}
