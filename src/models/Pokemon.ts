import { Attack } from './Attack';

export class Pokemon {
  private _id: number;
  private _name: string;
  private _lifePoints: number;
  private _maxLifePoints: number;
  private _attacks: Attack[];

  constructor(id: number, name: string, lifePoints: number) {
    this._id = id;
    this._name = name;
    this._lifePoints = lifePoints;
    this._maxLifePoints = lifePoints;
    this._attacks = [];
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get lifePoints(): number {
    return this._lifePoints;
  }

  get maxLifePoints(): number {
    return this._maxLifePoints;
  }

  get attacks(): Attack[] {
    return [...this._attacks];
  }

  learnAttack(attack: Attack): boolean {
    if (this._attacks.some(a => a.id === attack.id)) {
      return false;
    }

    if (this._attacks.length >= 4) {
      return false;
    }

    this._attacks.push(attack);
    return true;
  }

  heal(): void {
    this._lifePoints = this._maxLifePoints;
    this._attacks.forEach(attack => attack.reset());
  }

  attackRandomly(target: Pokemon): { attack: Attack; damage: number } | null {
    const availableAttacks = this._attacks.filter(attack => attack.canUse());

    if (availableAttacks.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableAttacks.length);
    const selectedAttack = availableAttacks[randomIndex];

    if (selectedAttack.use()) {
      const damage = selectedAttack.damage;
      target.takeDamage(damage);

      return { attack: selectedAttack, damage };
    }

    return null;
  }

  takeDamage(damage: number): number {
    const actualDamage = Math.min(this._lifePoints, damage);
    this._lifePoints -= actualDamage;
    return actualDamage;
  }

  isAlive(): boolean {
    return this._lifePoints > 0;
  }

  toString(): string {
    return `${this._name} (HP: ${this._lifePoints}/${this._maxLifePoints}, Attacks: ${this._attacks.length})`;
  }
}
