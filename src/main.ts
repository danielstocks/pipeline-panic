import "./style.css";
import {
  renderGrid,
  animateTile,
  renderPipe,
  renderUpcomingPipes,
} from "./render";
import { GRID_COLS, GAME_SPEED, TIME_BEFORE_START } from "./config";
import { Grid, position } from "./grid";
import { debounce } from "./util";
//import { fixtureStart, fixtureEnd, fixtureTiles } from "./fixture";

let highScore = 0;
const appEl = document.querySelector<HTMLDivElement>("#app")!;
const upcomingEl = document.querySelector<HTMLDivElement>("#upcoming-pipes")!;
const gridEl = document.querySelector<HTMLDivElement>("#grid")!;
const countdownEl = document.querySelector<HTMLDivElement>("#countdown")!;
const messageEl = document.querySelector<HTMLDivElement>("#message")!;

// Set global CSS variable to adjust layout to number of grid cols
document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);

type Game = {
  win: boolean;
  end: boolean;
  loop: number;
  score: number;
};

function init() {
  //const grid = new Grid(fixtureStart, fixtureEnd, fixtureTiles);
  const grid = new Grid();

  let game: Game = {
    win: false,
    end: false,
    loop: 0,
    score: 50,
  };

  gridEl.innerHTML = renderGrid(grid);
  upcomingEl.innerHTML = renderUpcomingPipes(grid.upcomingPipes);
  gridEl.className = "game-in-progress";
  countdownEl.innerHTML = "PANIC IN: <span id='time'></span>";

  renderScore(game.score);

  countdown(function () {
    panic(grid, game);
  });

  // TODO: Fix "Memory leak" here
  gridEl.addEventListener("click", (event) => {
    handleGridClick(event.target, game, grid);
  });
}

countdownEl.addEventListener("click", (event) => {
  handleCountdownClick(event.target);
});

// Make sure max-width of grid is divisble by number of cols + gaps otherwise
// it will cause sub-pixel SVG rendering.
function setGridMaxSize() {
  let gridGaps = GRID_COLS - 1;
  let maxWidth =
    Math.floor((appEl.offsetWidth - gridGaps) / GRID_COLS) * GRID_COLS +
    gridGaps;
  gridEl.style.maxWidth = maxWidth + "px";
}
window.addEventListener("resize", debounce(setGridMaxSize, 50));
setGridMaxSize();

function renderScore(score: number) {
  const scoreEl = document.querySelector<HTMLDivElement>("#score")!;
  scoreEl.innerHTML = `
    <div id="current">Bank: ¤${score}</div>
  `;
  if (highScore > 0) {
    scoreEl.innerHTML += `<div id="high">High: ¤${highScore}</div>`;
  }
}

init();

function countdown(fn: () => void) {
  // Countdown
  const timeEl = document.querySelector<HTMLSpanElement>("#time")!;
  let timer = TIME_BEFORE_START;
  timeEl.innerHTML = timer.toString();
  let countdownLoop = window.setInterval(function () {
    timer--;
    if (timer === 0) {
      clearInterval(countdownLoop);
      fn();
      countdownEl.innerHTML = "<blink>PANIC</blink>";
      return;
    }
    timeEl.innerHTML = timer.toString();
  }, 1000);
}

// Start the panic!
function panic(grid: Grid, game: Game) {
  // Always render start tile when game starts
  animateTile(grid.startTile);
  game.loop = window.setInterval(() => {
    tick(grid, game);
  }, GAME_SPEED);
}

function tick(grid: Grid, game: Game) {
  let nextTile = grid.visitNextTile();

  if (nextTile) {
    // Animate next tile
    animateTile(nextTile);

    game.score += 50;
    renderScore(game.score);

    // Winning condition
    if (nextTile[1].pipe === "end") {
      game.end = true;
      game.win = true;
    }
  } else {
    // Losing condition
    game.end = true;
    game.win = false;
  }

  if (game.end) {
    gridEl.className = "game-over";
    window.clearInterval(game.loop);
  }
  if (game.end && game.win) {
    animateTile(grid.endTile);
    highScore = game.score;
    renderScore(game.score);
    console.log("__ WE LIVE ANOTHER DAY ___");
    countdownEl.innerHTML = "GOOD JOB - <button id='reset'>Restart</button>";
  }
  if (game.end && !game.win) {
    console.log("__ END OF THE F***ING WORLD ___");
    countdownEl.innerHTML = "GAME OVER - <button id='reset'>Try Again</button>";
  }
}

/*
 * Handle a click event on the grid and add a new
 * pipe to the tile if possible
 */
function handleGridClick(target: EventTarget | null, game: Game, grid: Grid) {
  if (game.end) {
    return;
  }

  messageEl.innerHTML = "";

  if (target instanceof HTMLElement || target instanceof SVGElement) {
    const tile = target.closest(".tile");
    if (tile instanceof HTMLElement) {
      const row = parseFloat(tile.dataset.row || "");
      const col = parseFloat(tile.dataset.col || "");
      let result = addPipeToGrid([row, col], grid, game.score);

      if (result == "new") {
        game.score -= 1;
      }
      if (result === "replacement") {
        game.score -= 5;
      }

      if (result == "insufficient-funds") {
        messageEl.innerHTML = "<span>Insufficient funds</span>";
      }

      renderScore(game.score);
    }
  }
}

/*
 * Handle a click event on the grid and add a new
 * pipe to the tile if possible
 */
function handleCountdownClick(target: EventTarget | null) {
  if (target instanceof HTMLElement) {
    const tile = target.closest("button");
    if (tile instanceof HTMLButtonElement && tile.id == "reset") {
      init();
    }
  }
}

/*
 * Add a new pipe to tile at given position
 */
function addPipeToGrid(
  [row, col]: position,
  grid: Grid,
  score: number
): ("new" | "replacement" | "insufficient-funds") | void {
  let nextPipe = grid.getUpcomingPipe();

  // Check if tile already exists (eg. has a direction)
  let existingTile = grid.get([row, col]);
  // Don't allow replacing tiles that have been visited
  if (existingTile?.direction) {
    return;
  }

  if (existingTile && score < 5) {
    return "insufficient-funds";
  }

  grid.set([row, col], { pipe: nextPipe });

  let tileEl = document.querySelector(
    `div[data-row="${row}"][data-col="${col}"]`
  );
  if (tileEl !== null) {
    tileEl.outerHTML = renderPipe({ pipe: nextPipe }, row, col, false);
  }
  upcomingEl.innerHTML = renderUpcomingPipes(grid.upcomingPipes);
  return existingTile ? "replacement" : "new";
}
