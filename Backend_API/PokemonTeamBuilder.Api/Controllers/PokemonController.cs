using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using PokemonTeamBuilder.Api.Models;
using PokemonTeamBuilder.Api.Services;

namespace PokemonTeamBuilder.Api.Controllers
{
    [ApiController] 
    [Route("api/[controller]")]
    public class PokemonController : ControllerBase
    {
        private readonly PokemonApiService _pokemonService;
        public PokemonController(PokemonApiService pokemonApiService)
        {
            _pokemonService = pokemonApiService;
        }

        [HttpGet("{nameOrId}")]
        public async Task<IActionResult> GetPokemon(string nameOrId)
        {
            try
            {
               var pokemon = await _pokemonService.GetPokemonAsync(nameOrId);
               if (pokemon == null) return NotFound();
               return Ok(pokemon);
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}