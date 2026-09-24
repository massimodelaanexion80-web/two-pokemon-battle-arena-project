const API_BASE_URL = "https://pokeapi.co/api/v2";
const SEARCH_DELAY = 400;
const MAX_SUGGESTIONS = 8;
const MIN_DAMAGE = 5;
const MAX_DAMAGE = 20;

// ------------------------------
// Application state
// ------------------------------
let pokemonListCache = null;
let pokemonListPromise = null;
let fighters = {
  1: null,
  2: null,
};
let battleActive = false;
let searchGeneration = { 1: 0, 2: 0 };

// ------------------------------
// DOM references
// ------------------------------
const pickerScreen = document.querySelector("#picker-screen");
const battleScreen = document.querySelector("#battle-screen");
const apiStatus = document.querySelector("#api-status");
const battleLog = document.querySelector("#battle-log");
const resultPanel = document.querySelector("#result-panel");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");
const playAgainButton = document.querySelector("#play-again-button");
const newMatchButton = document.querySelector("#new-match-button");
const searchInputs = document.querySelectorAll(".pokemon-search");

// ------------------------------
// API functions
// Fetching is kept separate from rendering.
// ------------------------------

/**
 * Fetch the Pokémon name list once and reuse it for future searches.
 * PokéAPI recommends caching resources instead of making duplicate requests.
 */
async function fetchPokemonList() {
  if (pokemonListCache) {
    return pokemonListCache;
  }

  // Reuse an in-flight request if both search boxes ask for the list at once.
  if (!pokemonListPromise) {
    pokemonListPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/pokemon?limit=1000`);

      if (!response.ok) {
        throw new Error("Could not load the Pokémon list.");
      }

      const data = await response.json();
      pokemonListCache = data.results;
      return pokemonListCache;
    })();
  }

  try {
    return await pokemonListPromise;
  } finally {
    // Keep successful data in pokemonListCache, but clear the promise so a
    // failed request can be retried normally.
    pokemonListPromise = null;
  }
}

/**
 * Search the cached API list.
 */
async function searchPokemon(query) {
  const pokemonList = await fetchPokemonList();
  const normalizedQuery = query.trim().toLowerCase();

  return pokemonList
    .filter((pokemon) => pokemon.name.includes(normalizedQuery))
    .slice(0, MAX_SUGGESTIONS);
}

/**
 * Fetch full details for one Pokémon.
 */
async function fetchPokemonDetails(nameOrId) {
  const response = await fetch(
    `${API_BASE_URL}/pokemon/${encodeURIComponent(nameOrId)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Pokémon not found.");
    }

    throw new Error("Could not load this Pokémon.");
  }

  const data = await response.json();
  const hpStat = data.stats.find((item) => item.stat.name === "hp");

  if (!hpStat) {
    throw new Error("This Pokémon does not have an HP stat.");
  }

  const moves = data.moves.slice(0, 4).map((item) => item.move.name);
  const sprite =
    data.sprites.front_default ||
    data.sprites.other?.["official-artwork"]?.front_default ||
    "";

  return {
    id: data.id,
    name: data.name,
    sprite,
    maxHp: hpStat.base_stat,
    currentHp: hpStat.base_stat,
    moves,
  };
}

// ------------------------------
// Utility functions
// ------------------------------

function debounce(callback, delay = SEARCH_DELAY) {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
  };
}

