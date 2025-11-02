// Configuration
const API_URL = 'http://localhost:3000/api';

// Éléments DOM
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const logContainer = document.getElementById('log-container');

// Compteurs pour le statut
let attacksCount = 0;
let pokemonCount = 0;
let trainersCount = 0;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Gestion des onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Charger les données initiales
    loadAllData();

    // Configuration
    document.getElementById('init-db').addEventListener('click', initializeDatabase);

    // Pokémon
    document.getElementById('create-pokemon').addEventListener('click', createPokemon);
    document.getElementById('add-attack').addEventListener('click', addAttackToPokemon);
    document.getElementById('heal-pokemon').addEventListener('click', healPokemon);
    document.getElementById('refresh-pokemon').addEventListener('click', loadPokemon);

    // Attaques
    document.getElementById('create-attack').addEventListener('click', createAttack);
    document.getElementById('refresh-attacks').addEventListener('click', loadAttacks);

    // Dresseurs
    document.getElementById('create-trainer').addEventListener('click', createTrainer);
    document.getElementById('add-pokemon').addEventListener('click', addPokemonToTrainer);
    document.getElementById('heal-trainer-pokemon').addEventListener('click', healTrainerPokemon);
    document.getElementById('gain-exp').addEventListener('click', gainExperience);
    document.getElementById('refresh-trainers').addEventListener('click', loadTrainers);

    // Combats
    document.getElementById('random-battle').addEventListener('click', randomBattle);
    document.getElementById('deterministic-battle').addEventListener('click', deterministicBattle);
    document.getElementById('arena1-battle').addEventListener('click', arena1Battle);
    document.getElementById('arena2-battle').addEventListener('click', arena2Battle);

    // Logs
    document.getElementById('clear-logs').addEventListener('click', clearLogs);
});

// Fonctions utilitaires
function addLog(message, type = 'info') {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.prepend(logItem);
}

function clearLogs() {
    logContainer.innerHTML = '';
    addLog('Logs effacés', 'info');
}

async function fetchAPI(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue');
        }

        return result;
    } catch (error) {
        addLog(`Erreur: ${error.message}`, 'error');
        throw error;
    }
}

function updateStatus() {
    document.getElementById('attacks-status').textContent = attacksCount;
    document.getElementById('pokemon-status').textContent = pokemonCount;
    document.getElementById('trainers-status').textContent = trainersCount;
}

// Chargement des données
async function loadAllData() {
    try {
        await loadAttacks();
        await loadPokemon();
        await loadTrainers();
        updateStatus();
    } catch (error) {
        addLog(`Erreur lors du chargement des données: ${error.message}`, 'error');
    }
}

async function loadAttacks() {
    try {
        const attacks = await fetchAPI('/attacks');
        const attacksList = document.getElementById('attacks-list');
        const attackSelect = document.getElementById('attack-select');
        
        attacksList.innerHTML = '';
        attackSelect.innerHTML = '<option value="">Sélectionner une attaque</option>';
        
        attacks.forEach(attack => {
            // Liste des attaques
            const attackItem = document.createElement('div');
            attackItem.className = 'list-item';
            attackItem.innerHTML = `
                <strong>${attack.name}</strong> - 
                Dégâts: ${attack.damage}, 
                Limite d'usage: ${attack.usageLimit}, 
                Usage actuel: ${attack.usageCount}
            `;
            attacksList.appendChild(attackItem);
            
            // Select des attaques
            const option = document.createElement('option');
            option.value = attack.id;
            option.textContent = attack.name;
            attackSelect.appendChild(option);
        });
        
        attacksCount = attacks.length;
        updateStatus();
        return attacks;
    } catch (error) {
        addLog(`Erreur lors du chargement des attaques: ${error.message}`, 'error');
        return [];
    }
}

