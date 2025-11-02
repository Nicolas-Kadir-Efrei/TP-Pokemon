import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Attack } from './Attack.entity';

@Entity('pokemons')
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lifePoints: number;

  @Column()
  maxLifePoints: number;

  @ManyToMany(() => Attack)
  @JoinTable({
    name: 'pokemon_attacks',
    joinColumn: {
      name: 'pokemon_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'attack_id',
      referencedColumnName: 'id'
    }
  })
  attacks: Attack[];

  @ManyToOne('Trainer', 'pokemons')
  trainer: any;
}
