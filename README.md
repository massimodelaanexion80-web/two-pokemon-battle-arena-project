# Pokémon Battle Arena ⚡

Este es mi proyecto de Pokémon Battle Arena para Web 1.

La idea del proyecto es usar PokéAPI para buscar dos Pokémon, cargar su información y después hacer que peleen entre ellos usando distintos movimientos.

El objetivo principal era practicar `fetch`, `async/await`, debounce, eventos del DOM y también aprender a manejar mejor el estado de una aplicación.

---

## Búsqueda y Debounce

Cada jugador tiene su propio buscador para buscar el Pokémon que quiere usar.

La lista de Pokémon se carga desde PokéAPI y después se filtra dependiendo de lo que vaya escribiendo el usuario.

También agregué un debounce de aproximadamente 400ms para que la búsqueda no se ejecute cada vez que se presiona una tecla. Básicamente, la aplicación espera un momento hasta que el usuario deje de escribir y después hace la búsqueda.

La lista de Pokémon también se guarda después de la primera petición, para no tener que pedir la misma información a la API una y otra vez.

Si no se encuentra ningún Pokémon que coincida con la búsqueda, la aplicación muestra un mensaje en vez de simplemente dejar el espacio vacío.

---

## Sistema de Batalla

Cuando los dos Pokémon ya fueron seleccionados, la batalla empieza automáticamente.

Cada Pokémon muestra:

- su sprite
- su HP
- hasta cuatro movimientos
- una barra de vida

El sistema de batalla es bastante simple porque el proyecto no pedía turnos, ventajas por tipo ni cálculos reales de daño de Pokémon.

Cada vez que se presiona uno de los movimientos, el Pokémon rival recibe una cantidad aleatoria de daño entre 5 y 20 HP.

Después de cada ataque se actualiza tanto el número de HP como la barra de vida, y el HP nunca puede bajar de 0.

Cuando uno de los Pokémon llega a 0 HP, la batalla termina, los botones de movimientos se desactivan y se muestra cuál Pokémon ganó.

Después se puede empezar otra partida usando el botón **Play Again**.

---

## Archivos del Proyecto

El proyecto está dividido principalmente en cuatro archivos:

```text
pokemon-battle-arena/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### index.html

Contiene la estructura principal de la aplicación, incluyendo la pantalla para seleccionar los Pokémon y la arena de batalla.

### style.css

Contiene todo el diseño del proyecto, el responsive, las barras de HP y las animaciones de la batalla.

### script.js

Aquí está prácticamente toda la lógica del proyecto.

Algunas de las funciones principales son:

```js
fetchPokemonList()
fetchPokemonDetails()
searchPokemon()
debounce()
selectPokemon()
startBattle()
attack()
updateHpDisplay()
endBattle()
resetGame()
```

Traté de mantener las funciones separadas para que la parte que obtiene información de la API no quede toda mezclada con la parte que actualiza la página.

---

## Cómo Ejecutarlo

El proyecto no necesita una API key ni un backend.

La forma más sencilla de ejecutarlo es usando Live Server en VS Code.

1. Abrir la carpeta del proyecto en VS Code.
2. Abrir `index.html`.
3. Dar clic derecho y seleccionar **Open with Live Server**.
4. Buscar un Pokémon para el Jugador 1.
5. Buscar otro Pokémon para el Jugador 2.
6. Seleccionar ambos Pokémon.
7. Empezar la batalla.

---

## Cosas que Probé

Antes de terminar el proyecto probé diferentes partes de la aplicación para asegurarme de que todo funcionara correctamente.

Algunas de las cosas que probé fueron:

- buscar diferentes Pokémon
- buscar Pokémon que no existen
- seleccionar Pokémon para ambos jugadores
- cargar los sprites
- cargar el HP
- cargar hasta cuatro movimientos
- atacar desde ambos lados
- actualizar la barra de HP
- llegar a 0 HP
- mostrar al ganador
- desactivar los movimientos cuando termina la batalla
- usar el botón Play Again
- empezar una partida completamente nueva
- usar Pokémon diferentes después de reiniciar
- probar el diseño responsive en pantallas más pequeñas

---

## Qué Aprendí

Lo que más me sirvió de este proyecto fue entender mejor cómo conectar diferentes partes de JavaScript entre sí.

No se trataba solamente de hacer un `fetch` y mostrar información en pantalla. La búsqueda, la información que viene de la API, los Pokémon seleccionados, el HP, los botones de movimientos, la batalla y el reinicio dependen todos del estado actual de la aplicación.

Este proyecto me ayudó a entender mejor cómo `async/await`, `fetch`, los eventos y el DOM pueden trabajar juntos dentro de una misma aplicación.

También me ayudó a entender por qué es mejor mantener las funciones separadas, porque hace que el código sea más fácil de leer, entender y corregir si algo falla.

---

## Links del Proyecto

- GitHub Repository: https://github.com/massimodelaanexion80-web/two-pokemon-battle-arena-project/tree/main
- 
- Live Site: https://massimodelaanexion80-web.github.io/two-pokemon-battle-arena-project/

---

## Autor

Massimo  
Web 1