async function loadPokemon() {
    try {
        const pokemons = await fetchAPI('/pokemon');
        const pokemonList = document.getElementById('pokemon-list');
        const pokemonSelect = document.getElementById('pokemon-select');
        const healPokemonSelect = document.getElementById('heal-pokemon-select');
        const trainerPokemonSelect = document.getElementById('trainer-pokemon-select');
        
        pokemonList.innerHTML = '';
        pokemonSelect.innerHTML = '<option value="">Sélectionner un Pokémon</option>';
        healPokemonSelect.innerHTML = '<option value="">Sélectionner un Pokémon</option>';
        trainerPokemonSelect.innerHTML = '<option value="">Sélectionner un Pokémon</option>';
        
        pokemons.forEach(pokemon => {
            // Liste des Pokémon
            const pokemonItem = document.createElement('div');
            pokemonItem.className = 'list-item';
            
            let attacksText = 'Aucune attaque';
            if (pokemon.attacks && pokemon.attacks.length > 0) {
                attacksText = pokemon.attacks.map(a => a.name).join(', ');
            }
            
            let trainerText = 'Aucun dresseur';
            if (pokemon.trainer) {
                trainerText = pokemon.trainer.name;
            }
            
            pokemonItem.innerHTML = `
                <strong>${pokemon.name}</strong> - 
                PV: ${pokemon.lifePoints}/${pokemon.maxLifePoints}, 
                Attaques: ${attacksText}, 
                Dresseur: ${trainerText}
            `;
            pokemonList.appendChild(pokemonItem);
            
            // Select des Pokémon
            const option1 = document.createElement('option');
            option1.value = pokemon.id;
            option1.textContent = pokemon.name;
            pokemonSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = pokemon.id;
            option2.textContent = pokemon.name;
            healPokemonSelect.appendChild(option2);
            
            const option3 = document.createElement('option');
            option3.value = pokemon.id;
            option3.textContent = pokemon.name;
            trainerPokemonSelect.appendChild(option3);
        });
        
        pokemonCount = pokemons.length;
        updateStatus();
        return pokemons;
    } catch (error) {
        addLog(`Erreur lors du chargement des Pokémon: ${error.message}`, 'error');
        return [];
    }
}

async function loadTrainers() {
    try {
        const trainers = await fetchAPI('/trainers');
        const trainersList = document.getElementById('trainers-list');
        const trainerSelect = document.getElementById('trainer-select');
        const healTrainerSelect = document.getElementById('heal-trainer-select');
        const expTrainerSelect = document.getElementById('exp-trainer-select');
        const randomTrainer1 = document.getElementById('random-trainer1');
        const randomTrainer2 = document.getElementById('random-trainer2');
        const deterministicTrainer1 = document.getElementById('deterministic-trainer1');
        const deterministicTrainer2 = document.getElementById('deterministic-trainer2');
        const arena1Trainer1 = document.getElementById('arena1-trainer1');
        const arena1Trainer2 = document.getElementById('arena1-trainer2');
        const arena2Trainer1 = document.getElementById('arena2-trainer1');
        const arena2Trainer2 = document.getElementById('arena2-trainer2');
        
        const trainerSelects = [
            trainerSelect, healTrainerSelect, expTrainerSelect,
            randomTrainer1, randomTrainer2, deterministicTrainer1, deterministicTrainer2,
            arena1Trainer1, arena1Trainer2, arena2Trainer1, arena2Trainer2
        ];
        
        trainersList.innerHTML = '';
        trainerSelects.forEach(select => {
            select.innerHTML = '<option value="">Sélectionner un dresseur</option>';
        });
        
        trainers.forEach(trainer => {
            // Liste des dresseurs
            const trainerItem = document.createElement('div');
            trainerItem.className = 'list-item';
            
            let pokemonsText = 'Aucun Pokémon';
            if (trainer.pokemons && trainer.pokemons.length > 0) {
                pokemonsText = trainer.pokemons.map(p => p.name).join(', ');
            }
            
            trainerItem.innerHTML = `
                <strong>${trainer.name}</strong> - 
                Niveau: ${trainer.level}, 
                Expérience: ${trainer.experience}/10, 
                Pokémon: ${pokemonsText}
            `;
            trainersList.appendChild(trainerItem);
            
            // Select des dresseurs
            trainerSelects.forEach(select => {
                const option = document.createElement('option');
                option.value = trainer.id;
                option.textContent = trainer.name;
                select.appendChild(option);
            });
        });
        
        trainersCount = trainers.length;
        updateStatus();
        return trainers;
    } catch (error) {
        addLog(`Erreur lors du chargement des dresseurs: ${error.message}`, 'error');
        return [];
    }
}

