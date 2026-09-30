import { ALL_TYPES, calculateWeaknesses, calculateOffensiveCoverage, TYPE_TRANSLATIONS, TYPE_IDS } from '../utils/typeChart.js?v=3';

export function initTypeChartModal() {
    const btn = document.getElementById('btn-type-chart');
    if (!btn) return;

    btn.addEventListener('click', () => {
        openTypeChartModal();
    });
}

function openTypeChartModal() {
    const container = document.getElementById('active-pokemon-details');
    if (!container) return;
    
    document.getElementById('modal-overlay').classList.add('hidden');
    
    const getTypeName = (t) => TYPE_TRANSLATIONS[t] || t;
    
    let html = `
        <div class="wiki-card">
            <h2 style="margin-bottom: 25px; color: var(--type-water); font-size: 2rem;">📊 Table Interactive des Types</h2>
            <p style="margin-bottom: 20px; color: var(--text-muted); font-size: 1.2rem;">Sélectionne un ou deux types pour voir leurs forces et faiblesses combinées.</p>
            
            <div id="type-selector" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 30px;">
                ${ALL_TYPES.map(t => `<button class="type-btn" data-type="${t}" style="background-color: var(--type-${t}); color: white; border: 3px solid transparent; padding: 10px 20px; border-radius: 25px; cursor: pointer; text-transform: uppercase; font-weight: bold; font-size: 1.1rem; transition: transform 0.1s; display: inline-flex; align-items: center; gap: 6px;"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[t]}.png" style="width: 16px; height: 16px;">${getTypeName(t)}</button>`).join('')}
            </div>
            
            <div id="type-chart-results" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; border-top: 2px solid #444; padding-top: 30px;">
                <div id="defensive-results" class="wiki-section" style="padding: 20px;">
                    <h3 style="font-size: 1.5rem;">Bouclier (Défense)</h3>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">Sélectionne un type en haut...</p>
                </div>
                <div id="offensive-results" class="wiki-section" style="padding: 20px;">
                    <h3 style="font-size: 1.5rem;">Épée (Offensif STAB)</h3>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">Sélectionne un type en haut...</p>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
                <button id="reset-types-btn" style="padding: 12px 25px; font-size: 1.1rem; background: #444; color: white; border: none; border-radius: 8px; cursor: pointer;">Réinitialiser</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;

    let selectedTypes = [];

    const typeBtns = container.querySelectorAll('.type-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const t = e.target.getAttribute('data-type');
            if (selectedTypes.includes(t)) {
                selectedTypes = selectedTypes.filter(x => x !== t);
                e.target.style.transform = 'scale(1)';
                e.target.style.borderColor = 'transparent';
            } else {
                if (selectedTypes.length >= 2) {
                    alert("Tu ne peux sélectionner que 2 types maximum !");
                    return;
                }
                selectedTypes.push(t);
                e.target.style.transform = 'scale(1.1)';
                e.target.style.borderColor = 'white';
            }
            updateResults(selectedTypes);
        });
    });

    document.getElementById('reset-types-btn').addEventListener('click', () => {
        selectedTypes = [];
        typeBtns.forEach(b => {
            b.style.transform = 'scale(1)';
            b.style.borderColor = 'transparent';
        });
        updateResults([]);
    });
}

function updateResults(types) {
    const defContainer = document.getElementById('defensive-results');
    const offContainer = document.getElementById('offensive-results');
    
    if (types.length === 0) {
        defContainer.innerHTML = `<h3>Bouclier (Défense)</h3><p style="color: var(--text-muted); font-size: 0.9rem;">Sélectionne un type en haut...</p>`;
        offContainer.innerHTML = `<h3>Épée (Offensif STAB)</h3><p style="color: var(--text-muted); font-size: 0.9rem;">Sélectionne un type en haut...</p>`;
        return;
    }

    const getTypeName = (t) => TYPE_TRANSLATIONS[t] || t;
    const renderBadge = (t) => `<span style="background-color: var(--type-${t}); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; margin: 2px; color: white; display: inline-flex; align-items: center; gap: 4px;"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[t]}.png" style="width: 12px; height: 12px;">${getTypeName(t)}</span>`;

    const weaknesses = calculateWeaknesses(types);
    const weak4x = [], weak2x = [], resist05x = [], resist025x = [], immune0x = [];
    for (const [t, mult] of Object.entries(weaknesses)) {
        if (mult === 4) weak4x.push(t);
        if (mult === 2) weak2x.push(t);
        if (mult === 0.5) resist05x.push(t);
        if (mult === 0.25) resist025x.push(t);
        if (mult === 0) immune0x.push(t);
    }
    
    defContainer.innerHTML = `
        <h3>Bouclier (Défense)</h3>
        <p style="font-size: 0.9rem; margin-bottom: 10px;">En tant que Pokémon <strong>${types.map(renderBadge).join(' / ')}</strong> :</p>
        <div class="weakness-section">
            ${weak4x.length > 0 ? `<p><strong>Très faible (x4) :</strong><br> ${weak4x.map(renderBadge).join('')}</p>` : ''}
            ${weak2x.length > 0 ? `<p><strong>Faible (x2) :</strong><br> ${weak2x.map(renderBadge).join('')}</p>` : ''}
            ${resist05x.length > 0 ? `<p><strong>Résiste (x0.5) :</strong><br> ${resist05x.map(renderBadge).join('')}</p>` : ''}
            ${resist025x.length > 0 ? `<p><strong>Résiste (x0.25) :</strong><br> ${resist025x.map(renderBadge).join('')}</p>` : ''}
            ${immune0x.length > 0 ? `<p><strong>Immunisé (x0) :</strong><br> ${immune0x.map(renderBadge).join('')}</p>` : ''}
            ${weak4x.length===0 && weak2x.length===0 && resist05x.length===0 && resist025x.length===0 && immune0x.length===0 ? '<p>Aucune faiblesse ou résistance.</p>' : ''}
        </div>
    `;

    const offense = calculateOffensiveCoverage(types);
    offContainer.innerHTML = `
        <h3>Épée (Offensif STAB)</h3>
        <p style="font-size: 0.9rem; margin-bottom: 10px;">Avec des attaques <strong>${types.map(renderBadge).join(' / ')}</strong> :</p>
        <div class="weakness-section">
            ${offense.superEffective.length > 0 ? `<p><strong>Très efficace (x2) :</strong><br> ${offense.superEffective.map(renderBadge).join('')}</p>` : ''}
            ${offense.notVeryEffective.length > 0 ? `<p><strong>Pas très efficace (x0.5) :</strong><br> ${offense.notVeryEffective.map(renderBadge).join('')}</p>` : ''}
            ${offense.noEffect.length > 0 ? `<p><strong>Sans effet (x0) :</strong><br> ${offense.noEffect.map(renderBadge).join('')}</p>` : ''}
        </div>
    `;
}
