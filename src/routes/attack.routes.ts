import { Router } from 'express';
import { AttackController } from '../controllers/attack.controller';

const router = Router();
const attackController = new AttackController();


router.get('/', attackController.getAllAttacks);


router.get('/:id', attackController.getAttackById);


router.post('/', attackController.createAttack);


router.put('/:id', attackController.updateAttack);


router.delete('/:id', attackController.deleteAttack);


router.post('/:id/reset', attackController.resetAttackUsage);

export default router;
