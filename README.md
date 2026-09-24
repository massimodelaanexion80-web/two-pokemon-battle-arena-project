# Pokémon Battle Arena ⚡

This is my Pokémon Battle Arena project for Web 1.

The project uses PokéAPI to search for two Pokémon, load their information and let them battle each other using four different moves.

The main goal was to practice `fetch`, `async/await`, debounce, DOM events and managing the state of the application.

---

## Search and Debounce

Each player has a search box where they can look for a Pokémon.

The Pokémon list is loaded from PokéAPI and then filtered depending on what the user types.

I added a debounce of around 400ms so the search does not run every single time a key is pressed. The app waits until the user stops typing for a moment before searching.

The Pokémon list is also saved after the first request so the same information does not have to be requested again every time.

If there are no matches, the app shows a message instead of leaving the search empty.

---

## Battle System

Once both Pokémon are selected, the battle starts automatically.

Each Pokémon shows:

- its sprite
- its HP
- up to four moves
- an HP bar

The battle system is simple because the project does not require turns, type advantages or real Pokémon damage calculations.

Every time a move is clicked, the opponent receives a random amount of damage between 5 and 20 HP.

The HP bar and HP number update after every attack, and the HP can never go below 0.

When one Pokémon reaches 0 HP, the battle ends, the move buttons are disabled and the winner is shown.

The player can then start another match using the Play Again button.

---

## Project Files

The project is divided into four main files:

```text
pokemon-battle-arena/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### index.html

Contains the main structure of the application, including the Pokémon selection screen and the battle arena.

### style.css

Contains the design of the project, responsive layout, HP bars and battle animations.

### script.js

Contains most of the logic of the project.

Some of the main functions are:

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

I tried to keep the functions separated so the code that gets information from the API is not mixed too much with the code that updates the page.

---

## How to Run It

The project does not need an API key or backend.

The easiest way to run it is with Live Server in VS Code.

1. Open the project folder in VS Code.
2. Open `index.html`.
3. Right-click and select **Open with Live Server**.
4. Search for a Pokémon for Player 1.
5. Search for another Pokémon for Player 2.
6. Select both Pokémon.
7. Start battling.

---

## Things I Tested

Before finishing the project I tested different parts of the app to make sure everything worked correctly.

Some of the things I tested were:

- searching for different Pokémon
- searching for Pokémon that do not exist
- selecting Pokémon for both players
- loading sprites
- loading HP
- loading four moves
- attacking from both sides
- updating the HP bar
- reaching 0 HP
- showing the winner
- disabling moves after the battle ends
- using Play Again
- starting a completely new battle
- using different Pokémon after resetting
- the responsive layout on smaller screens

---

## What I Learned

The part I found most useful was learning how to connect different parts of JavaScript together.

It was not only about making a `fetch` request. The search, API information, selected Pokémon, HP, move buttons, battle and reset all depend on the current state of the application.

Working on this project helped me understand better how `async/await`, `fetch`, events and the DOM can work together in the same application.

It also helped me understand why keeping functions separated makes the code easier to read and fix.

---

## Project Links

- GitHub Repository: https://github.com/massimodelaanexion80-web/two-pokemon-battle-arena-project/tree/main
- Live Site: https://massimodelaanexion80-web.github.io/two-pokemon-battle-arena-project/

---

## Author

Massimo  
Web 1
