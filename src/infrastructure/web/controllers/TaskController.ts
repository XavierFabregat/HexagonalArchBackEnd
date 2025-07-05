import {
  CreateTaskCommand,
  CreateTaskUseCase,
} from '@application/use-cases/CreateTaskUseCase';
import {
  GetTaskCommand,
  GetTaskUseCase,
} from '@application/use-cases/GetTaskUseCase';
import { GetAllTasksUseCase } from '@application/use-cases/GetAllTasksUseCase';
import { Request, Response } from 'express';
// import { UpdateTaskUseCase } from "@application/use-cases/UpdateTaskUseCase";
// import { DeleteTaskUseCase } from "@application/use-cases/DeleteTaskUseCase";

export class TaskController {
  constructor(
    // private readonly updateTaskUseCase: UpdateTaskUseCase,
    // private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly getAllTasksUseCase: GetAllTasksUseCase
  ) {}

  async createTask(req: Request, res: Response): Promise<void> {
    const { title, description } = req.body as unknown as CreateTaskCommand;
    try {
      const task = await this.createTaskUseCase.execute({ title, description });
      res.status(201).json(task);
      return;
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  async getTask(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as GetTaskCommand;
    try {
      const task = await this.getTaskUseCase.execute({ id });
      res.status(200).json(task?.toJSON());
      return;
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.getAllTasksUseCase.execute();
      const jsonTasks = tasks.map((task) => task.toJSON());
      res.status(200).json(jsonTasks);
      return;
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }
}
