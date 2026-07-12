// ======================================================
// index.js — "El cerebro"
// Este archivo conecta todo: escucha los clics del usuario,
// le pide los datos al "mensajero" (api.js), actualiza el HTML,
// y hace que el navegador diga el nombre del Pokémon en voz alta.
// ======================================================

// Variable donde vamos a guardar los datos de la ronda actual
// (el Pokémon correcto y las 4 opciones). Empieza "vacía" (undefined)
let gameData;

// Contadores del marcador. Se declaran fuera de cualquier función para que
// mantengan su valor durante toda la sesión (no se reinician al presionar Play,
// solo si se recarga la página, ya que en ese caso todo el script se vuelve a ejecutar)
let correctCount = 0;
let incorrectCount = 0;

// ---- Referencias a elementos del HTML ----
// document.querySelector busca UN elemento en el HTML que coincida
// con el selector CSS que le pasamos, y nos da acceso a él desde JS

const main = document.querySelector('main');
// El contenedor principal del juego (le agregamos/quitamos clases como "fetching" o "revealed")

const pokemonImage = document.querySelector('#pokemon-image');
// La etiqueta <img> donde se muestra la silueta / imagen del Pokémon

const textOverlay = document.querySelector('#text-overlay');
// El recuadro amarillo donde escribimos el nombre del Pokémon al revelarlo

const choices = document.querySelector('#choices');
// El <div> vacío donde vamos a insertar los 4 botones de opciones

const playBtn = document.querySelector('#play');
// El botón "Play"

const generationSelect = document.querySelector('#generation');
// El <select> donde el usuario elige qué generación de Pokémon jugar

const correctCountEl = document.querySelector('#correct-count');
// El <span> donde se muestra el número de respuestas correctas

const incorrectCountEl = document.querySelector('#incorrect-count');
// El <span> donde se muestra el número de respuestas incorrectas

const errorMessage = document.querySelector('#error-message');
// El párrafo donde mostramos un mensaje si falla la petición a la PokéAPI

// ---- Configuración inicial (se ejecuta una sola vez, al cargar la página) ----

playBtn.addEventListener('click', fetchData);
// Le decimos al botón "Play": "cuando te hagan clic, ejecuta la función fetchData"

loadVoice();
// Prepara la voz que usaremos más adelante para hablar (ver función abajo)

addAnswerHandler();
// Activa el "escuchador" de clics en las opciones de respuesta


// ======================================================
// FUNCIONES
// ======================================================

// Se ejecuta cuando el usuario hace clic en "Play"
async function fetchData() {
  playBtn.disabled = true;
  generationSelect.disabled = true;
  // MEJORA: deshabilitamos el botón Y el selector de generación mientras
  // se está cargando, para que el usuario no pueda hacer clic varias veces
  // ni cambiar de generación a mitad de una petición (lo que podría dejar
  // el juego en un estado raro, mezclando datos de dos generaciones distintas)

  hideError();
  // MEJORA: por si quedó un mensaje de error visible de un intento anterior,
  // lo ocultamos antes de intentar cargar de nuevo

  resetImage();
  // Dejamos la imagen en blanco y mostramos la Pokéball girando

  try {
    // MEJORA: antes no había ningún try/catch en index.js, así que si
    // window.getPokeData() fallaba, el usuario se quedaba viendo la
    // Pokéball girar para siempre, sin explicación. Ahora sí lo manejamos aquí

    const range = getSelectedGenerationRange();
    // Leemos qué generación eligió el usuario en el <select>

    gameData = await window.getPokeData(range);
    // Le pedimos los datos al "mensajero" (api.js) y ESPERAMOS (await)
    // a que responda antes de seguir, pasándole el rango de Pokédex
    // que corresponde a la generación elegida. window.getPokeData() es
    // la función que definimos en api.js con "window.getPokeData = async function(range) {...}".
    // Si esta línea lanza un error, saltamos directo al bloque catch de abajo

    showSilhouette();
    // Una vez que ya tenemos los datos, mostramos la silueta del Pokémon (en negro)

    displayChoices();
    // Y creamos los 4 botones de opciones en pantalla

  } catch (error) {
    console.error('Error al cargar los datos del Pokémon: ', error);
    // Seguimos dejando el error en la consola, útil para nosotros como desarrolladores

    showError();
    // Y además, ahora sí le avisamos al usuario con un mensaje visible en pantalla

  } finally {
    // El bloque "finally" se ejecuta SIEMPRE, haya habido error o no.
    // Lo usamos para asegurarnos de que el botón Play y el selector vuelvan
    // a habilitarse pase lo que pase, y así el usuario siempre pueda intentar de nuevo

    playBtn.disabled = false;
    generationSelect.disabled = false;
  }
}

