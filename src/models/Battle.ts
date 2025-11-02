import { Trainer } from './Trainer';
import { Pokemon } from './Pokemon';

export interface BattleResult {
  winner: Trainer;
  loser: Trainer;
  rounds: number;
  winnerPokemon: Pokemon;
  loserPokemon: Pokemon;
}

export class Battle {
  static randomChallenge(trainer1: Trainer, trainer2: Trainer): BattleResult | null {
    trainer1.healAllPokemonsAtTavern();
    trainer2.healAllPokemonsAtTavern();

    const pokemon1 = trainer1.getRandomPokemon();
    const pokemon2 = trainer2.getRandomPokemon();

    if (!pokemon1 || !pokemon2) {
      return null;
    }

    return Battle.executeBattle(trainer1, trainer2, pokemon1, pokemon2);
  }

  static deterministicChallenge(trainer1: Trainer, trainer2: Trainer): BattleResult | null {
    const pokemon1 = trainer1.getPokemonWithMostLifePoints();
    const pokemon2 = trainer2.getPokemonWithMostLifePoints();

    if (!pokemon1 || !pokemon2) {
      return null;
    }

    return Battle.executeBattle(trainer1, trainer2, pokemon1, pokemon2);
  }

  static arena1(trainer1: Trainer, trainer2: Trainer): Trainer {
    let trainer1Wins = 0;
    let trainer2Wins = 0;

    for (let i = 0; i < 100; i++) {
      trainer1.healAllPokemonsAtTavern();
      trainer2.healAllPokemonsAtTavern();

      const result = Battle.randomChallenge(trainer1, trainer2);
      
      if (result) {
        if (result.winner === trainer1) {
          trainer1Wins++;
        } else {
          trainer2Wins++;
        }
      }
    }

    if (trainer1Wins > trainer2Wins) {
      return trainer1;
    } else if (trainer2Wins > trainer1Wins) {
      return trainer2;
    } else {
      if (trainer1.level > trainer2.level) {
        return trainer1;
      } else if (trainer2.level > trainer1.level) {
        return trainer2;
      } else {
        return trainer1.experience >= trainer2.experience ? trainer1 : trainer2;
      }
    }
  }

  static arena2(trainer1: Trainer, trainer2: Trainer): Trainer {
    let trainer1Wins = 0;
    let trainer2Wins = 0;

    for (let i = 0; i < 100; i++) {
      if (!trainer1.hasAlivePokemon()) {
        return trainer2;
      }
      if (!trainer2.hasAlivePokemon()) {
        return trainer1;
      }

      const result = Battle.deterministicChallenge(trainer1, trainer2);
      
      if (result) {
        if (result.winner === trainer1) {
          trainer1Wins++;
        } else {
          trainer2Wins++;
        }
      }
    }

    if (trainer1Wins > trainer2Wins) {
      return trainer1;
    } else if (trainer2Wins > trainer1Wins) {
      return trainer2;
    } else {
      if (trainer1.level > trainer2.level) {
        return trainer1;
      } else if (trainer2.level > trainer1.level) {
        return trainer2;
      } else {
        return trainer1.experience >= trainer2.experience ? trainer1 : trainer2;
      }
    }
  }

  private static executeBattle(
    trainer1: Trainer,
    trainer2: Trainer,
    pokemon1: Pokemon,
    pokemon2: Pokemon
  ): BattleResult {
    let rounds = 0;
    let currentAttacker = Math.random() < 0.5 ? pokemon1 : pokemon2;
    let currentDefender = currentAttacker === pokemon1 ? pokemon2 : pokemon1;

    while (pokemon1.isAlive() && pokemon2.isAlive()) {
      rounds++;

      const attackResult = currentAttacker.attackRandomly(currentDefender);

      if (!attackResult) {
        const temp = currentAttacker;
        currentAttacker = currentDefender;
        currentDefender = temp;
        continue;
      }

      const temp = currentAttacker;
      currentAttacker = currentDefender;
      currentDefender = temp;
    }

    let winner: Trainer;
    let loser: Trainer;
    let winnerPokemon: Pokemon;
    let loserPokemon: Pokemon;

    if (pokemon1.isAlive()) {
      winner = trainer1;
      loser = trainer2;
      winnerPokemon = pokemon1;
      loserPokemon = pokemon2;
    } else {
      winner = trainer2;
      loser = trainer1;
      winnerPokemon = pokemon2;
      loserPokemon = pokemon1;
    }

    winner.gainExperience(1);

    return {
      winner,
      loser,
      rounds,
      winnerPokemon,
      loserPokemon
    };
  }
}