// Actions de configuration
async function initializeDatabase() {
    try {
        addLog('Initialisation de la base de données...', 'info');
        
        // Créer des attaques
        const attacks = [
            { name: 'Éclair', damage: 20, usageLimit: 10 },
            { name: 'Flammèche', damage: 25, usageLimit: 8 },
            { name: 'Charge', damage: 15, usageLimit: 15 },
            { name: 'Hydrocanon', damage: 35, usageLimit: 5 }
        ];
        
        for (const attack of attacks) {
            await fetchAPI('/attacks', 'POST', attack);
            addLog(`Attaque "${attack.name}" créée`, 'success');
        }
        
        // Créer des Pokémon
        const pokemons = [
            { name: 'Pikachu', lifePoints: 100 },
            { name: 'Salamèche', lifePoints: 90 },
            { name: 'Bulbizarre', lifePoints: 120 },
            { name: 'Carapuce', lifePoints: 110 }
        ];
        
        for (const pokemon of pokemons) {
            await fetchAPI('/pokemon', 'POST', pokemon);
            addLog(`Pokémon "${pokemon.name}" créé`, 'success');
        }
        
        // Créer des dresseurs
        const trainers = [
            { name: 'Sacha' },
            { name: 'Pierre' }
        ];
        
        for (const trainer of trainers) {
            await fetchAPI('/trainers', 'POST', trainer);
            addLog(`Dresseur "${trainer.name}" créé`, 'success');
        }
        
        // Charger les données mises à jour
        await loadAllData();
        
        // Ajouter des attaques aux Pokémon
        await fetchAPI('/pokemon/1/attacks/1', 'POST');
        await fetchAPI('/pokemon/1/attacks/3', 'POST');
        await fetchAPI('/pokemon/2/attacks/2', 'POST');
        await fetchAPI('/pokemon/2/attacks/3', 'POST');
        await fetchAPI('/pokemon/3/attacks/3', 'POST');
        await fetchAPI('/pokemon/3/attacks/1', 'POST');
        await fetchAPI('/pokemon/4/attacks/4', 'POST');
        await fetchAPI('/pokemon/4/attacks/3', 'POST');
        addLog('Attaques ajoutées aux Pokémon', 'success');
        
        // Ajouter des Pokémon aux dresseurs
        await fetchAPI('/trainers/1/pokemons/1', 'POST');
        await fetchAPI('/trainers/1/pokemons/3', 'POST');
        await fetchAPI('/trainers/2/pokemons/2', 'POST');
        await fetchAPI('/trainers/2/pokemons/4', 'POST');
        addLog('Pokémon ajoutés aux dresseurs', 'success');
        
        // Recharger les données
        await loadAllData();
        
        addLog('Base de données initialisée avec succès!', 'success');
    } catch (error) {
        addLog(`Erreur lors de l'initialisation: ${error.message}`, 'error');
    }
}

