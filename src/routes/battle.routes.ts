import { Router } from 'express';
import { BattleController } from '../controllers/battle.controller';

const router = Router();
const battleController = new BattleController();


router.post('/random/:trainer1Id/:trainer2Id', battleController.randomChallenge);


router.post('/deterministic/:trainer1Id/:trainer2Id', battleController.deterministicChallenge);


router.post('/arena1/:trainer1Id/:trainer2Id', battleController.arena1);


router.post('/arena2/:trainer1Id/:trainer2Id', battleController.arena2);

export default router;
