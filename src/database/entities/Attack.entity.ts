import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('attacks')
export class Attack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  damage: number;

  @Column()
  usageLimit: number;

  @Column({ default: 0 })
  usageCount: number;

  @ManyToMany('Pokemon', 'attacks')
  pokemons: any[];
}
