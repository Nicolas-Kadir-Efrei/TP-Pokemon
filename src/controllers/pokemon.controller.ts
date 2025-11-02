import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Pokemon } from '../database/entities/Pokemon.entity';
import { Attack } from '../database/entities/Attack.entity';

export class PokemonController {
  private pokemonRepository = AppDataSource.getRepository(Pokemon);
  private attackRepository = AppDataSource.getRepository(Attack);

  
  public getAllPokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const pokemons = await this.pokemonRepository.find({
        relations: ['attacks', 'trainer']
      });
      return res.status(200).json(pokemons);
    } catch (error) {
      console.error('Error getting all Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public getPokemonById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['attacks', 'trainer']
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      return res.status(200).json(pokemon);
    } catch (error) {
      console.error('Error getting Pokemon by ID:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public createPokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, lifePoints } = req.body;

      if (!name || !lifePoints) {
        return res.status(400).json({ message: 'Name and lifePoints are required' });
      }

      const newPokemon = this.pokemonRepository.create({
        name,
        lifePoints,
        maxLifePoints: lifePoints,
        attacks: []
      });

      await this.pokemonRepository.save(newPokemon);
      return res.status(201).json(newPokemon);
    } catch (error) {
      console.error('Error creating Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public updatePokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, lifePoints } = req.body;

      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      if (name) pokemon.name = name;
      if (lifePoints) {
        pokemon.lifePoints = lifePoints;
        pokemon.maxLifePoints = lifePoints;
      }

      await this.pokemonRepository.save(pokemon);
      return res.status(200).json(pokemon);
    } catch (error) {
      console.error('Error updating Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public deletePokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      await this.pokemonRepository.remove(pokemon);
      return res.status(200).json({ message: 'Pokemon deleted successfully' });
    } catch (error) {
      console.error('Error deleting Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public addAttackToPokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { pokemonId, attackId } = req.params;

      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(pokemonId) },
        relations: ['attacks']
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      const attack = await this.attackRepository.findOne({
        where: { id: parseInt(attackId) }
      });

      if (!attack) {
        return res.status(404).json({ message: 'Attack not found' });
      }

      
      if (pokemon.attacks.some(a => a.id === attack.id)) {
        return res.status(400).json({ message: 'Pokemon already has this attack' });
      }

      
      if (pokemon.attacks.length >= 4) {
        return res.status(400).json({ message: 'Pokemon already has 4 attacks' });
      }

      pokemon.attacks.push(attack);
      await this.pokemonRepository.save(pokemon);

      return res.status(200).json(pokemon);
    } catch (error) {
      console.error('Error adding attack to Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public removeAttackFromPokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { pokemonId, attackId } = req.params;

      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(pokemonId) },
        relations: ['attacks']
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      
      pokemon.attacks = pokemon.attacks.filter(attack => attack.id !== parseInt(attackId));
      await this.pokemonRepository.save(pokemon);

      return res.status(200).json(pokemon);
    } catch (error) {
      console.error('Error removing attack from Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public healPokemon = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const pokemon = await this.pokemonRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['attacks']
      });

      if (!pokemon) {
        return res.status(404).json({ message: 'Pokemon not found' });
      }

      
      pokemon.lifePoints = pokemon.maxLifePoints;

      
      pokemon.attacks.forEach(attack => {
        attack.usageCount = 0;
      });

      await this.pokemonRepository.save(pokemon);
      return res.status(200).json(pokemon);
    } catch (error) {
      console.error('Error healing Pokemon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
