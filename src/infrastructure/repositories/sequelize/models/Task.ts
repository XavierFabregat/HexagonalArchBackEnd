import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { TaskStatusEnum } from '@domain/value-objects/TaskStatus';
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
    type: DataType.ENUM(...Object.values(TaskStatusEnum)),
    allowNull: false,
    defaultValue: TaskStatusEnum.PENDING,
  })
  status!: TaskStatusEnum;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export interface TaskCreationAttributes {
  title: string;
  description: string;
  status: TaskStatusEnum;
}

export interface TaskAttributes {
  id: string;
  title: string;
  description: string;
  status: TaskStatusEnum;
}
