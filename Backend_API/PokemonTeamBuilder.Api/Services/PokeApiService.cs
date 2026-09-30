using System.Linq; 
using System.Linq;
using System.Net.Http.Json;
using PokemonTeamBuilder.Api.Models;

namespace PokemonTeamBuilder.Api.Services
{
    public class PokemonApiService
    {
        
        private readonly HttpClient _httpClient;

        public PokemonApiService(HttpClient httpClient)
        {
            _httpClient = httpClient; 
        }

        public async Task<Pokemon?> GetPokemonAsync(string idOrName)
        {
            string url = $"https://pokeapi.co/api/v2/pokemon/{idOrName.ToLower()}/";

            try
            {
                var apiData = await _httpClient.GetFromJsonAsync<PokeApiPokemonDto>(url);
                if (apiData == null) return null;

                Pokemon myPokemon = new Pokemon
                {
                    Id = apiData.Id,
                    Name = apiData.Name,
                    Weight = apiData.Weight,
                    
                    Sprites = apiData.Sprites?.Other?.OfficialArtwork?.FrontDefault ?? apiData.Sprites?.FrontDefault,

                    Types = apiData.Types.Select(t => t.Type?.Name ?? "").ToList(),
                    Abilities = apiData.Abilities.Select(a => a.Ability?.Name ?? "").ToList(),
                    Moves = apiData.Moves.Select(m => m.Move?.Name ?? "").ToList(),

                    BaseHp = apiData.Stats.FirstOrDefault(s => s.Stat?.Name == "hp")?.BaseStat ?? 0,
                    BaseAttack = apiData.Stats.FirstOrDefault(s => s.Stat?.Name == "attack")?.BaseStat ?? 0,
                    BaseDefense = apiData.Stats.FirstOrDefault(s => s.Stat?.Name == "defense")?.BaseStat ?? 0,
                    BaseAttackSpe = apiData.Stats.FirstOrDefault(s => s.Stat?.Name == "special-attack")?.BaseStat ?? 0,
                    BaseDefenseSpe = apiData.Stats.FirstOrDefault(s => s.Stat?.Name == "special-defense")?.BaseStat ?? 0,
                    BaseSpeed = apiData.Stats.FirstOrDefault(s => s.Stat?.Name == "speed")?.BaseStat ?? 0
                };

                return myPokemon;
            }
            catch
            {
                return null;
            }
        }
    }
}