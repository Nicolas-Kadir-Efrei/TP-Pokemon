export class Attack {
  private _id: number;
  private _name: string;
  private _damage: number;
  private _usageLimit: number;
  private _usageCount: number;

  constructor(id: number, name: string, damage: number, usageLimit: number) {
    this._id = id;
    this._name = name;
    this._damage = damage;
    this._usageLimit = usageLimit;
    this._usageCount = 0;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get damage(): number {
    return this._damage;
  }

  get usageLimit(): number {
    return this._usageLimit;
  }

  get usageCount(): number {
    return this._usageCount;
  }

  use(): boolean {
    if (this._usageCount < this._usageLimit) {
      this._usageCount++;
      return true;
    }
    return false;
  }

  reset(): void {
    this._usageCount = 0;
  }

  canUse(): boolean {
    return this._usageCount < this._usageLimit;
  }

  toString(): string {
    return `${this._name} (Damage: ${this._damage}, Uses: ${this._usageCount}/${this._usageLimit})`;
  }
}
