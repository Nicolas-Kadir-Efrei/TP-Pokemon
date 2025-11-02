import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Trainer } from '../database/entities/Trainer.entity';
import { Pokemon } from '../database/entities/Pokemon.entity';

export class TrainerController {
  private trainerRepository = AppDataSource.getRepository(Trainer);
  private pokemonRepository = AppDataSource.getRepository(Pokemon);

  
  public getAllTrainers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const trainers = await this.trainerRepository.find({
        relations: ['pokemons']
      });
      return res.status(200).json(trainers);
    } catch (error) {
      console.error('Error getting all trainers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public getTrainerById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      return res.status(200).json(trainer);
    } catch (error) {
      console.error('Error getting trainer by ID:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public createTrainer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      
      const existingTrainer = await this.trainerRepository.findOne({
        where: { name }
      });

      if (existingTrainer) {
        return res.status(400).json({ message: 'A trainer with this name already exists' });
      }

      const newTrainer = this.trainerRepository.create({
        name,
        level: 1,
        experience: 0
      });

      await this.trainerRepository.save(newTrainer);
      return res.status(201).json(newTrainer);
    } catch (error) {
      console.error('Error creating trainer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public updateTrainer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      if (name) {
        
        const existingTrainer = await this.trainerRepository.findOne({
          where: { name }
        });

        if (existingTrainer && existingTrainer.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Another trainer with this name already exists' });
        }

        trainer.name = name;
      }

      await this.trainerRepository.save(trainer);
      return res.status(200).json(trainer);
    } catch (error) {
      console.error('Error updating trainer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public deleteTrainer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['pokemons']
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      
      if (trainer.pokemons && trainer.pokemons.length > 0) {
        for (const pokemon of trainer.pokemons) {
          pokemon.trainer = null as any;
          await this.pokemonRepository.save(pokemon);
        }
      }

      await this.trainerRepository.remove(trainer);
      return res.status(200).json({ message: 'Trainer deleted successfully' });
    } catch (error) {
      console.error('Error deleting trainer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public addPokemonToTrainer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { trainerId, pokemonId } = req.params;

      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(trainerId) },
        relations: ['pokemons']
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(pokemonId) }
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      
      if (pokemon.trainer && pokemon.trainer.id !== parseInt(trainerId)) {
        return res.status(400).json({ message: 'Pokemon already belongs to another trainer' });
      }

      
      pokemon.trainer = trainer;
      await this.pokemonRepository.save(pokemon);

      return res.status(200).json({
        message: 'Pokemon added to trainer successfully',
        trainer,
        pokemon
      });
    } catch (error) {
      console.error('Error adding Pokemon to trainer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public removePokemonFromTrainer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { trainerId, pokemonId } = req.params;

      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(trainerId) },
        relations: ['pokemons']
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(pokemonId) }
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      
      if (!pokemon.trainer || pokemon.trainer.id !== parseInt(trainerId)) {
        return res.status(400).json({ message: 'Pokemon does not belong to this trainer' });
      }

      
      pokemon.trainer = null as any;
      await this.pokemonRepository.save(pokemon);

      return res.status(200).json({
        message: 'Pokemon removed from trainer successfully',
        trainer,
        pokemon
      });
    } catch (error) {
      console.error('Error removing Pokemon from trainer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public healAllPokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      
      if (trainer.pokemons && trainer.pokemons.length > 0) {
        for (const pokemon of trainer.pokemons) {
          pokemon.lifePoints = pokemon.maxLifePoints;
          
          
          if (pokemon.attacks) {
            for (const attack of pokemon.attacks) {
              attack.usageCount = 0;
            }
          }
        }

        await this.pokemonRepository.save(trainer.pokemons);
      }

      return res.status(200).json({
        message: 'All Pokemon healed successfully',
        trainer
      });
    } catch (error) {
      console.error('Error healing all Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public gainExperience = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'A positive experience amount is required' });
      }

      const trainer = await this.trainerRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      
      trainer.experience += amount;

      
      while (trainer.experience >= 10) {
        trainer.level++;
        trainer.experience -= 10;
      }

      await this.trainerRepository.save(trainer);

      return res.status(200).json({
        message: 'Experience gained successfully',
        trainer
      });
    } catch (error) {
      console.error('Error gaining experience:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
