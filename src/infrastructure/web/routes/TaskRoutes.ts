import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

export function createTaskRoutes(taskController: TaskController): Router {
  const router = Router();

  // POST /tasks - Create a new task
  router.post('/', (req, res) => taskController.createTask(req, res));

  // GET /tasks - Get all tasks
  router.get('/', (req, res) => taskController.getAllTasks(req, res));

  // GET /tasks/:id - Get specific task
  router.get('/:id', (req, res) => taskController.getTask(req, res));

  return router;
}
