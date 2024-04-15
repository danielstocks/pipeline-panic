// * 0.1 release BACKLOG *
//------------------------
// Major refactor
// Tesing + Test Coverage?
// Reset game button
// Score system + High Score
// Intersection pipes
// Bug: prevent double click to select text in tiles
// Resume/pause game on tab focus/blur
// Programatically create SVG instead of declaritevly
// Improve overall rendering/state management logic
// Graphic/UI/Story enhhancement
// Release 0.1

import "./style.css";
import { renderGrid, renderPipe, renderUpcomingPipes } from "./render";
import { GRID_COLS, TIME_BEFORE_START } from "./config";
import { getRandomItemFromArray } from "./util";
import { Grid, Tile, pipes } from "./grid";
// import { fixtureStart, fixtureEnd, fixtureTiles } from "./fixture";

/*
 * Creates a list of upcoming pipes for player
 * to pick from
 */
const upcomingPipes = [...Array(6).keys()].map(() => {
  return getRandomItemFromArray(Object.keys(pipes));
});

/*
 * Create start and end tiles to place on grid
 */
//const grid = new Grid(fixtureStart, fixtureEnd, fixtureTiles);
const grid = new Grid();

// Start the panic!
let gameLoop: number;
function panic() {
  // Always render start tile when game starts
  renderNextTile(grid.startTile);
  gameLoop = window.setInterval(tick, 1000);
}

function tick() {
  let win = false;
  let end = false;
  let nextTile = grid.getConnectingTile();

  if (nextTile) {
    // Update connecting tile with a new direction
    grid.set([nextTile[0][0], nextTile[0][1]], {
      ...nextTile[1],
    });
    grid.visit(nextTile[0]);

    // Render next tile
    renderNextTile(nextTile);

    // Winning condition
    if (nextTile[1].pipe === "end") {
      end = true;
      win = true;
    }
  } else {
    // Losing condition
    end = true;
    win = false;
  }

  if (end) {
    gridEl.className = "game-over";
    window.clearInterval(gameLoop);
  }
  if (end && win) {
    // Render end tile if player wins
    renderNextTile(grid.endTile);
    console.log("__ WINNER ___");
    countdownEl.innerHTML = "GOOD JOB - <button>Restart</button>";
  }
  if (end && !win) {
    console.log("__ LOSER ___");
    countdownEl.innerHTML = "GAME OVER - <button>Try Again</button>";
  }
}

const gridEl = document.querySelector<HTMLDivElement>("#grid")!;
const upcomingEl = document.querySelector<HTMLDivElement>("#upcoming-pipes")!;
const timeEl = document.querySelector<HTMLSpanElement>("#time")!;
const countdownEl = document.querySelector<HTMLDivElement>("#countdown")!;

gridEl.innerHTML = renderGrid(grid);
upcomingEl.innerHTML = renderUpcomingPipes(upcomingPipes);
gridEl.className = "game-in-progress";

// TODO REFACTOR: Seperate logic of adding tile from event handler
gridEl.addEventListener("click", function (event) {
  // TODO: how to do this?
  /*
  if (gameOver) {
    return;
  }
  */
  const target = event.target;
  if (target instanceof HTMLElement || target instanceof SVGElement) {
    const tile = target.closest(".tile");
    if (tile instanceof HTMLElement) {
      let nextPipe = upcomingPipes.pop();
      upcomingPipes.unshift(getRandomItemFromArray(Object.keys(pipes)));
      if (!nextPipe) {
        throw new Error("no next pipe available");
      }
      const row = parseFloat(tile.dataset.row || "");
      const col = parseFloat(tile.dataset.col || "");
      let existingTile = grid.get([row, col]);
      // Don't allow replacing tiles that have been visited
      if (existingTile && existingTile.direction) {
        return;
      }
      grid.set([row, col], { pipe: nextPipe });
      tile.outerHTML = renderPipe({ pipe: nextPipe }, row, col, false);
      upcomingEl.innerHTML = renderUpcomingPipes(upcomingPipes);
    }
  }
});

// Set global CSS variable to adjust layout to number of grid cols
document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);

// Animate individual tile
function renderNextTile(tile: Tile) {
  let [row, col] = tile[0];
  let tileEl = document.querySelector(
    `div[data-row="${row}"][data-col="${col}"]`
  );
  let inGrid = grid.get([row, col]);
  if (tileEl !== null && inGrid) {
    tileEl.outerHTML = renderPipe(tile[1], row, col, true);
  }
}

// Countdown
let timer = TIME_BEFORE_START;
timeEl.innerHTML = timer.toString();
let countdownLoop = window.setInterval(function () {
  timer--;
  if (timer === 0) {
    clearInterval(countdownLoop);
    panic();
    countdownEl.innerHTML = "<blink>PANIC</blink>";
    return;
  }
  timeEl.innerHTML = timer.toString();
}, 1000);
