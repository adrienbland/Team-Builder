using System.Collections.Generic;

namespace PokemonTeamBuilder.Api.Models
{
    public class Pokemon
    {
        public int Id { get; set; } 
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? SpriteUrl { get; set; } 
        
        public List<string> Types { get; set; } = new List<string>();

        public List<string> Abilities { get; set; } = new List<string>();
        public List<string> Movepool { get; set; } = new List<string>();
        public int Weight { get; set; }
        
        public int BaseHp { get; set; }
        public int BaseAttack { get; set; }
        public int BaseAttackSpe {get; set;}
        public int BaseDefenseSpe {get; set;}
        public int BaseDefense { get; set; }
        public int BaseSpeed {get; set;}
        

        public int Level { get; set; } = 50;
        public List<string> ActiveMoves { get; set; } = new List<string>();
        
        public int RealHp { get; set; }
        public int RealAttack { get; set; }
        public int RealDefense { get; set; }
        public int RealAttackSpe {get; set;}
        public int RealDefenseSpe {get; set;}
        public int RealSpeed {get; set;}

    }
}