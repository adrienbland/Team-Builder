import { state, swapSlots, setActiveSlot } from '../state.js?v=3';
import { ALL_TYPES, TYPE_IDS } from '../utils/typeChart.js?v=3';

export function renderTeam() {
    const container = document.getElementById('team-column');
    let html = '';

    for (let i = 0; i < 6; i++) {
        const pokemon = state.team[i];
        const isActive = state.activeSlot === i ? 'active-slot' : '';
        
        if (pokemon) {
            
            html += `
                <div class="slot-card filled ${isActive}" draggable="true" data-index="${i}">
                    <img src="${pokemon.sprites}" alt="${pokemon.name}">
                    <div class="slot-info">
                        <strong>${pokemon.name_fr || pokemon.name}</strong>
                    </div>
                    <button class="remove-btn" data-index="${i}">X</button>
                </div>
            `;
        } else {
            
            html += `
                <div class="slot-card empty ${isActive}" data-index="${i}">
                    <span>+ Slot ${i + 1}</span>
                </div>
            `;
        }
    }

    html += renderTeamSummary();

    container.innerHTML = html;
    attachDragAndDropEvents();
}

function renderTeamSummary() {
    const activePokemon = state.team.filter(p => p !== null);
    if (activePokemon.length === 0) return '';

    const typeCount = {};
    activePokemon.forEach(p => {
        p.types.forEach(t => {
            typeCount[t] = (typeCount[t] || 0) + 1;
        });
    });

    const sortedTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
    
    const typesHTML = sortedTypes.map(([t, count]) => `
        <span style="background-color: var(--type-${t}); padding: 3px 8px; border-radius: 10px; font-size: 0.8rem; margin: 2px; color: white; display: inline-flex; align-items: center; gap: 4px;">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[t]}.png" style="width: 12px; height: 12px;">
            ${t} x${count}
        </span>
    `).join('');

    return `
        <div class="team-summary" style="margin-top: 20px; padding: 15px; background-color: var(--bg-input); border-radius: 10px; border: 1px solid #444;">
            <h4 style="color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Résumé de l'équipe</h4>
            <p style="font-size: 0.9rem; margin-bottom: 5px;"><strong>Types présents :</strong></p>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${typesHTML}
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px; font-style: italic;">Clique sur tes Pokémon pour voir leurs faiblesses détaillées.</p>
        </div>
    `;
}

function attachDragAndDropEvents() {
    const slots = document.querySelectorAll('.slot-card');
    let draggedIndex = null;

    slots.forEach(slot => {
        
        slot.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-btn')) {
                const index = parseInt(slot.getAttribute('data-index'));
                setActiveSlot(index);
                renderTeam(); 
                document.getElementById('pokemon-search').focus(); 
            }
        });

        slot.addEventListener('dragstart', (e) => {
            draggedIndex = parseInt(slot.getAttribute('data-index'));
            slot.style.opacity = '0.5';
        });

        slot.addEventListener('dragend', () => {
            slot.style.opacity = '1';
        });

        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); 
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetIndex = parseInt(slot.getAttribute('data-index'));
            
            if (draggedIndex !== null && draggedIndex !== targetIndex) {
                swapSlots(draggedIndex, targetIndex);
                renderTeam();
            }
        });
    });
}