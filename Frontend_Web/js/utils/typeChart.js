

const TYPE_CHART = {
    normal: { ghost: 0, fighting: 2 },
    fire: { bug: 0.5, fairy: 0.5, fire: 0.5, grass: 0.5, ice: 0.5, steel: 0.5, ground: 2, rock: 2, water: 2 },
    water: { fire: 0.5, ice: 0.5, steel: 0.5, water: 0.5, electric: 2, grass: 2 },
    electric: { electric: 0.5, flying: 0.5, steel: 0.5, ground: 2 },
    grass: { electric: 0.5, grass: 0.5, ground: 0.5, water: 0.5, bug: 2, fire: 2, flying: 2, ice: 2, poison: 2 },
    ice: { ice: 0.5, fire: 2, fighting: 2, rock: 2, steel: 2 },
    fighting: { bug: 0.5, dark: 0.5, rock: 0.5, fairy: 2, flying: 2, psychic: 2 },
    poison: { bug: 0.5, fairy: 0.5, fighting: 0.5, grass: 0.5, poison: 0.5, ground: 2, psychic: 2 },
    ground: { electric: 0, poison: 0.5, rock: 0.5, grass: 2, ice: 2, water: 2 },
    flying: { ground: 0, bug: 0.5, fighting: 0.5, grass: 0.5, electric: 2, ice: 2, rock: 2 },
    psychic: { fighting: 0.5, psychic: 0.5, bug: 2, dark: 2, ghost: 2 },
    bug: { fighting: 0.5, grass: 0.5, ground: 0.5, fire: 2, flying: 2, rock: 2 },
    rock: { fire: 0.5, flying: 0.5, normal: 0.5, poison: 0.5, fighting: 2, grass: 2, ground: 2, steel: 2, water: 2 },
    ghost: { normal: 0, fighting: 0, bug: 0.5, poison: 0.5, dark: 2, ghost: 2 },
    dragon: { electric: 0.5, fire: 0.5, grass: 0.5, water: 0.5, dragon: 2, fairy: 2, ice: 2 },
    dark: { psychic: 0, dark: 0.5, ghost: 0.5, bug: 2, fairy: 2, fighting: 2 },
    steel: { poison: 0, bug: 0.5, dragon: 0.5, fairy: 0.5, flying: 0.5, grass: 0.5, ice: 0.5, normal: 0.5, psychic: 0.5, rock: 0.5, steel: 0.5, fighting: 2, fire: 2, ground: 2 },
    fairy: { dragon: 0, bug: 0.5, dark: 0.5, fighting: 0.5, poison: 2, steel: 2 }
};

export const ALL_TYPES = Object.keys(TYPE_CHART);

export const TYPE_TRANSLATIONS = {
    normal: 'Normal',
    fire: 'Feu',
    water: 'Eau',
    electric: 'Électrik',
    grass: 'Plante',
    ice: 'Glace',
    fighting: 'Combat',
    poison: 'Poison',
    ground: 'Sol',
    flying: 'Vol',
    psychic: 'Psy',
    bug: 'Insecte',
    rock: 'Roche',
    ghost: 'Spectre',
    dragon: 'Dragon',
    dark: 'Ténèbres',
    steel: 'Acier',
    fairy: 'Fée'
};

export const TYPE_IDS = {
    normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6,
    bug: 7, ghost: 8, steel: 9, fire: 10, water: 11, grass: 12,
    electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
};

export function calculateWeaknesses(types) {
    const multipliers = {};
    ALL_TYPES.forEach(t => multipliers[t] = 1);
    
    types.forEach(defendingType => {
        const typeDefenses = TYPE_CHART[defendingType];
        if (!typeDefenses) return;
        
        ALL_TYPES.forEach(attackingType => {
            if (typeDefenses[attackingType] !== undefined) {
                multipliers[attackingType] *= typeDefenses[attackingType];
            }
        });
    });
    
    return multipliers;
}

export function calculateOffensiveCoverage(types) {
    const coverage = { superEffective: new Set(), notVeryEffective: new Set(), noEffect: new Set() };
    
    types.forEach(attackingType => {
        ALL_TYPES.forEach(defendingType => {
            const defData = TYPE_CHART[defendingType];
            if (!defData) return;
            
            const mult = defData[attackingType];
            if (mult === 2) coverage.superEffective.add(defendingType);
            else if (mult === 0.5) coverage.notVeryEffective.add(defendingType);
            else if (mult === 0) coverage.noEffect.add(defendingType);
        });
    });

    coverage.superEffective.forEach(t => {
        coverage.notVeryEffective.delete(t);
        coverage.noEffect.delete(t);
    });
    
    return {
        superEffective: Array.from(coverage.superEffective),
        notVeryEffective: Array.from(coverage.notVeryEffective),
        noEffect: Array.from(coverage.noEffect)
    };
}
