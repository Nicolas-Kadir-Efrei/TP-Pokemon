import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'pokemon_db',
  synchronize: true,
  logging: true,
  entities: [path.join(__dirname, '../database/entities/**/*.{js,ts}')],
  migrations: [path.join(__dirname, '../database/migrations/**/*.{js,ts}')],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};