// Actions Pokémon
async function createPokemon() {
    try {
        const name = document.getElementById('pokemon-name').value;
        const lifePoints = parseInt(document.getElementById('pokemon-life').value);
        
        if (!name || !lifePoints) {
            addLog('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const pokemon = await fetchAPI('/pokemon', 'POST', { name, lifePoints });
        addLog(`Pokémon "${pokemon.name}" créé avec succès`, 'success');
        
        // Réinitialiser les champs
        document.getElementById('pokemon-name').value = '';
        document.getElementById('pokemon-life').value = '';
        
        // Recharger les Pokémon
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors de la création du Pokémon: ${error.message}`, 'error');
    }
}

async function addAttackToPokemon() {
    try {
        const pokemonId = document.getElementById('pokemon-select').value;
        const attackId = document.getElementById('attack-select').value;
        
        if (!pokemonId || !attackId) {
            addLog('Veuillez sélectionner un Pokémon et une attaque', 'error');
            return;
        }
        
        await fetchAPI(`/pokemon/${pokemonId}/attacks/${attackId}`, 'POST');
        addLog('Attaque ajoutée au Pokémon avec succès', 'success');
        
        // Recharger les Pokémon
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors de l'ajout de l'attaque: ${error.message}`, 'error');
    }
}

async function healPokemon() {
    try {
        const pokemonId = document.getElementById('heal-pokemon-select').value;
        
        if (!pokemonId) {
            addLog('Veuillez sélectionner un Pokémon', 'error');
            return;
        }
        
        await fetchAPI(`/pokemon/${pokemonId}/heal`, 'POST');
        addLog('Pokémon soigné avec succès', 'success');
        
        // Recharger les Pokémon
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors du soin du Pokémon: ${error.message}`, 'error');
    }
}

// Actions Attaques
async function createAttack() {
    try {
        const name = document.getElementById('attack-name').value;
        const damage = parseInt(document.getElementById('attack-damage').value);
        const usageLimit = parseInt(document.getElementById('attack-limit').value);
        
        if (!name || !damage || !usageLimit) {
            addLog('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const attack = await fetchAPI('/attacks', 'POST', { name, damage, usageLimit });
        addLog(`Attaque "${attack.name}" créée avec succès`, 'success');
        
        // Réinitialiser les champs
        document.getElementById('attack-name').value = '';
        document.getElementById('attack-damage').value = '';
        document.getElementById('attack-limit').value = '';
        
        // Recharger les attaques
        await loadAttacks();
    } catch (error) {
        addLog(`Erreur lors de la création de l'attaque: ${error.message}`, 'error');
    }
}

// Actions Dresseurs
async function createTrainer() {
    try {
        const name = document.getElementById('trainer-name').value;
        
        if (!name) {
            addLog('Veuillez entrer un nom', 'error');
            return;
        }
        
        const trainer = await fetchAPI('/trainers', 'POST', { name });
        addLog(`Dresseur "${trainer.name}" créé avec succès`, 'success');
        
        // Réinitialiser les champs
        document.getElementById('trainer-name').value = '';
        
        // Recharger les dresseurs
        await loadTrainers();
    } catch (error) {
        addLog(`Erreur lors de la création du dresseur: ${error.message}`, 'error');
    }
}

async function addPokemonToTrainer() {
    try {
        const trainerId = document.getElementById('trainer-select').value;
        const pokemonId = document.getElementById('trainer-pokemon-select').value;
        
        if (!trainerId || !pokemonId) {
            addLog('Veuillez sélectionner un dresseur et un Pokémon', 'error');
            return;
        }
        
        await fetchAPI(`/trainers/${trainerId}/pokemons/${pokemonId}`, 'POST');
        addLog('Pokémon ajouté au dresseur avec succès', 'success');
        
        // Recharger les données
        await loadTrainers();
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors de l'ajout du Pokémon au dresseur: ${error.message}`, 'error');
    }
}

async function healTrainerPokemon() {
    try {
        const trainerId = document.getElementById('heal-trainer-select').value;
        
        if (!trainerId) {
            addLog('Veuillez sélectionner un dresseur', 'error');
            return;
        }
        
        await fetchAPI(`/trainers/${trainerId}/heal`, 'POST');
        addLog('Tous les Pokémon du dresseur ont été soignés', 'success');
        
        // Recharger les données
        await loadTrainers();
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors du soin des Pokémon: ${error.message}`, 'error');
    }
}

async function gainExperience() {
    try {
        const trainerId = document.getElementById('exp-trainer-select').value;
        const amount = parseInt(document.getElementById('exp-amount').value);
        
        if (!trainerId || !amount) {
            addLog('Veuillez sélectionner un dresseur et entrer un montant', 'error');
            return;
        }
        
        const result = await fetchAPI(`/trainers/${trainerId}/experience`, 'POST', { amount });
        addLog(`Expérience gagnée avec succès. Niveau actuel: ${result.trainer.level}, Expérience: ${result.trainer.experience}/10`, 'success');
        
        // Réinitialiser les champs
        document.getElementById('exp-amount').value = '';
        
        // Recharger les dresseurs
        await loadTrainers();
    } catch (error) {
        addLog(`Erreur lors du gain d'expérience: ${error.message}`, 'error');
    }
}

// Actions Combats
async function randomBattle() {
    try {
        const trainer1Id = document.getElementById('random-trainer1').value;
        const trainer2Id = document.getElementById('random-trainer2').value;
        
        if (!trainer1Id || !trainer2Id) {
            addLog('Veuillez sélectionner deux dresseurs', 'error');
            return;
        }
        
        const result = await fetchAPI(`/battles/random/${trainer1Id}/${trainer2Id}`, 'POST');
        displayBattleResult(result);
        addLog('Combat aléatoire terminé', 'success');
        
        // Recharger les données
        await loadTrainers();
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors du combat aléatoire: ${error.message}`, 'error');
    }
}

async function deterministicBattle() {
    try {
        const trainer1Id = document.getElementById('deterministic-trainer1').value;
        const trainer2Id = document.getElementById('deterministic-trainer2').value;
        
        if (!trainer1Id || !trainer2Id) {
            addLog('Veuillez sélectionner deux dresseurs', 'error');
            return;
        }
        
        const result = await fetchAPI(`/battles/deterministic/${trainer1Id}/${trainer2Id}`, 'POST');
        displayBattleResult(result);
        addLog('Combat déterministe terminé', 'success');
        
        // Recharger les données
        await loadTrainers();
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors du combat déterministe: ${error.message}`, 'error');
    }
}

