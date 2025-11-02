import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Attack } from '../database/entities/Attack.entity';

export class AttackController {
  private attackRepository = AppDataSource.getRepository(Attack);

  
  public getAllAttacks = async (req: Request, res: Response): Promise<Response> => {
    try {
      const attacks = await this.attackRepository.find();
      return res.status(200).json(attacks);
    } catch (error) {
      console.error('Error getting all attacks:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public getAttackById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const attack = await this.attackRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!attack) {
        return res.status(404).json({ message: 'Attack not found' });
      }

      return res.status(200).json(attack);
    } catch (error) {
      console.error('Error getting attack by ID:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public createAttack = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, damage, usageLimit } = req.body;

      if (!name || !damage || !usageLimit) {
        return res.status(400).json({ message: 'Name, damage, and usageLimit are required' });
      }

      
      const existingAttack = await this.attackRepository.findOne({
        where: { name }
      });

      if (existingAttack) {
        return res.status(400).json({ message: 'An attack with this name already exists' });
      }

      const newAttack = this.attackRepository.create({
        name,
        damage,
        usageLimit,
        usageCount: 0
      });

      await this.attackRepository.save(newAttack);
      return res.status(201).json(newAttack);
    } catch (error) {
      console.error('Error creating attack:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public updateAttack = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, damage, usageLimit } = req.body;

      const attack = await this.attackRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!attack) {
        return res.status(404).json({ message: 'Attack not found' });
      }

      if (name) {
        
        const existingAttack = await this.attackRepository.findOne({
          where: { name }
        });

        if (existingAttack && existingAttack.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Another attack with this name already exists' });
        }

        attack.name = name;
      }

      if (damage !== undefined) attack.damage = damage;
      if (usageLimit !== undefined) attack.usageLimit = usageLimit;

      await this.attackRepository.save(attack);
      return res.status(200).json(attack);
    } catch (error) {
      console.error('Error updating attack:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public deleteAttack = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const attack = await this.attackRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['pokemons']
      });

      if (!attack) {
        return res.status(404).json({ message: 'Attack not found' });
      }

      
      if (attack.pokemons && attack.pokemons.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete attack as it is used by one or more Pokemon',
          pokemons: attack.pokemons.map(p => ({ id: p.id, name: p.name }))
        });
      }

      await this.attackRepository.remove(attack);
      return res.status(200).json({ message: 'Attack deleted successfully' });
    } catch (error) {
      console.error('Error deleting attack:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  
  public resetAttackUsage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const attack = await this.attackRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!attack) {
        return res.status(404).json({ message: 'Attack not found' });
      }

      attack.usageCount = 0;
      await this.attackRepository.save(attack);

      return res.status(200).json(attack);
    } catch (error) {
      console.error('Error resetting attack usage:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
