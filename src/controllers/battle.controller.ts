import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Trainer } from '../database/entities/Trainer.entity';
import { Pokemon } from '../database/entities/Pokemon.entity';
import { Attack } from '../database/entities/Attack.entity';

export class BattleController {
  private trainerRepository = AppDataSource.getRepository(Trainer);
  private pokemonRepository = AppDataSource.getRepository(Pokemon);
  private attackRepository = AppDataSource.getRepository(Attack);

  
  public randomChallenge = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { trainer1Id, trainer2Id } = req.params;

      const trainer1 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer1Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      const trainer2 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer2Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      if (!trainer1 || !trainer2) {
        return res.status(404).json({ message: 'One or both trainers not found' });
      }

      
      if (!trainer1.pokemons || trainer1.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 1 has no Pokemon' });
      }

      if (!trainer2.pokemons || trainer2.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 2 has no Pokemon' });
      }

      
      await this.healTrainerPokemon(trainer1);
      await this.healTrainerPokemon(trainer2);

      
      const pokemon1 = trainer1.pokemons[Math.floor(Math.random() * trainer1.pokemons.length)];
      const pokemon2 = trainer2.pokemons[Math.floor(Math.random() * trainer2.pokemons.length)];

      
      const battleResult = await this.executeBattle(trainer1, trainer2, pokemon1, pokemon2);

