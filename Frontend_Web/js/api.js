const API_BASE_URL = '/api/pokemon';

export async function fetchPokemon(nameOrId) {
    try {
        const query = String(nameOrId).toLowerCase();
        const response = await fetch(`${API_BASE_URL}/${query}`);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error("Pokémon introuvable");
            throw new Error("Erreur de connexion au serveur");
        }
        
        return await response.json();
    } catch (error) {
        console.error("Erreur API:", error);
        return null;
    }
}

export async function fetchEvolutions(pokemonId) {
    try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        if (!speciesRes.ok) return [];
        const speciesData = await speciesRes.json();
        
        const chainRes = await fetch(speciesData.evolution_chain.url);
        if (!chainRes.ok) return [];
        const chainData = await chainRes.json();
        
        const evolutions = [];
        
        function parseChain(node) {
            evolutions.push(node.species.name);
            node.evolves_to.forEach(child => parseChain(child));
        }
        
        parseChain(chainData.chain);
        return evolutions;
    } catch (error) {
        console.error("Erreur lors de la récupération des évolutions :", error);
        return [];
    }
}