// Lee el <option> seleccionado en #generation y devuelve su rango como
// un objeto { start, end } de números, listo para pasarle a api.js
function getSelectedGenerationRange() {
  const [start, end] = generationSelect.value.split('-').map(Number);
  // El "value" de cada <option> en el HTML tiene el formato "inicio-fin"
  // (ej: "152-251"). .split('-') lo separa en un array de dos strings
  // (["152", "251"]), y .map(Number) convierte cada string en un número

  return { start, end };
}

// Muestra un mensaje de error visible y deja el tablero en un estado "neutro"
function showError() {
  main.classList.remove('fetching');
  // Quitamos "fetching" para que la Pokéball deje de girar
  // (ya sabemos que la petición falló, no tiene sentido seguir "cargando")

  errorMessage.textContent = 'No pudimos cargar el Pokémon. Revisa tu conexión e inténtalo de nuevo.';
  errorMessage.classList.add('visible');
  // Agregamos la clase "visible" definida en el CSS, que cambia el
  // párrafo de "display: none" a "display: block"
}

// Oculta el mensaje de error (se llama antes de cada nuevo intento)
function hideError() {
  errorMessage.classList.remove('visible');
  errorMessage.textContent = '';
}

// Deja todo listo para una nueva ronda: sin imagen y con la Pokéball girando
function resetImage() {
  pokemonImage.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D';
  // Volvemos a poner el GIF transparente (imagen "vacía") en el <img>

  main.classList.add('fetching');
  // Agregamos la clase "fetching" a <main>.
  // En el CSS, esta clase hace que se vea la Pokéball girando
  // y se oculten la imagen del Pokémon y los botones de opciones

  main.classList.remove('revealed');
  // Quitamos la clase "revealed" por si quedó de la ronda anterior
  // (esta clase es la que muestra el nombre del Pokémon)
}

// Muestra la silueta negra del Pokémon (todavía sin revelar su nombre)
function showSilhouette() {
  main.classList.remove('fetching');
  // Quitamos "fetching": esto hace que desaparezca la Pokéball
  // y aparezca la imagen del Pokémon (en negro, por el filtro CSS "brightness(0)")

  pokemonImage.src = gameData.correct.image;
  // Ponemos la URL real de la imagen del Pokémon correcto en el <img>
}

// Crea dinámicamente los 4 botones de opciones en el HTML
function displayChoices() {
  const { pokemonChoices } = gameData;
  // Destructuring: sacamos la propiedad "pokemonChoices" del objeto gameData

  const choicesHTML = pokemonChoices.map(({ name }) => {
    // Por cada Pokémon en la lista de opciones, generamos el HTML de un botón.
    // Destructuring de nuevo: de cada objeto Pokémon solo nos interesa "name"

    return `<button data-name="${name}">${name}</button>`;
    // data-name="${name}" guarda el nombre como un "atributo de datos" (data attribute).
    // Esto nos permite después leer fácilmente qué Pokémon representa cada botón
    // usando e.target.dataset.name, sin depender del texto visible del botón

  }).join('');
  // .map() nos da un array de strings (uno por botón). .join('') los une
  // todos en un solo string largo, sin ningún separador entre ellos

  choices.innerHTML = choicesHTML;
  // Insertamos ese HTML dentro del <div id="choices">, reemplazando su contenido.
  // Esto crea de verdad los 4 botones en la página
}

// Configura QUÉ pasa cuando el usuario hace clic en una opción de respuesta
function addAnswerHandler() {
  choices.addEventListener('click', e => {
    // En vez de poner un listener en cada botón individual (que ni existen
    // todavía cuando se ejecuta este código), ponemos el listener en el
    // contenedor padre #choices. Esto se llama "event delegation":
    // los clics dentro de los botones "burbujean" hasta el padre y los detectamos igual

    const { name } = e.target.dataset;
    // e.target es el elemento exacto donde se hizo clic (el botón).
    // .dataset.name lee el atributo data-name que pusimos antes

    const isCorrect = name === gameData.correct.name;
    // Guardamos el resultado en una variable booleana (true/false) para
    // no repetir la comparación más abajo al actualizar el marcador

    const resultClass = isCorrect ? 'correct' : 'incorrect';
    // Operador ternario: si acertó, usamos la clase "correct";
    // si no, usamos "incorrect". Estas clases cambian el color del botón (ver CSS)

    e.target.classList.add(resultClass);
    // Le agregamos la clase correspondiente (verde o rojo) al botón clickeado

    disableChoices();
    // MEJORA: antes, después de responder, los 4 botones seguían siendo
    // clickeables. Esto permitía que el usuario hiciera clic en otra opción
    // y "cambiara" su respuesta, o incluso sumara varios puntos en la misma
    // ronda. Ahora deshabilitamos los 4 botones apenas se responde una vez

    updateStats(isCorrect);
    // Sumamos 1 al contador correspondiente y actualizamos el marcador en pantalla

    revealPokemon();
    // Mostramos el nombre del Pokémon en el recuadro de texto

    speakAnswer();
    // Hacemos que el navegador diga el nombre en voz alta
  });
}

