using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace PokemonTeamBuilder.Api.Models
{
    public class PokeApiPokemonDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Weight { get; set; }

        public PokeApiSprites? Sprites { get; set; }
        public List<PokeApiTypeSlot> Types { get; set; } = new();
        public List<PokeApiAbilitySlot> Abilities { get; set; } = new();
        public List<PokeApiMoveSlot> Moves { get; set; } = new();
        public List<PokeApiStatSlot> Stats { get; set; } = new();
    }

    public class PokeApiSprites
    {
        [JsonPropertyName("front_default")]
        public string? FrontDefault { get; set; }
        
        [JsonPropertyName("other")]
        public PokeApiOtherSprites? Other { get; set; }
    }

    public class PokeApiOtherSprites
    {
        [JsonPropertyName("official-artwork")]
        public PokeApiOfficialArtwork? OfficialArtwork { get; set; }
    }

    public class PokeApiOfficialArtwork
    {
        [JsonPropertyName("front_default")]
        public string? FrontDefault { get; set; }
    }

    public class PokeApiStatSlot
    {
        [JsonPropertyName("base_stat")]
        public int BaseStat { get; set; }
        
        public PokeApiNamedResource? Stat { get; set; }
    }

    public class PokeApiTypeSlot
    {
        public PokeApiNamedResource? Type { get; set; }
    }

    public class PokeApiAbilitySlot
    {
        public PokeApiNamedResource? Ability { get; set; }
    }

    public class PokeApiMoveSlot
    {
        public PokeApiNamedResource? Move { get; set; }
    }

    public class PokeApiNamedResource
    {
        public string Name { get; set; } = string.Empty;
    }
}