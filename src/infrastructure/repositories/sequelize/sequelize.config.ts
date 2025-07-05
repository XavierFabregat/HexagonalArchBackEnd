import { SequelizeOptions } from 'sequelize-typescript';

export const sequelizeConfig: SequelizeOptions = {
  dialect: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'xavi',
  password: process.env.DATABASE_PASSWORD || '12345',
  database: process.env.DATABASE_NAME || 'hexagonal_tasks',
  models: [__dirname + '/models/*.ts'],
  logging: false,
};