// Deshabilita los 4 botones de opciones para que no se pueda responder dos veces
function disableChoices() {
  const buttons = choices.querySelectorAll('button');
  // querySelectorAll (a diferencia de querySelector) devuelve TODOS los
  // elementos que coincidan con el selector, no solo el primero

  buttons.forEach(button => {
    button.disabled = true;
    // La propiedad .disabled = true es la forma "oficial" de deshabilitar
    // un <button> en HTML: además de verse distinto (ver CSS button:disabled),
    // el navegador deja de disparar el evento "click" sobre él
  });
}

// Actualiza los contadores de correctas/incorrectas y refleja el cambio en el HTML
function updateStats(isCorrect) {
  if (isCorrect) {
    correctCount++;
    // "++" es lo mismo que escribir correctCount = correctCount + 1
  } else {
    incorrectCount++;
  }

  correctCountEl.textContent = `Correctas: ${correctCount}`;
  incorrectCountEl.textContent = `Incorrectas: ${incorrectCount}`;
  // Actualizamos el texto visible de cada <span> con el número más reciente
}

// Revela el nombre del Pokémon visualmente
function revealPokemon() {
  main.classList.add('revealed');
  // Esta clase hace visible el <div id="answer"> (estaba oculto con display: none)
  // y además le quita el filtro negro a la imagen (mostrando el Pokémon a color)

  textOverlay.textContent = `${gameData.correct.name}!`;
  // Escribimos el nombre del Pokémon (con signo de exclamación) dentro del recuadro amarillo
}

// Prepara la voz que se usará para hablar
function loadVoice() {
  // MEJORA: antes usábamos siempre speechSynthesis.getVoices()[4], es decir,
  // "la voz número 4 de la lista, sea cual sea". El problema es que la
  // lista de voces disponibles depende del navegador y del sistema operativo
  // de cada usuario, así que el índice 4 podía no existir (undefined) o ser
  // una voz completamente distinta a la esperada en otra computadora.
  // Ahora, en vez de confiar en una posición fija, buscamos explícitamente
  // una voz en español, y si no encontramos ninguna, dejamos que el
  // navegador use su voz por defecto (en vez de romperse)

  const selectVoice = () => {
    const voices = speechSynthesis.getVoices();

    window.selectedVoice = voices.find(voice => voice.lang && voice.lang.startsWith('es')) || null;
    // .find() recorre el array y devuelve el PRIMER elemento que cumpla la condición
    // (una voz cuyo código de idioma "lang" empiece con "es", como "es-ES" o "es-MX").
    // Si no encuentra ninguna, .find() devuelve undefined, y con "|| null"
    // nos aseguramos de guardar null en ese caso (equivalente a "sin preferencia",
    // el navegador usará su voz por defecto)
  };

  selectVoice();
  // Algunos navegadores ya tienen la lista de voces lista de inmediato,
  // así que intentamos seleccionar la voz apenas se carga la página

  window.speechSynthesis.onvoiceschanged = selectVoice;
  // Otros navegadores cargan las voces de forma asíncrona (un poco después)
  // y avisan con este evento cuando ya están disponibles. Volvemos a
  // ejecutar la misma función por si la primera vez no había voces todavía
}

// Hace que el navegador "diga" el nombre del Pokémon en voz alta
function speakAnswer() {
  const utterance = new SpeechSynthesisUtterance(gameData.correct.name);
  // SpeechSynthesisUtterance es un objeto del navegador que representa
  // "algo que se va a decir en voz alta". Le pasamos el texto a pronunciar

  utterance.voice = window.selectedVoice;
  // Le asignamos la voz que guardamos antes en loadVoice().
  // Si es null, el navegador usa automáticamente su voz por defecto

  utterance.pitch = 0.9;
  // Tono de la voz (1 es normal, menos de 1 es un poco más grave)

  utterance.rate = 0.85;
  // Velocidad de la voz (1 es normal, menos de 1 es más lento)

  speechSynthesis.speak(utterance);
  // Finalmente, le pedimos al navegador que reproduzca el audio con esa configuración
}