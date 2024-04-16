// * 0.1 release BACKLOG *
//------------------------
// Reset game button
// Tesing + Test Coverage?
// Score system + High Score
// Intersection pipes
// Bug: prevent double click to select text in tiles
// Resume/pause game on tab focus/blur
// Programatically create SVG instead of declaritevly
// Improve overall rendering/state management logic
// Graphic/UI/Story enhhancement
// Release 0.1

import "./style.css";
import {
  renderGrid,
  animateTile,
  renderPipe,
  renderUpcomingPipes,
} from "./render";
import { GRID_COLS, TIME_BEFORE_START } from "./config";
import { Grid, position } from "./grid";
// import { fixtureStart, fixtureEnd, fixtureTiles } from "./fixture";

const upcomingEl = document.querySelector<HTMLDivElement>("#upcoming-pipes")!;
const gridEl = document.querySelector<HTMLDivElement>("#grid")!;
const timeEl = document.querySelector<HTMLSpanElement>("#time")!;
const countdownEl = document.querySelector<HTMLDivElement>("#countdown")!;

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
    score: 0,
  };

  gridEl.innerHTML = renderGrid(grid);
  upcomingEl.innerHTML = renderUpcomingPipes(grid.upcomingPipes);
  gridEl.className = "game-in-progress";

  countdown(function () {
    panic(grid, game);
  });

  gridEl.addEventListener("click", (event) => {
    handleGridClick(event.target, game, grid);
  });

  /*
  countdownEl.addEventListener("click", (event) => {
    handle;
  });
  */
}

init();

function countdown(fn: () => void) {
  // Countdown
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
  }, 1000);
}

function tick(grid: Grid, game: Game) {
  let nextTile = grid.getConnectingTile();

  if (nextTile) {
    // Update connecting tile with a new direction
    grid.set([nextTile[0][0], nextTile[0][1]], {
      ...nextTile[1],
    });
    grid.visit(nextTile[0]);

    // Animate next tile
    animateTile(nextTile);

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
    console.log("__ WINNER ___");
    countdownEl.innerHTML = "GOOD JOB - <button>Restart</button>";
  }
  if (game.end && !game.win) {
    console.log("__ LOSER ___");
    countdownEl.innerHTML = "GAME OVER - <button>Try Again</button>";
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
  if (target instanceof HTMLElement || target instanceof SVGElement) {
    const tile = target.closest(".tile");
    if (tile instanceof HTMLElement) {
      const row = parseFloat(tile.dataset.row || "");
      const col = parseFloat(tile.dataset.col || "");
      addPipeToGrid([row, col], grid);
    }
  }
}

/*
 * Add a new pipe to tile at given position
 */
function addPipeToGrid([row, col]: position, grid: Grid) {
  let nextPipe = grid.getUpcomingPipe();

  // Check if tile already exists (eg. has a direction)
  let existingTile = grid.get([row, col]);
  // Don't allow replacing tiles that have been visited
  if (existingTile?.direction) {
    return;
  }
  grid.set([row, col], { pipe: nextPipe });
  let tileEl = document.querySelector(
    `div[data-row="${row}"][data-col="${col}"]`
  );
  if (tileEl !== null) {
    tileEl.outerHTML = renderPipe({ pipe: nextPipe }, row, col, false);
  }
  upcomingEl.innerHTML = renderUpcomingPipes(grid.upcomingPipes);
}
