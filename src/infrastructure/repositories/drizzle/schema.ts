import {
  pgTable,
  uuid,
  varchar,
  text,
  pgEnum,
  timestamp,
} from 'drizzle-orm/pg-core';
import { TaskStatusEnum } from '@domain/value-objects/TaskStatus';

export const taskStatus = pgEnum('task_status', [
  TaskStatusEnum.PENDING,
  TaskStatusEnum.IN_PROGRESS,
  TaskStatusEnum.COMPLETED,
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: taskStatus('status').notNull().default(TaskStatusEnum.PENDING),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
