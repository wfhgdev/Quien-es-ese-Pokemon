# ¿Quién es ese Pokémon? 🎮🔍

Un divertido juego web interactivo construido con **JavaScript** donde los jugadores deben adivinar qué Pokémon se esconde tras la silueta. ¡Pon a prueba tus conocimientos como entrenador Pokémon!

## GitHub Pages
* [[**Sitio Web en GitHub Pages**](https://wfhgdev.github.io/Quien-es-ese-Pokemon/)]

## 🚀 Features

* **Data Fetching:** Se conecta en tiempo real a la [PokéAPI](https://pokeapi.co/) para obtener la información y las imágenes de los primeros 151 Pokémon.
* **Dynamic Options:** Mezcla y genera cuatro opciones de respuesta completamente aleatorias en cada partida.
* **Speech Synthesis:** Utiliza la Web Speech API del navegador para pronunciar el nombre del Pokémon en voz alta una vez que el usuario adivina.
* **CSS Animations:** Incluye retroalimentación visual, revelado de la silueta mediante filtros (`brightness`) y animaciones divertidas como el movimiento de la Pokéball (`wiggle`).

## 🛠️ Lenguajes utilizados

Este proyecto es un ejercicio práctico de desarrollo Full Stack a nivel Frontend, construido con:

* **HTML5:** Estructura semántica de la aplicación.
* **CSS3:** Estilos, grid layouts, pseudo-clases y animaciones.
* **JavaScript (ES6+):** Lógica del juego, manipulación del DOM y consumo de APIs usando `async/await`.
* **REST API:** Integración con servicios externos.

## 📂 Estructura del Proyecto

El proyecto sigue una separación clara de responsabilidades (Separation of Concerns):

```text
├── public/
│   ├── api.js       # Lógica de conexión a la API y procesamiento de datos
│   ├── index.js     # Lógica principal del juego, eventos del DOM y Web Speech API
│   └── styles.css   # Reglas de estilo y animaciones
└── index.html       # Estructura principal de la interfaz
```

## 🧑‍💻 Practicas y Flujo de Trabajo

Este proyecto se ha desarrollado siguiendo estándares profesionales de la industria:

* **Clean Code:** Funciones pequeñas y con responsabilidades únicas (Single Responsibility Principle), uso de nombres descriptivos en inglés y manejo de errores mediante bloques `try/catch`.
* **Conventional Commits:** El historial de Git sigue la convención estándar (ej. `feat:`, `fix:`, `chore:`, `docs:`) para mantener una trazabilidad clara de los cambios.