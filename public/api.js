const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=';
const MAX_POKEMON_GENERATION_ONE = 151;
const TOTAL_CHOICES = 4;

window.getPokeData = async function() {
  try {
    const allPokemon = await fetchAllPokemon();
    const shuffledPokemon = shuffleArray(allPokemon);
    const pokemonChoices = getSpecificAmountOfPokemon(shuffledPokemon, TOTAL_CHOICES);
    
    const firstPokemon = pokemonChoices[0];
    const pokemonImage = getPokemonImageUrl(firstPokemon);

    return { 
      pokemonChoices: shuffleArray(pokemonChoices),
      correct: {
        image: pokemonImage,
        name: firstPokemon.name,
      }
    };
  } catch (error) {
    console.error("Error fetching Pokemon data: ", error);
    // You could also trigger a visual error state in the HTML here
  }
};

async function fetchAllPokemon() {
  const response = await fetch(`${POKEMON_API_URL}${MAX_POKEMON_GENERATION_ONE}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const pokemonData = await response.json();
  
  return pokemonData.results;
}

function shuffleArray(unshuffledArray) {
  const shuffledArray = unshuffledArray
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
  
  return shuffledArray;
}

function getSpecificAmountOfPokemon(randomPokemonList, amount) {
  return randomPokemonList.splice(0, amount);
}

function getPokemonImageUrl({ url }) {
  const pokemonNumber = extractPokemonNumberFromUrl(url);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
}

function extractPokemonNumberFromUrl(url) {
  const numberRegex = /(\d+)\/$/;
  return (url.match(numberRegex) || [])[1];
}