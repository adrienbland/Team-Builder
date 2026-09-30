import { state } from '../state.js?v=3';

export function openItemSelectionView(pokemon) {
    const container = document.getElementById('active-pokemon-details');
    if (!container) return;

    const allItems = Object.keys(window.itemsData || {}).map(key => {
        return { id: key, fr: window.itemsData[key] };
    });

    allItems.sort((a, b) => a.fr.localeCompare(b.fr));
    
    let html = `
        <div class="wiki-card">
            <h2 style="margin-bottom: 25px; color: var(--type-water); font-size: 2rem;">🎒 Choisir un Objet pour ${pokemon.name_fr || pokemon.name}</h2>
            <button id="cancel-item-btn" style="margin-bottom: 20px; padding: 10px 20px; background: #444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem;">⬅️ Retour au Pokémon</button>
            <input type="text" id="item-search-input" placeholder="Rechercher un objet (ex: Orbe Vie, Mouchoir Choix)..." style="width: 100%; padding: 15px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #555; background: #222; color: white; outline: none; font-size: 1.2rem;">
            
            <div id="items-list-container" style="display: grid; grid-template-columns: 1fr; gap: 10px; max-height: 50vh; overflow-y: auto; padding-right: 15px;">
            </div>
            
            <button id="remove-item-btn" style="margin-top: 30px; padding: 15px; width: 100%; background: #ff4c4c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.2rem; font-weight: bold;">🗑️ Retirer l'objet</button>
        </div>
    `;
    
    container.innerHTML = html;

    const itemSearchInput = document.getElementById('item-search-input');
    const itemsListContainer = document.getElementById('items-list-container');

    const createItemHTML = (item) => `
        <div class="item-option" data-item-id="${item.id}" style="border: 1px solid #444; border-radius: 8px; padding: 15px; cursor: pointer; background: #222; transition: background 0.2s, transform 0.1s;">
            <strong style="font-size: 1.2rem; text-transform: capitalize;">${item.fr}</strong>
        </div>
    `;

    itemsListContainer.innerHTML = allItems.slice(0, 100).map(createItemHTML).join('');

    const attachItemClickEvents = () => {
        const options = itemsListContainer.querySelectorAll('.item-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedItemId = opt.getAttribute('data-item-id');
                pokemon.heldItem = selectedItemId;
                document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
            });
        });
    };
    
    attachItemClickEvents();

    itemSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredItems = allItems.filter(m => m.fr.toLowerCase().includes(query) || m.id.toLowerCase().includes(query));
        itemsListContainer.innerHTML = filteredItems.slice(0, 100).map(createItemHTML).join('');
        attachItemClickEvents();
    });

    document.getElementById('remove-item-btn').addEventListener('click', () => {
        pokemon.heldItem = null;
        document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
    });
    
    document.getElementById('cancel-item-btn').addEventListener('click', () => {
        if (typeof window.afficherDetails === 'function') {
            window.afficherDetails(pokemon);
        } else {
            document.dispatchEvent(new CustomEvent('pokemonUpdated', { detail: pokemon }));
        }
    });
}
