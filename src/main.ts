// * 0.1 release BACKLOG *
//------------------------
// Major refactor
// Tesing + Test Coverage?
// Reset game button
// Intersection pipes
// Score
// TODO: prevent double click to select text in tiles
// Resume/pause game on tab focus/blur
// Programatically create SVG instead of declaritevly
// Graphic/UI/Story enhhancement
// Release 0.1

import "./style.css";
import { renderGrid, renderPipe, renderUpcomingPipes } from "./render";
import { GRID_COLS } from "./config";
import { getRandomItemFromArray, intersect, diff } from "./util";
import { createInitialTiles } from "./create-initial-tiles";
import { Grid, Tile } from "./grid";
import { fixture1, initialTileFixture } from "./fixture";

/*
 * A map of available pipes and which directions
 * they can connect with
 *
 * h = horizontal
 * v = vertical
 * c = cross
 * ne = north-east
 * ...
 */
const pipes: {
  [key: string]: ("n" | "e" | "s" | "w")[];
} = {
  c: ["n", "e", "s", "w"],
  ne: ["n", "e"],
  nw: ["n", "w"],
  sw: ["s", "w"],
  se: ["s", "e"],
  h: ["e", "w"],
  v: ["n", "s"],
};

/*
 * Creates a list of upcoming pipes for player
 * to pick from
 */
const upcomingPipes = [...Array(6).keys()].map(() => {
  return getRandomItemFromArray(Object.keys(pipes));
});

/*
 * A list of directions and what directions they
 * connec with. eg. South connects with north
 */
const directionConnectionMap: {
  [key: string]: "n" | "e" | "s" | "w";
} = {
  s: "n",
  n: "s",
  e: "w",
  w: "e",
};

/*
 * Create start and end tiles to place on grid
 */
const [startTile, endTile] = createInitialTiles(initialTileFixture);

// TODO REFACTOR: accept start, end and tiles as arguments?
// Automitcally "visit" start tile and make it required
const tiles = new Grid([startTile, endTile, ...fixture1]);
tiles.visit(startTile[0]);

/*
 * Takes one tile and see if it connects with another tile on the grid
 */
function getConnectingTile(tile: Tile, tiles: Grid): Tile | void {
  let position = tile[0];
  let direction = tile[1].direction;

  // Shift position based on direction
  if (direction === "s") {
    position[0] = position[0] + 1;
  } else if (direction === "n") {
    position[0] = position[0] - 1;
  } else if (direction === "e") {
    position[1] = position[1] + 1;
  } else if (direction === "w") {
    position[1] = position[1] - 1;
  } else if (!direction) {
    throw new Error("No direction on visited tile found");
  }

  // Attempt to retrieve tile in shifted position
  const nextTile = tiles.get([position[0], position[1]]);

  // if next tile exists, check wether it connects with the
  // current tile direciton
  if (nextTile) {
    let directionConnection = directionConnectionMap[direction];
    if (!directionConnection) {
      // TODO: if end pipe is reached here it will throw an error if it doenst connect
      throw new Error(direction + " direction has no connection");
    }

    // If next pipe is end, check if it connects, if yes, return it.
    if (nextTile.pipe === "end") {
      if (directionConnection === nextTile.direction) {
        return [[position[0], position[1]], nextTile];
      }
    }

    let pipeConnection = pipes[nextTile.pipe];
    if (!pipeConnection) {
      throw new Error(nextTile.pipe + " pipe has no connection");
    }

    // Check if directionConnection and a pipeConnection intersects, eg. connects.
    if (intersect([directionConnection], pipeConnection).length === 1) {
      // Extract the non-intersecting direction to set the
      // directional flow of the next pipe
      let newDirection = diff([directionConnection], pipeConnection)[0];
      if (!newDirection) {
        throw new Error("A direction for next tile could not be found");
      }

      return [
        [position[0], position[1]],
        {
          direction: newDirection,
          pipe: nextTile.pipe,
        },
      ];
    }
  }
}

// Start the panic!
let gameLoop: number;
function panic() {
  // Always render start tile when game starts
  renderNextTile(startTile[0]);
  gameLoop = window.setInterval(tick, 1000);
}

function tick() {
  let win = false;
  let end = false;
  let nextTile = getConnectingTile(tiles.getLastVisitedTile(), tiles);

  if (nextTile) {
    // Update connecting tile with a new direction
    tiles.set([nextTile[0][0], nextTile[0][1]], {
      ...nextTile[1],
    });
    tiles.visit(nextTile[0]);

    // Render next tile
    renderNextTile(nextTile[0]);

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
    if (gridEl !== null) {
      gridEl.className = "game-over";
    }
    window.clearInterval(gameLoop);
  }
  if (end && win) {
    // Render end tile if player wins
    renderNextTile(endTile[0]);
    console.log("__ WINNER ___");
    if (countdownEl !== null) {
      countdownEl.innerHTML = "GOOD JOB - <button>Restart</button>";
    }
  }
  if (end && !win) {
    console.log("__ LOSER ___");
    if (countdownEl !== null) {
      countdownEl.innerHTML = "GAME OVER - <button>Try Again</button>";
    }
  }
}

const gridEl = document.querySelector<HTMLDivElement>("#grid");
const upcomingEl = document.querySelector<HTMLDivElement>("#upcoming-pipes");
const timeEl = document.querySelector<HTMLSpanElement>("#time");
const countdownEl = document.querySelector<HTMLDivElement>("#countdown");

if (gridEl === null) {
  throw new Error("Cannot find <div id='grid'>");
}

if (upcomingEl === null) {
  throw new Error("Cannot find <div id='upcoming-pipes'>");
}

if (timeEl === null) {
  throw new Error("Cannot find <span id='time'>");
}

if (countdownEl === null) {
  throw new Error("Cannot find <div id='countdown'>");
}

gridEl.innerHTML = renderGrid(tiles);
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
      let existingTile = tiles.get([row, col]);
      // Don't allow replacing tiles that have been visited
      if (existingTile && existingTile.direction) {
        return;
      }
      tiles.set([row, col], { pipe: nextPipe });
      tile.outerHTML = renderPipe({ pipe: nextPipe }, row, col, false);
      upcomingEl.innerHTML = renderUpcomingPipes(upcomingPipes);
    }
  }
});

document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);

// Animate individual tile
function renderNextTile(nextTilePosition: [number, number]) {
  let [row, col] = nextTilePosition;
  let tile = document.querySelector(
    `div[data-row="${row}"][data-col="${col}"]`
  );
  let inGrid = tiles.get([row, col]);
  if (tile !== null && inGrid) {
    tile.outerHTML = renderPipe({ ...inGrid }, row, col, true);
  }
}

// Countdown
const COUNTDOWN = 3;
let timer = COUNTDOWN;
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
