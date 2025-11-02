import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @OneToMany('Pokemon', 'trainer')
  pokemons: any[];
}