async function arena1Battle() {
    try {
        const trainer1Id = document.getElementById('arena1-trainer1').value;
        const trainer2Id = document.getElementById('arena1-trainer2').value;
        
        if (!trainer1Id || !trainer2Id) {
            addLog('Veuillez sélectionner deux dresseurs', 'error');
            return;
        }
        
        addLog('Combat d\'arène 1 en cours... (cela peut prendre un moment)', 'info');
        const result = await fetchAPI(`/battles/arena1/${trainer1Id}/${trainer2Id}`, 'POST');
        displayArenaResult(result);
        addLog('Combat d\'arène 1 terminé', 'success');
        
        // Recharger les données
        await loadTrainers();
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors du combat d'arène 1: ${error.message}`, 'error');
    }
}

async function arena2Battle() {
    try {
        const trainer1Id = document.getElementById('arena2-trainer1').value;
        const trainer2Id = document.getElementById('arena2-trainer2').value;
        
        if (!trainer1Id || !trainer2Id) {
            addLog('Veuillez sélectionner deux dresseurs', 'error');
            return;
        }
        
        addLog('Combat d\'arène 2 en cours... (cela peut prendre un moment)', 'info');
        const result = await fetchAPI(`/battles/arena2/${trainer1Id}/${trainer2Id}`, 'POST');
        displayArenaResult(result);
        addLog('Combat d\'arène 2 terminé', 'success');
        
        // Recharger les données
        await loadTrainers();
        await loadPokemon();
    } catch (error) {
        addLog(`Erreur lors du combat d'arène 2: ${error.message}`, 'error');
    }
}

// Affichage des résultats
function displayBattleResult(result) {
    const battleResult = document.getElementById('battle-result');
    
    let html = `
        <h4>Vainqueur: ${result.winner.name}</h4>
        <p><strong>Rounds:</strong> ${result.rounds}</p>
        <p><strong>Pokémon vainqueur:</strong> ${result.winnerPokemon.name} (PV: ${result.winnerPokemon.lifePoints}/${result.winnerPokemon.maxLifePoints})</p>
        <p><strong>Pokémon perdant:</strong> ${result.loserPokemon.name} (PV: ${result.loserPokemon.lifePoints}/${result.loserPokemon.maxLifePoints})</p>
        <h4>Journal de combat:</h4>
        <ul>
    `;
    
    result.battleLog.forEach(log => {
        html += `<li>${log}</li>`;
    });
    
    html += '</ul>';
    battleResult.innerHTML = html;
}

function displayArenaResult(result) {
    const battleResult = document.getElementById('battle-result');
    
    let html = `
        <h4>Vainqueur: ${result.winner.name}</h4>
        <p><strong>Victoires de ${result.winner.name}:</strong> ${result.trainer1Wins}</p>
        <p><strong>Victoires de l'adversaire:</strong> ${result.trainer2Wins}</p>
    `;
    
    if (result.earlyStop) {
        html += `<p><strong>Arrêt anticipé:</strong> Un dresseur a perdu tous ses Pokémon</p>`;
    }
    
    battleResult.innerHTML = html;
}
