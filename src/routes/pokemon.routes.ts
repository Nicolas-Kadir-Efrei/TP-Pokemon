import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon.controller';

const router = Router();
const pokemonController = new PokemonController();


router.get('/', pokemonController.getAllPokemon);


router.get('/:id', pokemonController.getPokemonById);


router.post('/', pokemonController.createPokemon);


router.put('/:id', pokemonController.updatePokemon);


router.delete('/:id', pokemonController.deletePokemon);


router.post('/:pokemonId/attacks/:attackId', pokemonController.addAttackToPokemon);


router.delete('/:pokemonId/attacks/:attackId', pokemonController.removeAttackFromPokemon);


router.post('/:id/heal', pokemonController.healPokemon);

export default router;
