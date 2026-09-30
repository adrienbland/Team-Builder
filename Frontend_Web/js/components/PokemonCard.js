import { calculateWeaknesses, calculateOffensiveCoverage, TYPE_TRANSLATIONS, TYPE_IDS } from '../utils/typeChart.js?v=3';

export function createPokemonCardHTML(pokemon) {
    if (!pokemon) return `<div class="pokemon-card">Données indisponibles</div>`;

    const getTypeName = (t) => TYPE_TRANSLATIONS[t] || t;

    const typesHTML = pokemon.types.map(typeName => {
        return `<span style="background-color: var(--type-${typeName}); padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; margin: 0 5px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); display: inline-flex; align-items: center; gap: 6px;">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[typeName]}.png" style="width: 16px; height: 16px;">
                    ${getTypeName(typeName)}
                </span>`;
    }).join('');

    const calculateStat = (base, statName, applyModifiers = true) => {
        const iv = pokemon.ivs ? pokemon.ivs[statName] : 31;
        const ev = pokemon.evs ? pokemon.evs[statName] : 0;
        const level = pokemon.level || 50;
        let natureMod = 1.0;
        
        if (applyModifiers && pokemon.nature) {
            const n = pokemon.nature;
            if (statName === 'atk') {
                if (['rigide', 'brave', 'solo', 'mauvais'].includes(n)) natureMod = 1.1;
                if (['timide', 'modeste', 'calme', 'assuré'].includes(n)) natureMod = 0.9;
            }
            if (statName === 'def') {
                if (['assuré', 'relax', 'malin', 'lâche'].includes(n)) natureMod = 1.1;
                if (['solo', 'doux', 'pressé', 'bizarre'].includes(n)) natureMod = 0.9;
            }
            if (statName === 'spa') {
                if (['modeste', 'doux', 'discret', 'foufou'].includes(n)) natureMod = 1.1;
                if (['rigide', 'malin', 'prudent', 'jovial'].includes(n)) natureMod = 0.9;
            }
            if (statName === 'spd') {
                if (['calme', 'gentil', 'malpoli', 'prudent'].includes(n)) natureMod = 1.1;
                if (['mauvais', 'lâche', 'naïf', 'foufou'].includes(n)) natureMod = 0.9;
            }
            if (statName === 'spe') {
                if (['timide', 'pressé', 'jovial', 'naïf'].includes(n)) natureMod = 1.1;
                if (['brave', 'relax', 'discret', 'malpoli'].includes(n)) natureMod = 0.9;
            }
        }

        if (statName === 'hp') {
            return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
        } else {
            let stat = Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMod);
            
            if (applyModifiers && pokemon.heldItem) {
                const item = pokemon.heldItem;
                if (statName === 'atk' && (item === 'choice-band' || item === 'muscle-band')) stat = Math.floor(stat * (item === 'choice-band' ? 1.5 : 1.1));
                if (statName === 'spa' && (item === 'choice-specs' || item === 'wise-glasses')) stat = Math.floor(stat * (item === 'choice-specs' ? 1.5 : 1.1));
                if (statName === 'spe' && item === 'choice-scarf') stat = Math.floor(stat * 1.5);
                if (statName === 'spd' && item === 'assault-vest') stat = Math.floor(stat * 1.5);
                if ((statName === 'def' || statName === 'spd') && item === 'eviolite') stat = Math.floor(stat * 1.5);
            }
            return stat;
        }
    };

    const calculateBaseline = (base, statName) => {
        const iv = 31;
        const ev = 0;
        const level = pokemon.level || 50;
        if (statName === 'hp') {
            return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
        } else {
            return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5));
        }
    };

    const renderStat = (label, baseValue, color, statName) => {
        const realValue = calculateStat(baseValue, statName, true);
        const baseline = calculateBaseline(baseValue, statName);
        const diff = realValue - baseline;
        
        let diffHTML = '';
        if (diff > 0) diffHTML = `<span style="color: #a7db8d; font-size: 0.9rem; margin-left: 5px;">(+${diff})</span>`;
        if (diff < 0) diffHTML = `<span style="color: #ff4c4c; font-size: 0.9rem; margin-left: 5px;">(${diff})</span>`;
        
        const percent = Math.min((baseValue / 200) * 100, 100);
        return `
            <div class="stat-row" style="align-items: center; margin-bottom: 8px; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 5px; border-radius: 8px;">
                <span class="stat-label" style="width: 70px;">${label}</span>
                <span class="stat-value" style="font-weight: bold; font-size: 1.2rem; width: 45px; text-align: right; color: #fff;">${realValue}</span>
                <span style="color: #666; font-size: 0.8rem; margin-left: 5px; width: 55px;">(Bs. ${baseValue})</span>
                ${diffHTML}
                
                <div style="display: flex; gap: 5px; margin-left: auto; align-items: center;">
                    <input type="number" class="ev-input" data-stat="${statName}" value="${pokemon.evs[statName]}" min="0" max="252" step="4" style="width: 50px; background: #222; color: white; border: 1px solid #444; border-radius: 4px; padding: 2px 4px; font-size: 0.8rem;" title="EVs (0-252)">
                    <span style="font-size: 0.7rem; color: #888;">EV</span>
                    <input type="number" class="iv-input" data-stat="${statName}" value="${pokemon.ivs[statName]}" min="0" max="31" style="width: 40px; background: #222; color: white; border: 1px solid #444; border-radius: 4px; padding: 2px 4px; font-size: 0.8rem;" title="IVs (0-31)">
                    <span style="font-size: 0.7rem; color: #888;">IV</span>
                </div>

                <div class="stat-bar-bg" style="flex: 1; min-width: 100px; margin-left: 15px; height: 12px; background: #333; border-radius: 6px; overflow: hidden;">
                    <div class="stat-bar-fill" style="width: ${percent}%; height: 100%; background-color: ${color};"></div>
                </div>
            </div>
        `;
    };

    const statsHTML = `
        <div class="stats-container" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <label style="font-size: 0.9rem; color: var(--text-muted);">Niveau :</label>
                    <input type="number" id="level-input" value="${pokemon.level || 50}" min="1" max="100" style="width: 60px; background: #222; color: white; border: 1px solid #444; border-radius: 4px; padding: 5px; font-size: 1rem;">
                </div>
                <div style="font-size: 0.8rem; color: #888;">Stats réelles</div>
            </div>
            ${renderStat('PV', pokemon.baseHp, '#FF5959', 'hp')}
            ${renderStat('Attaque', pokemon.baseAttack, '#F5AC78', 'atk')}
            ${renderStat('Défense', pokemon.baseDefense, '#FAE078', 'def')}
            ${renderStat('Att. Spé', pokemon.baseAttackSpe, '#9DB7F5', 'spa')}
            ${renderStat('Déf. Spé', pokemon.baseDefenseSpe, '#A7DB8D', 'spd')}
            ${renderStat('Vitesse', pokemon.baseSpeed, '#FA92B2', 'spe')}
        </div>
    `;
    
    const getAbilityName = (a) => (window.abilitiesData && window.abilitiesData[a]) ? window.abilitiesData[a] : a;
    const abilitiesHTML = pokemon.abilities.map(a => `<span class="ability-badge">${getAbilityName(a)}</span>`).join('');

    const weaknesses = calculateWeaknesses(pokemon.types);
    const weak4x = [], weak2x = [], resist05x = [], resist025x = [], immune0x = [];
    
    for (const [type, mult] of Object.entries(weaknesses)) {
        if (mult === 4) weak4x.push(type);
        if (mult === 2) weak2x.push(type);
        if (mult === 0.5) resist05x.push(type);
        if (mult === 0.25) resist025x.push(type);
        if (mult === 0) immune0x.push(type);
    }
    
    const renderTypeBadge = (t) => `<span style="background-color: var(--type-${t}); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; margin: 2px; color: white; display: inline-flex; align-items: center; gap: 4px;"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/small/${TYPE_IDS[t]}.png" style="width: 12px; height: 12px;">${getTypeName(t)}</span>`;
    
    const weaknessesHTML = `
        <div class="weakness-section">
            ${weak4x.length > 0 ? `<p><strong>Très faible (x4) :</strong> ${weak4x.map(renderTypeBadge).join('')}</p>` : ''}
            ${weak2x.length > 0 ? `<p><strong>Faible (x2) :</strong> ${weak2x.map(renderTypeBadge).join('')}</p>` : ''}
            ${resist05x.length > 0 ? `<p><strong>Résiste (x0.5) :</strong> ${resist05x.map(renderTypeBadge).join('')}</p>` : ''}
            ${resist025x.length > 0 ? `<p><strong>Résiste (x0.25) :</strong> ${resist025x.map(renderTypeBadge).join('')}</p>` : ''}
            ${immune0x.length > 0 ? `<p><strong>Immunisé (x0) :</strong> ${immune0x.map(renderTypeBadge).join('')}</p>` : ''}
            ${weak4x.length===0 && weak2x.length===0 && resist05x.length===0 && resist025x.length===0 && immune0x.length===0 ? '<p>Aucune faiblesse/résistance particulière.</p>' : ''}
        </div>
    `;

    const offense = calculateOffensiveCoverage(pokemon.types);
    const offenseHTML = `
        <div class="weakness-section" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #444;">
            <p style="margin-bottom: 5px;"><strong>Si attaque du même type (STAB) :</strong></p>
            ${offense.superEffective.length > 0 ? `<p><strong>Fort contre (x2) :</strong> ${offense.superEffective.map(renderTypeBadge).join('')}</p>` : ''}
            ${offense.notVeryEffective.length > 0 ? `<p><strong>Faible contre (x0.5) :</strong> ${offense.notVeryEffective.map(renderTypeBadge).join('')}</p>` : ''}
            ${offense.noEffect.length > 0 ? `<p><strong>Sans effet (x0) :</strong> ${offense.noEffect.map(renderTypeBadge).join('')}</p>` : ''}
        </div>
    `;

    let activeMovesHTML = '';
    
    if (!pokemon.activeMoves) pokemon.activeMoves = [];
    
    for (let i = 0; i < 4; i++) {
        const moveName = pokemon.activeMoves[i];
        if (moveName) {
            
            const moveInfo = window.movesData && window.movesData[moveName] ? window.movesData[moveName] : { fr: moveName, type: 'normal' };
            activeMovesHTML += `
                <div class="move-slot filled-move" data-move-index="${i}" style="border: 2px solid var(--type-${moveInfo.type}); border-radius: 8px; padding: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #222;">
                    <div>
                        <span style="font-weight: bold; font-size: 1.1rem; text-transform: capitalize;">${moveInfo.fr}</span>
                        <div style="margin-top: 5px;">
                            ${renderTypeBadge(moveInfo.type)}
                            ${moveInfo.category ? `<span style="font-size: 0.8rem; color: #aaa; margin-left: 5px;">${moveInfo.category === 'physical' ? '⚔️ Physique' : moveInfo.category === 'special' ? '🔮 Spécial' : '🛡️ Statut'}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align: right; color: #ccc; font-size: 0.9rem;">
                        ${moveInfo.power ? `<div style="font-weight: bold; color: white;">Puis: ${moveInfo.power}</div>` : '<div style="color: #666;">Puis: -</div>'}
                        ${moveInfo.accuracy ? `<div>Préc: ${moveInfo.accuracy}%</div>` : '<div>Préc: -</div>'}
                        ${moveInfo.pp ? `<div style="color: #a7db8d;">PP: ${moveInfo.pp}</div>` : ''}
                    </div>
                </div>
            `;
        } else {
            
            activeMovesHTML += `
                <div class="move-slot empty-move" data-move-index="${i}" style="border: 2px dashed #555; border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; color: #888; transition: background 0.2s;">
                    + Ajouter une capacité
                </div>
            `;
        }
    }

    return `
        <article class="wiki-card" style="font-size: 1.1rem;">
            <div class="wiki-header" style="position: relative;">
                <img src="${pokemon.sprites}" alt="${pokemon.name}" class="wiki-sprite">
                <div class="wiki-title-area">
                    <h2 style="font-size: 2.2rem;">${pokemon.name_fr ? pokemon.name_fr + ' <small style="font-size:1.2rem;">(' + pokemon.name + ')</small>' : pokemon.name}</h2>
                    <div class="types-container">
                        ${typesHTML}
                    </div>
                </div>
                <div id="evolution-container" style="position: absolute; right: 0; top: 0; display: flex; gap: 10px; align-items: center; background: #222; padding: 10px; border-radius: 10px; border: 1px solid #444;">
                    <span style="color: #888; font-size: 0.9rem;">Évolutions...</span>
                </div>
            </div>
            
            <div class="wiki-grid">
                <div class="wiki-section">
                    <h3 style="font-size: 1.4rem;">Statistiques de base</h3>
                    ${statsHTML}

                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #444;">
                        <h4 style="margin-bottom: 10px; color: var(--type-water);">⚙️ Configuration Stratégique</h4>
                        
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.9rem; color: var(--text-muted); width: 60px;">Objet :</label>
                                <div id="held-item-slot" style="flex: 1; padding: 8px 12px; background: #222; color: white; border: 1px solid #444; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                                    ${pokemon.heldItem ? `<strong style="text-transform: capitalize;">${(window.itemsData && window.itemsData[pokemon.heldItem]) ? window.itemsData[pokemon.heldItem] : pokemon.heldItem}</strong><span style="font-size: 0.8rem; color: #ff4c4c;">(Changer)</span>` : `<span style="color: #888;">+ Aucun objet tenu</span>`}
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.9rem; color: var(--text-muted); width: 60px;">Nature :</label>
                                <select class="nature-select" style="flex: 1; padding: 5px; background: #222; color: white; border: 1px solid #444; border-radius: 4px;">
                                    <option value="jovial">Jovial (+Vit, -AttSpé)</option>
                                    <option value="rigide">Rigide (+Att, -AttSpé)</option>
                                    <option value="timide">Timide (+Vit, -Att)</option>
                                    <option value="modeste">Modeste (+AttSpé, -Att)</option>
                                    <option value="prudent">Prudent (+DéfSpé, -AttSpé)</option>
                                    <option value="malin">Malin (+Déf, -AttSpé)</option>
                                    <option value="calme">Calme (+DéfSpé, -Att)</option>
                                    <option value="assuré">Assuré (+Déf, -Att)</option>
                                </select>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; text-align: center;">
                            <div>
                                <div>EVs</div>
                                <button style="background: #333; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 3px;">Répartir</button>
                            </div>
                            <div>
                                <div>IVs</div>
                                <button style="background: #333; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 3px;">31 partout</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="wiki-section">
                    <h3 style="font-size: 1.4rem;">Détails & Efficacité</h3>
                    <p style="font-size: 1.1rem;"><strong>Poids :</strong> ${pokemon.weight / 10} kg</p>
                    <div style="margin-top: 15px; font-size: 1.1rem;">
                        <strong>Talents :</strong><br>
                        <div class="badge-container" style="margin-top: 8px;">
                            ${abilitiesHTML}
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; font-size: 1.1rem;">
                        <strong>Efficacité (Défense) :</strong><br>
                        ${weaknessesHTML}
                    </div>
                    
                    ${offenseHTML}
                </div>
            </div>
            
            <div class="wiki-section" style="margin-top: 20px;">
                <h3 style="font-size: 1.4rem; margin-bottom: 15px;">Capacités (Moveset)</h3>
                <div class="moves-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    ${activeMovesHTML}
                </div>
            </div>
        </article>
    `;
}