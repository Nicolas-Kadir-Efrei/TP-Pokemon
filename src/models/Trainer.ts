import { Pokemon } from './Pokemon';

export class Trainer {
  private _id: number;
  private _name: string;
  private _level: number;
  private _experience: number;
  private _pokemons: Pokemon[];

  constructor(id: number, name: string) {
    this._id = id;
    this._name = name;
    this._level = 1;
    this._experience = 0;
    this._pokemons = [];
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get level(): number {
    return this._level;
  }

  get experience(): number {
    return this._experience;
  }

  get pokemons(): Pokemon[] {
    return [...this._pokemons];
  }

  addPokemon(pokemon: Pokemon): boolean {
    if (this._pokemons.some(p => p.id === pokemon.id)) {
      return false;
    }

    this._pokemons.push(pokemon);
    return true;
  }

  healAllPokemonsAtTavern(): void {
    this._pokemons.forEach(pokemon => pokemon.heal());
  }

  gainExperience(experiencePoints: number): void {
    this._experience += experiencePoints;
    
    while (this._experience >= 10) {
      this._level++;
      this._experience -= 10;
    }
  }

  getRandomPokemon(): Pokemon | null {
    if (this._pokemons.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this._pokemons.length);
    return this._pokemons[randomIndex];
  }

  getPokemonWithMostLifePoints(): Pokemon | null {
    if (this._pokemons.length === 0) {
      return null;
    }

    return this._pokemons.reduce((maxPokemon, currentPokemon) => {
      return currentPokemon.lifePoints > maxPokemon.lifePoints ? currentPokemon : maxPokemon;
    }, this._pokemons[0]);
  }

  hasAlivePokemon(): boolean {
    return this._pokemons.some(pokemon => pokemon.isAlive());
  }

  toString(): string {
    return `${this._name} (Level: ${this._level}, Experience: ${this._experience}/10, Pokemon: ${this._pokemons.length})`;
  }
}
