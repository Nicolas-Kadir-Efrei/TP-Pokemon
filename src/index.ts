import 'reflect-metadata';
import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDatabase } from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/api', (req, res) => {
  res.send('Pokemon API is running!');
});

import pokemonRoutes from './routes/pokemon.routes';
import attackRoutes from './routes/attack.routes';
import trainerRoutes from './routes/trainer.routes';
import battleRoutes from './routes/battle.routes';

app.use('/api/pokemon', pokemonRoutes);
app.use('/api/attacks', attackRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/battles', battleRoutes);

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
