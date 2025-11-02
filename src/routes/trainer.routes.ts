import { Router } from 'express';
import { TrainerController } from '../controllers/trainer.controller';

const router = Router();
const trainerController = new TrainerController();


router.get('/', trainerController.getAllTrainers);


router.get('/:id', trainerController.getTrainerById);


router.post('/', trainerController.createTrainer);


router.put('/:id', trainerController.updateTrainer);


router.delete('/:id', trainerController.deleteTrainer);


router.post('/:trainerId/pokemons/:pokemonId', trainerController.addPokemonToTrainer);


router.delete('/:trainerId/pokemons/:pokemonId', trainerController.removePokemonFromTrainer);


router.post('/:id/heal', trainerController.healAllPokemon);


router.post('/:id/experience', trainerController.gainExperience);

export default router;
