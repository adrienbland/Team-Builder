import { state } from '../state.js?v=3';
import { ALL_TYPES, calculateWeaknesses, TYPE_TRANSLATIONS, TYPE_IDS } from '../utils/typeChart.js?v=3';

export function initTeamSummaryModal() {
    const btn = document.getElementById('btn-team-summary');
    if (!btn) return;

    btn.addEventListener('click', () => {
        openTeamSummaryModal();
    });
}

function openTeamSummaryModal() {
    const container = document.getElementById('active-pokemon-details');
    if (!container) return;

    document.getElementById('modal-overlay').classList.add('hidden');
    
    const activePokemon = state.team.filter(p => p !== null);
    
    if (activePokemon.length === 0) {
        container.innerHTML = `
            <div class="wiki-card">
                <h2 style="margin-bottom: 20px; color: var(--type-electric); font-size: 2rem;">📋 Résumé de l'équipe</h2>
                <p style="color: var(--text-muted); font-size: 1.2rem;">Ton équipe est vide. Ajoute des Pokémon pour voir le résumé !</p>
            </div>
        `;
        return;
    }

    const getTypeName = (t) => TYPE_TRANSLATIONS[t] || t;
    const renderBadge = (t) => `<span style="background-color: var(--type-${t}); padding: 5px 12px; border-radius: 6px; font-size: 1rem; text-transform: uppercase; margin: 4px; color: white; display: inline-flex; align-items: center; gap: 6px; font-weight: bold;"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[t]}.png" style="width: 16px; height: 16px;">${getTypeName(t)}</span>`;

    const teamWeaknessesCount = {};
    const teamResistancesCount = {};
    const teamImmunitiesCount = {};
    
    ALL_TYPES.forEach(t => {
        teamWeaknessesCount[t] = 0;
        teamResistancesCount[t] = 0;
        teamImmunitiesCount[t] = 0;
    });

    activePokemon.forEach(p => {
        const weak = calculateWeaknesses(p.types);
        for (const [type, mult] of Object.entries(weak)) {
            if (mult > 1) teamWeaknessesCount[type]++;
            else if (mult === 0) teamImmunitiesCount[type]++;
            else if (mult < 1) teamResistancesCount[type]++;
        }
    });

    const dangerTypes = ALL_TYPES.filter(t => teamWeaknessesCount[t] > 0 && teamResistancesCount[t] === 0 && teamImmunitiesCount[t] === 0);
    
    const safeTypes = ALL_TYPES.filter(t => teamResistancesCount[t] > 1 || teamImmunitiesCount[t] > 0);

    let html = `
        <div class="wiki-card">
            <h2 style="margin-bottom: 25px; color: var(--type-electric); font-size: 2rem;">📋 Résumé de l'équipe (${activePokemon.length}/6)</h2>
            
            <div style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                ${activePokemon.map(p => `<img src="${p.sprites}" alt="${p.name}" style="width: 80px; height: 80px; background: #222; border-radius: 50%; border: 3px solid #444; image-rendering: pixelated;">`).join('')}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
                <div class="wiki-section" style="border-color: #ff4c4c; padding: 20px;">
                    <h3 style="color: #ff4c4c; font-size: 1.5rem; margin-bottom: 15px;">⚠️ Dangers (Non couverts)</h3>
                    <p style="font-size: 1.1rem; color: #ccc; margin-bottom: 15px;">Ton équipe a des faiblesses à ces types, et personne n'y résiste :</p>
                    <div>
                        ${dangerTypes.length > 0 ? dangerTypes.map(renderBadge).join('') : '<span style="color: #a7db8d; font-size: 1.2rem; font-weight: bold;">Excellente couverture ! Aucun danger majeur.</span>'}
                    </div>
                </div>
                
                <div class="wiki-section" style="border-color: #a7db8d; padding: 20px;">
                    <h3 style="color: #a7db8d; font-size: 1.5rem; margin-bottom: 15px;">🛡️ Excellentes défenses</h3>
                    <p style="font-size: 1.1rem; color: #ccc; margin-bottom: 15px;">Ton équipe encaisse très bien ces types :</p>
                    <div>
                        ${safeTypes.length > 0 ? safeTypes.map(renderBadge).join('') : '<span style="color: #ff4c4c; font-size: 1.2rem; font-weight: bold;">Attention, peu de résistances majeures.</span>'}
                    </div>
                </div>
            </div>
            
            <div class="wiki-section" style="margin-top: 30px; padding: 20px;">
                <h3 style="font-size: 1.5rem; margin-bottom: 20px;">Bilan des faiblesses globales</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${ALL_TYPES.filter(t => teamWeaknessesCount[t] > 0).map(t => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px 15px; border-radius: 8px; border: 1px solid #444;">
                            ${renderBadge(t)}
                            <span style="color: #ff4c4c; font-weight: bold; font-size: 1.2rem;">${teamWeaknessesCount[t]} <span style="font-size: 0.9rem; color: #888;">pokémon(s)</span></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
