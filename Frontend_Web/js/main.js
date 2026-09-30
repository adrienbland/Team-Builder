import { fetchPokemon, fetchEvolutions } from './api.js?v=3';
import { state, setPokemonInSlot, removePokemonFromSlot, saveState } from './state.js?v=3';
import { renderTeam } from './components/TeamBuilder.js?v=3';
import { createPokemonCardHTML } from './components/PokemonCard.js?v=3';

import { initTypeChartModal } from './components/TypeChartModal.js?v=3';
import { initTeamSummaryModal } from './components/TeamSummaryModal.js?v=3';
import { initMoveModalEvents } from './components/MoveModal.js?v=3';
import { openItemSelectionView } from './components/ItemSelectionView.js?v=3';

window.pokemonList = [];

document.addEventListener('DOMContentLoaded', async () => {
    renderTeam();
    initTypeChartModal();
    initTeamSummaryModal();

    const activePokemon = state.team[state.activeSlot];
    if (activePokemon) {

    }

    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('hidden');
    });
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            document.getElementById('modal-overlay').classList.add('hidden');
        }
    });

    document.addEventListener('pokemonUpdated', (e) => {
        
        saveState();
        renderTeam();
        afficherDetails(e.detail);
    });

    const searchInput = document.getElementById('pokemon-search');
    const searchResults = document.getElementById('search-results');
    const teamColumn = document.getElementById('team-column');

    if (!searchInput || !searchResults || !teamColumn) {
        console.error("Erreur critique : Un élément HTML est introuvable dans le DOM.");
        return;
    }

    try {
        const [pokeRes, movesRes, abilitiesRes, itemsRes] = await Promise.all([
            fetch('data/pokemon_fr.json'),
            fetch('data/moves_fr.json'),
            fetch('data/abilities_fr.json'),
            fetch('data/items_fr.json')
        ]);
        window.pokemonList = await pokeRes.json();
        window.movesData = await movesRes.json();
        window.abilitiesData = await abilitiesRes.json();
        window.itemsData = await itemsRes.json();

        const activePokemon = state.team[state.activeSlot];
        if (activePokemon) {
            afficherDetails(activePokemon);
        }
    } catch (e) {
        console.error("Impossible de charger les fichiers JSON", e);
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        searchResults.innerHTML = '';
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = window.pokemonList.filter(p => 
            p.fr.toLowerCase().includes(query) || p.en.toLowerCase().includes(query)
        ).slice(0, 10); 

        if (matches.length > 0) {
            searchResults.style.display = 'block';
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${match.id}.png" alt="${match.fr}">
                    <span>${match.fr} <small style="color:var(--text-muted)">(${match.en})</small></span>
                `;
                
                div.addEventListener('click', () => {
                    searchInput.value = '';
                    searchResults.style.display = 'none';
                    selectPokemon(match.id, match.fr);
                });
                
                searchResults.appendChild(div);
            });
        } else {
            searchResults.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.style.display = 'none';
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            const matches = window.pokemonList.filter(p => 
                p.fr.toLowerCase().includes(query) || p.en.toLowerCase().includes(query)
            );

            if (matches.length > 0) {
                searchInput.value = '';
                searchResults.style.display = 'none';
                selectPokemon(matches[0].id, matches[0].fr);
            } else {
                alert(`Pokémon "${query}" introuvable.`);
            }
        }
    });

    teamColumn.addEventListener('click', (e) => {
        const slotCard = e.target.closest('.slot-card');
        if (!slotCard) return;

        const index = parseInt(slotCard.getAttribute('data-index'));

        if (e.target.classList.contains('remove-btn')) {
            removePokemonFromSlot(index);
            renderTeam();
            document.getElementById('active-pokemon-details').innerHTML = '<p class="placeholder-text">Sélectionne un slot à gauche.</p>';
        } else if (slotCard.classList.contains('filled')) {
            afficherDetails(state.team[index]);
        }
    });
});

async function selectPokemon(idOrName, nomFr = null) {
    const searchInput = document.getElementById('pokemon-search');
    const oldPlaceholder = searchInput.placeholder;
    searchInput.placeholder = "Chargement...";
    
    const pokemonData = await fetchPokemon(idOrName);

    if (pokemonData) {
        if (nomFr) {
            pokemonData.name_fr = nomFr; 
        }

        pokemonData.level = pokemonData.level || 50;
        pokemonData.evs = pokemonData.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
        pokemonData.ivs = pokemonData.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
        
        setPokemonInSlot(pokemonData, state.activeSlot);

        let nextSlot = state.team.findIndex((p, i) => p === null && i > state.activeSlot);
        if (nextSlot === -1) nextSlot = state.team.findIndex(p => p === null);
        if (nextSlot !== -1) {
            state.activeSlot = nextSlot;
        }

        renderTeam();
        afficherDetails(pokemonData);
    } else {
        alert(`Erreur lors de la récupération des données.`);
    }

    searchInput.placeholder = oldPlaceholder;
}

function afficherDetails(pokemon) {
    const detailsContainer = document.getElementById('active-pokemon-details');
    if (!detailsContainer) return;
    
    detailsContainer.innerHTML = createPokemonCardHTML(pokemon); 
    
    const removeBtn = detailsContainer.querySelector('.remove-btn');
    if (removeBtn) removeBtn.style.display = 'none';

    initMoveModalEvents(pokemon);

    const natureSelect = detailsContainer.querySelector('.nature-select');
    if (natureSelect) {
        if (pokemon.nature) natureSelect.value = pokemon.nature;
        natureSelect.addEventListener('change', (e) => {
            pokemon.nature = e.target.value;
            document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
        });
    }

    const itemSlot = detailsContainer.querySelector('#held-item-slot');
    if (itemSlot) {
        itemSlot.addEventListener('click', () => {
            openItemSelectionView(pokemon);
        });
    }

    const levelInput = detailsContainer.querySelector('#level-input');
    if (levelInput) {
        levelInput.addEventListener('change', (e) => {
            pokemon.level = parseInt(e.target.value) || 50;
            document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
        });
    }

    const evInputs = detailsContainer.querySelectorAll('.ev-input');
    evInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const stat = e.target.getAttribute('data-stat');
            let val = parseInt(e.target.value) || 0;
            if (val < 0) val = 0;
            if (val > 252) val = 252;
            pokemon.evs[stat] = val;
            document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
        });
    });

    const ivInputs = detailsContainer.querySelectorAll('.iv-input');
    ivInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const stat = e.target.getAttribute('data-stat');
            let val = parseInt(e.target.value) || 0;
            if (val < 0) val = 0;
            if (val > 31) val = 31;
            pokemon.ivs[stat] = val;
            document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
        });
    });

    const evoContainer = detailsContainer.querySelector('#evolution-container');
    if (evoContainer) {
        fetchEvolutions(pokemon.id).then(evolutions => {
            if (evolutions.length <= 1) {
                evoContainer.style.display = 'none'; 
                return;
            }

            const evoHTML = evolutions.map(evoName => {
                const found = window.pokemonList.find(p => p.en.toLowerCase() === evoName.toLowerCase() || p.id == evoName);
                if (!found) return '';
                
                const isCurrent = (found.id == pokemon.id);
                return `
                    <div style="text-align: center; cursor: ${isCurrent ? 'default' : 'pointer'}; opacity: ${isCurrent ? '1' : '0.6'}; transition: opacity 0.2s;" 
                         class="${isCurrent ? '' : 'evo-link'}" 
                         data-id="${found.id}" data-fr="${found.fr}">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${found.id}.png" style="width: 50px; height: 50px;">
                        <div style="font-size: 0.8rem;">${found.fr}</div>
                    </div>
                `;
            }).join('<div style="color: #666;">▶</div>');
            
            evoContainer.innerHTML = evoHTML;

            const evoLinks = evoContainer.querySelectorAll('.evo-link');
            evoLinks.forEach(link => {
                link.addEventListener('click', () => {
                    selectPokemon(link.getAttribute('data-id'), link.getAttribute('data-fr'));
                });
            });

            evoLinks.forEach(link => {
                link.addEventListener('mouseenter', () => link.style.opacity = '1');
                link.addEventListener('mouseleave', () => link.style.opacity = '0.6');
            });
        });
    }
}

window.afficherDetails = afficherDetails;