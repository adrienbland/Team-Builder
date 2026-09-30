import { state } from '../state.js?v=3';
import { renderTeam } from './TeamBuilder.js?v=3';
import { TYPE_TRANSLATIONS, TYPE_IDS } from '../utils/typeChart.js?v=3';

export function initMoveModalEvents(pokemon) {
    const slots = document.querySelectorAll('.move-slot');
    
    slots.forEach(slot => {
        slot.addEventListener('click', (e) => {
            const moveIndex = parseInt(slot.getAttribute('data-move-index'));
            openMoveModal(pokemon, moveIndex);
        });
    });
}

function openMoveModal(pokemon, moveIndex) {
    const container = document.getElementById('active-pokemon-details');
    if (!container) return;
    
    document.getElementById('modal-overlay').classList.add('hidden');

    const learnableMoves = pokemon.moves.map(m => {
        return window.movesData && window.movesData[m] ? { id: m, ...window.movesData[m] } : { id: m, fr: m, type: 'normal' };
    });

    learnableMoves.sort((a, b) => (a.fr || a.id).localeCompare(b.fr || b.id));

    const getTypeName = (t) => TYPE_TRANSLATIONS[t] || t;
    const renderTypeBadge = (t) => `<span style="background-color: var(--type-${t}); padding: 4px 10px; border-radius: 6px; font-size: 0.9rem; text-transform: uppercase; margin: 2px; color: white; display: inline-flex; align-items: center; gap: 4px; font-weight: bold;"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[t]}.png" style="width: 14px; height: 14px;">${getTypeName(t)}</span>`;
    
    let html = `
        <div class="wiki-card">
            <h2 style="margin-bottom: 25px; color: var(--type-water); font-size: 2rem;">⚔️ Choisir une capacité pour ${pokemon.name_fr || pokemon.name} (Slot ${moveIndex + 1})</h2>
            <button id="cancel-move-btn" style="margin-bottom: 20px; padding: 10px 20px; background: #444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem;">⬅️ Retour au Pokémon</button>
            <input type="text" id="move-search-input" placeholder="Rechercher une attaque..." style="width: 100%; padding: 15px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #555; background: #222; color: white; outline: none; font-size: 1.2rem;">
            
            <div id="moves-list-container" style="display: grid; grid-template-columns: 1fr; gap: 15px; max-height: 60vh; overflow-y: auto; padding-right: 15px;">
    `;

    const createMoveHTML = (move) => `
        <div class="move-option" data-move-id="${move.id}" style="border: 1px solid #444; border-radius: 12px; padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #222; transition: background 0.2s, transform 0.1s;">
            <div>
                <strong style="font-size: 1.3rem; text-transform: capitalize;">${move.fr}</strong>
                <div style="margin-top: 8px;">
                    ${renderTypeBadge(move.type)}
                    ${move.category ? `<span style="font-size: 1rem; color: #aaa; margin-left: 10px;">${move.category === 'physical' ? '⚔️ Physique' : move.category === 'special' ? '🔮 Spécial' : '🛡️ Statut'}</span>` : ''}
                </div>
            </div>
            <div style="text-align: right; color: #ccc; font-size: 1.1rem;">
                ${move.power ? `<div style="font-weight: bold; color: white;">Puis: ${move.power}</div>` : '<div style="color: #666;">Puis: -</div>'}
                ${move.accuracy ? `<div>Préc: ${move.accuracy}%</div>` : '<div>Préc: -</div>'}
                ${move.pp ? `<div style="color: #a7db8d;">PP: ${move.pp}</div>` : ''}
            </div>
        </div>
    `;
    
    html += learnableMoves.map(createMoveHTML).join('');
    
    html += `</div>
            <button id="remove-move-btn" style="margin-top: 30px; padding: 15px; width: 100%; background: #ff4c4c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.2rem; font-weight: bold;">🗑️ Vider cet emplacement</button>
        </div>
    `;
    
    container.innerHTML = html;

    const moveSearchInput = document.getElementById('move-search-input');
    const movesListContainer = document.getElementById('moves-list-container');
    
    moveSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredMoves = learnableMoves.filter(m => (m.fr && m.fr.toLowerCase().includes(query)) || m.id.toLowerCase().includes(query) || (m.type && m.type.toLowerCase().includes(query)));
        movesListContainer.innerHTML = filteredMoves.map(createMoveHTML).join('');
        attachMoveClickEvents();
    });

    const attachMoveClickEvents = () => {
        const options = movesListContainer.querySelectorAll('.move-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedMoveId = opt.getAttribute('data-move-id');
                pokemon.activeMoves[moveIndex] = selectedMoveId;
                
                document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
            });
        });
    };
    
    attachMoveClickEvents();
    
    document.getElementById('remove-move-btn').addEventListener('click', () => {
        pokemon.activeMoves[moveIndex] = null;
        document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
    });
    
    document.getElementById('cancel-move-btn').addEventListener('click', () => {
        
        if (typeof window.afficherDetails === 'function') {
            window.afficherDetails(pokemon);
        } else {
            
            document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
        }
    });
}