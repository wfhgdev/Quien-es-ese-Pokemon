// ======================================================
// api.js — "El mensajero"
// Este archivo NO toca el HTML directamente.
// Su único trabajo es: ir a internet, traer datos de Pokémon,
// prepararlos, y devolverlos listos para que index.js los use.
// ======================================================

// URL base de la PokéAPI. Le falta el número de Pokémon que queremos,
// por eso termina en "limit=" (se lo pegamos después)
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=';

// Solo existen 151 Pokémon en la "primera generación" (Kanto).
// Usamos esta constante para no "hardcodear" el número 151 varias veces
const MAX_POKEMON_GENERATION_ONE = 151;

// Cuántas opciones de respuesta le vamos a mostrar al usuario (4 botones)
const TOTAL_CHOICES = 4;

// window.getPokeData = ... : guardamos la función dentro de "window"
// para que esté disponible globalmente y pueda ser usada desde index.js
// (recordemos que index.js se carga DESPUÉS de este archivo)
window.getPokeData = async function() {
  // "async" significa que esta función puede usar "await" adentro,
  // es decir, puede "esperar" a que terminen operaciones que toman tiempo
  // (como pedirle datos a internet) sin bloquear el resto del programa

  // MEJORA: antes este bloque tenía su propio try/catch y "tragaba" el error
  // con un console.error, así que si fallaba el fetch, el usuario se quedaba
  // viendo la Pokéball girando para siempre sin ninguna explicación.
  // Ahora NO atrapamos el error aquí: lo dejamos "subir" (propagarse) para que
  // sea index.js quien decida cómo mostrárselo al usuario (por ejemplo, un
  // mensaje visual). Así cada archivo cumple un solo rol:
  // api.js trae los datos, index.js decide qué hacer con el resultado (o el error)

  const allPokemon = await fetchAllPokemon();
  // Esperamos (await) a que fetchAllPokemon() termine de traer los 151 Pokémon.
  // Si fetchAllPokemon() lanza un error (throw), la ejecución de esta función
  // se detiene aquí mismo y el error viaja hacia quien llamó a getPokeData()

  const shuffledPokemon = shuffleArray(allPokemon);
  // Mezclamos la lista al azar, como barajar un mazo de cartas

  const pokemonChoices = getSpecificAmountOfPokemon(shuffledPokemon, TOTAL_CHOICES);
  // De esa lista ya mezclada, tomamos solo 4: serán nuestras opciones de respuesta

  const firstPokemon = pokemonChoices[0];
  // Como la lista ya está mezclada al azar, el primer elemento
  // lo usamos como "el Pokémon correcto" de esta ronda

  const pokemonImage = getPokemonImageUrl(firstPokemon);
  // Construimos la URL de la imagen (el sprite) de ese Pokémon correcto

  return {
    // Esta función devuelve un objeto con toda la información que index.js necesita:

    pokemonChoices: shuffleArray(pokemonChoices),
    // Volvemos a mezclar las 4 opciones, para que el Pokémon correcto
    // no siempre aparezca en el mismo botón (si no, siempre sería el primero)

    correct: {
      image: pokemonImage,   // la imagen que se muestra como silueta
      name: firstPokemon.name, // el nombre correcto, para comparar con lo que el usuario elige
    }
  };
};

// Función que realmente hace la petición (fetch) a la PokéAPI
async function fetchAllPokemon() {
  const response = await fetch(`${POKEMON_API_URL}${MAX_POKEMON_GENERATION_ONE}`);
  // fetch() hace la petición HTTP a la URL final, algo como:
  // https://pokeapi.co/api/v2/pokemon?limit=151
  // await espera a que el servidor responda

  if (!response.ok) {
    // response.ok es true si el status HTTP es 200-299 (todo bien)
    // Si NO está ok (por ejemplo error 404 o 500), lanzamos un error manualmente.
    // Este error (o cualquier error de red, como no tener internet) va a "viajar"
    // hacia arriba hasta llegar al try/catch que ahora vive en index.js
    throw new Error("Network response was not ok");
  }

  const pokemonData = await response.json();
  // Convertimos la respuesta (que llega en formato texto) a un objeto JavaScript

  return pokemonData.results;
  // La PokéAPI devuelve varios campos, pero solo nos interesa "results",
  // que es el array con los 151 Pokémon (cada uno con nombre y url)
}

// Función que mezcla (baraja) un array al azar
function shuffleArray(unshuffledArray) {
  const shuffledArray = unshuffledArray
    .map((item) => ({ item, sort: Math.random() }))
    // Paso 1: por cada elemento, creamos un objeto temporal que guarda
    // el elemento original junto a un número aleatorio ("sort")

    .sort((a, b) => a.sort - b.sort)
    // Paso 2: ordenamos esos objetos según ese número aleatorio.
    // Como el número es random, el orden final también es random

    .map(({ item }) => item);
    // Paso 3: "desempacamos" y nos quedamos solo con el elemento original,
    // ya sin el número aleatorio que usamos para ordenar
    // (esta técnica se llama "Schwartzian transform")

  return shuffledArray;
}

// Devuelve solo una cantidad específica de elementos de la lista
function getSpecificAmountOfPokemon(randomPokemonList, amount) {
  return randomPokemonList.slice(0, amount);
  // MEJORA: antes usábamos splice(0, amount), que además de devolver los
  // elementos, MODIFICA (muta) el array original sobre el que se llama.
  // Aquí no nos generaba un bug visible porque "shuffledPokemon" no se
  // reutilizaba después, pero mutar arrays que recibimos como parámetro
  // es una fuente común de bugs difíciles de rastrear en apps más grandes.
  // slice(0, amount) hace lo mismo (tomar los primeros "amount" elementos)
  // pero devuelve un array NUEVO y deja el original intacto
}

// Construye la URL de la imagen (sprite) de un Pokémon a partir de su url de datos
function getPokemonImageUrl({ url }) {
  // Aquí usamos "destructuring": en vez de recibir el objeto completo del Pokémon
  // y luego escribir pokemon.url, directamente extraemos la propiedad "url"

  const pokemonNumber = extractPokemonNumberFromUrl(url);
  // Sacamos el número de identificación del Pokémon (ej: 25 para Pikachu)

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
  // Las imágenes de los Pokémon están guardadas en GitHub, organizadas por número.
  // Armamos la URL final insertando el número dentro del string
}

// Extrae el número del Pokémon desde su URL de datos
// Ejemplo de url: "https://pokeapi.co/api/v2/pokemon/25/"  -> nos interesa el "25"
function extractPokemonNumberFromUrl(url) {
  const numberRegex = /(\d+)\/$/;
  // Expresión regular: busca uno o más dígitos (\d+) justo antes de una "/" al final ($)

  return (url.match(numberRegex) || [])[1];
  // url.match() devuelve un array con las coincidencias, o "null" si no encuentra nada.
  // Usamos "|| []" para evitar un error si no hay coincidencia (null no tiene índice [1])
  // El índice [1] corresponde al primer "grupo capturado" entre paréntesis en el regex,
  // es decir, el número mismo (sin la barra "/")
}