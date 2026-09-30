const LOCAL_STORAGE_KEY = 'pokemon_team_builder_state';

const savedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

export const state = savedState || {
    team: [null, null, null, null, null, null],
    activeSlot: 0
};

export function saveState() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function setPokemonInSlot(pokemon, index) {
    state.team[index] = pokemon;
    saveState();
}

export function removePokemonFromSlot(index) {
    state.team[index] = null;
    saveState();
}

export function swapSlots(indexA, indexB) {
    const temp = state.team[indexA];
    state.team[indexA] = state.team[indexB];
    state.team[indexB] = temp;
    saveState();
}

export function setActiveSlot(index) {
    state.activeSlot = index;
    saveState();
}