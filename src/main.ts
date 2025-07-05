import './loadEnv';
import express from 'express';
import { createTaskRoutes } from '@infrastructure/web/routes/TaskRoutes';
import { TaskController } from '@infrastructure/web/controllers/TaskController';
import { CreateTaskUseCase } from '@application/use-cases/CreateTaskUseCase';
import { GetTaskUseCase } from '@application/use-cases/GetTaskUseCase';
import { GetAllTasksUseCase } from '@application/use-cases/GetAllTasksUseCase';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';
import { IdGeneratorFactory } from '@infrastructure/adapters/IdGenerators/IdGeneratorFactory';

class Application {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3005');
    this.setupMiddlewares();
    this.setupDependencies();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS middleware (for development)
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupDependencies(): void {
    // 1. Create infrastructure layer (Adapters)
    const taskRepository = RepositoryFactory.createTaskRepository('sequelize');
    const idGenerator = IdGeneratorFactory.createIdGenerator('uuid');

    // 2. Create application layer (Use Cases)
    const createTaskUseCase = new CreateTaskUseCase(
      taskRepository,
      idGenerator
    );
    const getTaskUseCase = new GetTaskUseCase(taskRepository);
    const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);

    // 3. Create Infrastructure layer (Controllers)
    const taskController = new TaskController(
      createTaskUseCase,
      getTaskUseCase,
      getAllTasksUseCase
    );

    // 4. Create Infrastructure layer (Routes)
    const taskRoutes = createTaskRoutes(taskController);
    this.app.use('/api/tasks', taskRoutes);

    // 5. Setup health check route
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // 6. Setup 404 Handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
      });
    });

    // 7. Global Error Handler
    this.app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error('Global error handler:', error);
        res.status(500).json({
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'development'
              ? error.message
              : 'Something went wrong',
        });
      }
    );
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log('🚀 Server Configuration:');
      console.log(`   Port: ${this.port}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health Check: http://localhost:${this.port}/health`);
      console.log(`   API Base: http://localhost:${this.port}/api`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`   POST   /api/tasks       - Create a new task`);
      console.log(`   GET    /api/tasks       - Get all tasks`);
      console.log(`   GET    /api/tasks/:id   - Get specific task`);
      console.log('');
      console.log('✅ Server is running and ready to accept requests!');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start the application
const app = new Application();
app.start();

export default app;
