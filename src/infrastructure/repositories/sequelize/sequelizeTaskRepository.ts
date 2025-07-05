import { TaskRepository } from '@application/ports/TaskRepository';
import { Task } from '@domain/entities/Task';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeConfig } from './sequelize.config';
import { TaskId } from '@domain/value-objects/TaskId';
import { Task as TaskModel, TaskAttributes } from './models/Task';
import { TaskStatusEnum } from '@domain/value-objects/TaskStatus';

export class SequelizeTaskRepository implements TaskRepository {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(sequelizeConfig);
    this.sequelize.authenticate();
    this.sequelize.sync({ force: true });
    console.log('🚀 Sequelize connection established');
  }

  async save(task: Task): Promise<void> {
    const taskData = {
      title: task.title.getValue(),
      description: task.description,
      status: task.status as TaskStatusEnum,
    };

    await TaskModel.create({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
    });
  }

  async findById(id: TaskId): Promise<Task | null> {
    const task = await TaskModel.findByPk(id.getValue());
    return task ? Task.fromPersistence(task) : null;
  }

  async findAll(): Promise<Task[]> {
    const tasks = await TaskModel.findAll();
    return tasks.map((task) => Task.fromPersistence(task));
  }

  async delete(id: TaskId): Promise<void> {
    await TaskModel.destroy({ where: { id: id.getValue() } });
  }

  async update(id: TaskId, task: Partial<Task>): Promise<Task | null> {
    const [updatedCount, [updatedTask]] = await TaskModel.update(task, {
      where: { id: id.getValue() },
      returning: true,
    });

    return updatedCount > 0 ? Task.fromPersistence(updatedTask) : null;
  }
}