function formatName(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function randomDamage() {
  return (
    Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE
  );
}

function getSearchInput(playerNumber) {
  return document.querySelector(`#search-player-${playerNumber}`);
}

function getSuggestionsBox(playerNumber) {
  return document.querySelector(`#suggestions-player-${playerNumber}`);
}

function getPreview(playerNumber) {
  return document.querySelector(`#preview-player-${playerNumber}`);
}

function setApiStatus(message) {
  apiStatus.textContent = message;
}

// ------------------------------
// Search rendering and events
// ------------------------------

function renderSearchStatus(playerNumber, message) {
  const suggestionsBox = getSuggestionsBox(playerNumber);
  suggestionsBox.innerHTML = `<div class="suggestion-status">${message}</div>`;
}

function clearSuggestions(playerNumber) {
  getSuggestionsBox(playerNumber).innerHTML = "";
}

function renderSuggestions(playerNumber, pokemonMatches) {
  const suggestionsBox = getSuggestionsBox(playerNumber);

  if (pokemonMatches.length === 0) {
    renderSearchStatus(playerNumber, "No Pokémon found.");
    return;
  }

  suggestionsBox.innerHTML = pokemonMatches
    .map(
      (pokemon) => `
        <button
          class="suggestion-button"
          type="button"
          data-player="${playerNumber}"
          data-pokemon-name="${pokemon.name}"
          role="option"
        >
          ${formatName(pokemon.name)}
        </button>
      `
    )
    .join("");

  suggestionsBox
    .querySelectorAll(".suggestion-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectPokemon(
          Number(button.dataset.player),
          button.dataset.pokemonName
        );
      });
    });
}

async function handleSearch(playerNumber, query, requestGeneration) {
  const trimmedQuery = query.trim();

  // The input may have changed while the debounce timer was waiting.
  if (requestGeneration !== searchGeneration[playerNumber] || !trimmedQuery) {
    return;
  }

  renderSearchStatus(playerNumber, "Searching...");

  try {
    const matches = await searchPokemon(trimmedQuery);

    // Ignore stale async results if the user has already typed something else.
    if (requestGeneration !== searchGeneration[playerNumber]) {
      return;
    }

    renderSuggestions(playerNumber, matches);
    setApiStatus("PokéAPI connected");
  } catch (error) {
    console.error(error);

    if (requestGeneration !== searchGeneration[playerNumber]) {
      return;
    }

    renderSearchStatus(
      playerNumber,
      "Could not search right now. Check your connection."
    );
    setApiStatus("API error");
  }
}

const debouncedSearchHandlers = {
  1: debounce((query, generation) => handleSearch(1, query, generation)),
  2: debounce((query, generation) => handleSearch(2, query, generation)),
};

searchInputs.forEach((input) => {
  input.addEventListener("input", (event) => {
    const playerNumber = Number(event.currentTarget.dataset.player);
    const query = event.currentTarget.value;

    // Every edit invalidates older debounce callbacks and older fetch results.
    const generation = ++searchGeneration[playerNumber];

    if (!query.trim()) {
      clearSuggestions(playerNumber);
      return;
    }

    // Immediate visual feedback while debounce waits for the user to pause.
    renderSearchStatus(playerNumber, "Waiting for you to finish typing...");
    debouncedSearchHandlers[playerNumber](query, generation);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearSuggestions(Number(event.currentTarget.dataset.player));
    }
  });
});

// Close suggestion menus when the user clicks outside the search inputs.
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-wrapper")) {
    clearSuggestions(1);
    clearSuggestions(2);
  }
});

// ------------------------------
// Pokémon selection
// ------------------------------