      return res.status(200).json(battleResult);
    } catch (error) {
      console.error('Error executing random challenge:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public deterministicChallenge = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { trainer1Id, trainer2Id } = req.params;

      const trainer1 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer1Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      const trainer2 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer2Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      if (!trainer1 || !trainer2) {
        return res.status(404).json({ message: 'One or both trainers not found' });
      }

      
      if (!trainer1.pokemons || trainer1.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 1 has no Pokemon' });
      }

      if (!trainer2.pokemons || trainer2.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 2 has no Pokemon' });
      }

      
      const pokemon1 = trainer1.pokemons.reduce((max, pokemon) => 
        pokemon.lifePoints > max.lifePoints ? pokemon : max, trainer1.pokemons[0]);
      
      const pokemon2 = trainer2.pokemons.reduce((max, pokemon) => 
        pokemon.lifePoints > max.lifePoints ? pokemon : max, trainer2.pokemons[0]);

      
      const battleResult = await this.executeBattle(trainer1, trainer2, pokemon1, pokemon2);

      return res.status(200).json(battleResult);
    } catch (error) {
      console.error('Error executing deterministic challenge:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public arena1 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { trainer1Id, trainer2Id } = req.params;

      const trainer1 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer1Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      const trainer2 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer2Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      if (!trainer1 || !trainer2) {
        return res.status(404).json({ message: 'One or both trainers not found' });
      }

      
      if (!trainer1.pokemons || trainer1.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 1 has no Pokemon' });
      }

      if (!trainer2.pokemons || trainer2.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 2 has no Pokemon' });
      }

      let trainer1Wins = 0;
      let trainer2Wins = 0;
      const battleResults = [];

      
      for (let i = 0; i < 100; i++) {
        
        await this.healTrainerPokemon(trainer1);
        await this.healTrainerPokemon(trainer2);

        
        const pokemon1 = trainer1.pokemons[Math.floor(Math.random() * trainer1.pokemons.length)];
        const pokemon2 = trainer2.pokemons[Math.floor(Math.random() * trainer2.pokemons.length)];

        
        const result = await this.executeBattle(trainer1, trainer2, pokemon1, pokemon2);
        battleResults.push(result);
        
        if (result.winner.id === trainer1.id) {
          trainer1Wins++;
        } else {
          trainer2Wins++;
        }
      }

      
      let winner;
      if (trainer1Wins > trainer2Wins) {
        winner = trainer1;
      } else if (trainer2Wins > trainer1Wins) {
        winner = trainer2;
      } else {
        
        if (trainer1.level > trainer2.level) {
          winner = trainer1;
        } else if (trainer2.level > trainer1.level) {
          winner = trainer2;
        } else {
          
          winner = trainer1.experience >= trainer2.experience ? trainer1 : trainer2;
        }
      }

      return res.status(200).json({
        winner,
        trainer1Wins,
        trainer2Wins,
        battleResults
      });
    } catch (error) {
      console.error('Error executing Arena 1 battle:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public arena2 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { trainer1Id, trainer2Id } = req.params;

      const trainer1 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer1Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      const trainer2 = await this.trainerRepository.findOne({
        where: { id: parseInt(trainer2Id) },
        relations: ['pokemons', 'pokemons.attacks']
      });

      if (!trainer1 || !trainer2) {
        return res.status(404).json({ message: 'One or both trainers not found' });
      }

      
      if (!trainer1.pokemons || trainer1.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 1 has no Pokemon' });
      }

      if (!trainer2.pokemons || trainer2.pokemons.length === 0) {
        return res.status(400).json({ message: 'Trainer 2 has no Pokemon' });
      }

      let trainer1Wins = 0;
      let trainer2Wins = 0;
      const battleResults = [];
      let earlyStop = false;

      
      for (let i = 0; i < 100; i++) {
        
        const trainer1HasAlivePokemon = trainer1.pokemons.some(p => p.lifePoints > 0);
        const trainer2HasAlivePokemon = trainer2.pokemons.some(p => p.lifePoints > 0);

        if (!trainer1HasAlivePokemon) {
          earlyStop = true;
          break;
        }
        if (!trainer2HasAlivePokemon) {
          earlyStop = true;
          break;
        }

        
        const alivePokemon1 = trainer1.pokemons.filter(p => p.lifePoints > 0);
        const alivePokemon2 = trainer2.pokemons.filter(p => p.lifePoints > 0);

        const pokemon1 = alivePokemon1.reduce((max, pokemon) => 
          pokemon.lifePoints > max.lifePoints ? pokemon : max, alivePokemon1[0]);
        
        const pokemon2 = alivePokemon2.reduce((max, pokemon) => 
          pokemon.lifePoints > max.lifePoints ? pokemon : max, alivePokemon2[0]);

        
        const result = await this.executeBattle(trainer1, trainer2, pokemon1, pokemon2);
        battleResults.push(result);
        
        if (result.winner.id === trainer1.id) {
          trainer1Wins++;
        } else {
          trainer2Wins++;
        }
      }

      
      let winner;
      if (earlyStop) {
        
        const trainer1HasAlivePokemon = trainer1.pokemons.some(p => p.lifePoints > 0);
        winner = trainer1HasAlivePokemon ? trainer1 : trainer2;
      } else {
        
        if (trainer1Wins > trainer2Wins) {
          winner = trainer1;
        } else if (trainer2Wins > trainer1Wins) {
          winner = trainer2;
        } else {
          
          if (trainer1.level > trainer2.level) {
            winner = trainer1;
          } else if (trainer2.level > trainer1.level) {
            winner = trainer2;
          } else {
            
            winner = trainer1.experience >= trainer2.experience ? trainer1 : trainer2;
          }
        }
      }

      return res.status(200).json({
        winner,
        trainer1Wins,
        trainer2Wins,
        earlyStop,
        battleResults
      });
    } catch (error) {
      console.error('Error executing Arena 2 battle:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  private async healTrainerPokemon(trainer: Trainer): Promise<void> {
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
  }

  
  private async executeBattle(
    trainer1: Trainer,
    trainer2: Trainer,
    pokemon1: Pokemon,
    pokemon2: Pokemon
  ): Promise<any> {
    let rounds = 0;
    let currentAttacker = Math.random() < 0.5 ? 
      { trainer: trainer1, pokemon: pokemon1 } : 
      { trainer: trainer2, pokemon: pokemon2 };
    
    let currentDefender = currentAttacker.pokemon === pokemon1 ?
      { trainer: trainer2, pokemon: pokemon2 } :
      { trainer: trainer1, pokemon: pokemon1 };

    const battleLog = [];

    
    while (pokemon1.lifePoints > 0 && pokemon2.lifePoints > 0) {
      rounds++;

      
      const availableAttacks = currentAttacker.pokemon.attacks.filter(attack => 
        attack.usageCount < attack.usageLimit
      );

      
      if (!availableAttacks || availableAttacks.length === 0) {
        battleLog.push(`${currentAttacker.pokemon.name} has no available attacks!`);
        
        const temp = currentAttacker;
        currentAttacker = currentDefender;
        currentDefender = temp;
        continue;
      }

      
      const selectedAttack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
      
      
      selectedAttack.usageCount++;
      
      
      const damage = selectedAttack.damage;
      const actualDamage = Math.min(currentDefender.pokemon.lifePoints, damage);
      currentDefender.pokemon.lifePoints -= actualDamage;

      battleLog.push(`${currentAttacker.pokemon.name} used ${selectedAttack.name} and dealt ${actualDamage} damage to ${currentDefender.pokemon.name}!`);
      
      
      const temp = currentAttacker;
      currentAttacker = currentDefender;
      currentDefender = temp;
    }

    
    let winner: Trainer;
    let loser: Trainer;
    let winnerPokemon: Pokemon;
    let loserPokemon: Pokemon;

    if (pokemon1.lifePoints > 0) {
      winner = trainer1;
      loser = trainer2;
      winnerPokemon = pokemon1;
      loserPokemon = pokemon2;
      battleLog.push(`${pokemon1.name} wins! ${pokemon2.name} fainted.`);
    } else {
      winner = trainer2;
      loser = trainer1;
      winnerPokemon = pokemon2;
      loserPokemon = pokemon1;
      battleLog.push(`${pokemon2.name} wins! ${pokemon1.name} fainted.`);
    }

    
    winner.experience += 1;
    
    
    if (winner.experience >= 10) {
      winner.level++;
      winner.experience -= 10;
      battleLog.push(`${winner.name} leveled up to level ${winner.level}!`);
    }

    await this.trainerRepository.save(winner);

    return {
      winner,
      loser,
      rounds,
      winnerPokemon: {
        id: winnerPokemon.id,
        name: winnerPokemon.name,
        lifePoints: winnerPokemon.lifePoints,
        maxLifePoints: winnerPokemon.maxLifePoints
      },
      loserPokemon: {
        id: loserPokemon.id,
        name: loserPokemon.name,
        lifePoints: loserPokemon.lifePoints,
        maxLifePoints: loserPokemon.maxLifePoints
      },
      battleLog
    };
  }
}