async function selectPokemon(playerNumber, pokemonName) {
  const input = getSearchInput(playerNumber);
  const preview = getPreview(playerNumber);

  input.value = formatName(pokemonName);
  input.disabled = true;
  clearSuggestions(playerNumber);

  preview.innerHTML = `
    <div class="empty-state">
      <p>Loading ${formatName(pokemonName)}...</p>
    </div>
  `;

  try {
    const pokemon = await fetchPokemonDetails(pokemonName);
    fighters[playerNumber] = pokemon;
    renderPickerFighter(playerNumber);
    setApiStatus("Pokémon loaded");

    if (fighters[1] && fighters[2]) {
      startBattle();
    }
  } catch (error) {
    console.error(error);
    fighters[playerNumber] = null;
    input.disabled = false;
    input.value = "";

    preview.innerHTML = `
      <div class="empty-state">
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderPickerFighter(playerNumber) {
  const pokemon = fighters[playerNumber];
  const preview = getPreview(playerNumber);

  if (!pokemon) {
    return;
  }

  const moveButtons = pokemon.moves
    .map(
      (move) => `
        <button class="move-preview" type="button" disabled>
          ${formatName(move)}
        </button>
      `
    )
    .join("");

  preview.innerHTML = `
    <div class="preview-pokemon">
      ${
        pokemon.sprite
          ? `<img src="${pokemon.sprite}" alt="${formatName(pokemon.name)} sprite" />`
          : `<div class="pokeball-icon" aria-hidden="true"></div>`
      }
      <h3>${formatName(pokemon.name)}</h3>
      <p class="preview-hp">HP ${pokemon.maxHp}</p>
      <div class="move-preview-grid">
        ${moveButtons}
      </div>
      <button
        class="change-fighter-button"
        type="button"
        data-player="${playerNumber}"
      >
        Change Pokémon
      </button>
    </div>
  `;

  preview
    .querySelector(".change-fighter-button")
    .addEventListener("click", () => clearFighter(playerNumber));
}

function clearFighter(playerNumber) {
  fighters[playerNumber] = null;
  searchGeneration[playerNumber]++;

  const input = getSearchInput(playerNumber);
  const preview = getPreview(playerNumber);

  input.value = "";
  input.disabled = false;
  clearSuggestions(playerNumber);
  preview.innerHTML = `
    <div class="empty-state">
      <div class="pokeball-icon" aria-hidden="true"></div>
      <p>Search and select a Pokémon.</p>
    </div>
  `;
  input.focus();
}

// ------------------------------
// Battle
// ------------------------------

function startBattle() {
  // Clone current HP from max HP every time a fresh battle starts.
  fighters[1].currentHp = fighters[1].maxHp;
  fighters[2].currentHp = fighters[2].maxHp;

  battleActive = true;
  pickerScreen.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  resultPanel.classList.add("hidden");
  battleLog.textContent = "Choose any move to attack.";

  renderBattleFighter(1);
  renderBattleFighter(2);
}

function renderBattleFighter(playerNumber) {
  const pokemon = fighters[playerNumber];
  const card = document.querySelector(`#battle-player-${playerNumber}`);

  if (!pokemon) {
    card.innerHTML = "";
    return;
  }

  const moveButtons = pokemon.moves
    .map(
      (move) => `
        <button
          class="move-button"
          type="button"
          data-attacker="${playerNumber}"
          data-move="${move}"
          ${battleActive ? "" : "disabled"}
        >
          ${formatName(move)}
        </button>
      `
    )
    .join("");

  card.innerHTML = `
    <div class="fighter" id="fighter-${playerNumber}">
      <p class="fighter-number">PLAYER ${playerNumber}</p>
      ${
        pokemon.sprite
          ? `<img src="${pokemon.sprite}" alt="${formatName(pokemon.name)} sprite" />`
          : `<div class="pokeball-icon" aria-hidden="true"></div>`
      }
      <h3>${formatName(pokemon.name)}</h3>

      <div class="hp-row">
        <span>HP</span>
        <span id="hp-number-${playerNumber}">
          ${pokemon.currentHp} / ${pokemon.maxHp}
        </span>
      </div>

      <div
        class="hp-track"
        role="progressbar"
        aria-label="${formatName(pokemon.name)} HP"
        aria-valuemin="0"
        aria-valuemax="${pokemon.maxHp}"
        aria-valuenow="${pokemon.currentHp}"
      >
        <div id="hp-bar-${playerNumber}" class="hp-bar"></div>
      </div>

      <div class="move-grid">
        ${moveButtons}
      </div>
    </div>
  `;

  card.querySelectorAll(".move-button").forEach((button) => {
    button.addEventListener("click", () => {
      attack(
        Number(button.dataset.attacker),
        button.dataset.move
      );
    });
  });

  updateHpDisplay(playerNumber);
}

function attack(attackerNumber, moveName) {
  if (!battleActive) {
    return;
  }

  const defenderNumber = attackerNumber === 1 ? 2 : 1;
  const attacker = fighters[attackerNumber];
  const defender = fighters[defenderNumber];
  const damage = randomDamage();

  defender.currentHp = Math.max(0, defender.currentHp - damage);
  updateHpDisplay(defenderNumber);
  animateHit(defenderNumber);

  battleLog.textContent = `${formatName(attacker.name)} used ${formatName(
    moveName
  )} and dealt ${damage} damage to ${formatName(defender.name)}!`;

  if (defender.currentHp === 0) {
    endBattle(attackerNumber, defenderNumber);
  }
}

function updateHpDisplay(playerNumber) {
  const pokemon = fighters[playerNumber];
  const hpNumber = document.querySelector(`#hp-number-${playerNumber}`);
  const hpBar = document.querySelector(`#hp-bar-${playerNumber}`);
  const hpTrack = hpBar?.parentElement;

  if (!pokemon || !hpNumber || !hpBar || !hpTrack) {
    return;
  }

  const hpPercent = Math.max(
    0,
    Math.round((pokemon.currentHp / pokemon.maxHp) * 100)
  );

  hpNumber.textContent = `${pokemon.currentHp} / ${pokemon.maxHp}`;
  hpBar.style.width = `${hpPercent}%`;
  hpBar.classList.remove("medium", "low");

  if (hpPercent <= 25) {
    hpBar.classList.add("low");
  } else if (hpPercent <= 50) {
    hpBar.classList.add("medium");
  }

  hpTrack.setAttribute("aria-valuenow", pokemon.currentHp);
}

function animateHit(playerNumber) {
  const fighterElement = document.querySelector(`#fighter-${playerNumber}`);

  if (!fighterElement) {
    return;
  }

  fighterElement.classList.remove("is-hit");
  // Force a reflow so the animation can replay on consecutive hits.
  void fighterElement.offsetWidth;
  fighterElement.classList.add("is-hit");

  setTimeout(() => {
    fighterElement.classList.remove("is-hit");
  }, 320);
}

function endBattle(winnerNumber, loserNumber) {
  battleActive = false;

  const winner = fighters[winnerNumber];
  const loser = fighters[loserNumber];

  document.querySelectorAll(".move-button").forEach((button) => {
    button.disabled = true;
  });

  battleLog.textContent = `${formatName(loser.name)} reached 0 HP.`;
  resultTitle.textContent = `${formatName(winner.name)} wins!`;
  resultMessage.textContent = `${formatName(loser.name)} has fainted.`;
  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ------------------------------
// Reset
// ------------------------------

function resetGame() {
  battleActive = false;
  fighters = {
    1: null,
    2: null,
  };

  resultPanel.classList.add("hidden");
  battleScreen.classList.add("hidden");
  pickerScreen.classList.remove("hidden");
  battleLog.textContent = "Choose any move to attack.";

  [1, 2].forEach((playerNumber) => {
    searchGeneration[playerNumber]++;
    const input = getSearchInput(playerNumber);
    const preview = getPreview(playerNumber);

    input.value = "";
    input.disabled = false;
    clearSuggestions(playerNumber);

    preview.innerHTML = `
      <div class="empty-state">
        <div class="pokeball-icon" aria-hidden="true"></div>
        <p>Search and select a Pokémon.</p>
      </div>
    `;
  });

  setApiStatus(pokemonListCache ? "PokéAPI ready · list cached" : "PokéAPI ready");
  getSearchInput(1).focus();
}

playAgainButton.addEventListener("click", resetGame);
newMatchButton.addEventListener("click", resetGame);
