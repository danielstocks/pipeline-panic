// * 0.1 release BACKLOG *
//------------------------
// TODO: Major refactor
// TODO: Reset game button
// TODO  Intersection pipes
// TODO: Score
// TODO: Resume/pause game on tab focus/blur
// TODO: "How to test?"
// TODO: Programatically create SVG instead of declaritevly
// TODO: Graphic/UI/Story enhhancement
// TODO: Release 0.1

import "./style.css";
import { renderGrid, renderPipe, renderUpcomingPipes } from "./render";
import { GRID_COLS } from "./config";
import { getRandomItemFromArray, intersect, diff } from "./util";
import { createInitialTiles } from "./create-initial-tiles";
import { Grid, Tile } from "./grid";

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
 * Create start and end pipes to place on grid
 */
const [startTile, endTile] = createInitialTiles({
  start: [
    [2, 1],
    {
      direction: "s",
    },
  ],
  end: [[3, 3], { direction: "e" }],
});

/*
 * Setup initial tiles
 */
const tiles = new Grid([
  startTile,
  [[2, 3], { pipe: "h" }],
  [[3, 1], { pipe: "v" }],
  [[4, 1], { pipe: "ne" }],
  [[4, 2], { pipe: "nw" }],
  [[3, 2], { pipe: "v" }],
  [[2, 2], { pipe: "se" }],
  [[2, 3], { pipe: "h" }],
  [[2, 4], { pipe: "nw" }],
  [[1, 4], { pipe: "sw" }],
  [[1, 3], { pipe: "h" }],
  [[1, 2], { pipe: "ne" }],
  [[0, 2], { pipe: "se" }],
  [[0, 3], { pipe: "h" }],
  [[0, 4], { pipe: "h" }],
  [[0, 5], { pipe: "sw" }],
  [[1, 5], { pipe: "v" }],
  [[2, 5], { pipe: "v" }],
  [[3, 5], { pipe: "nw" }],
  [[3, 4], { pipe: "h" }],
  endTile,
]);

tiles.visit(startTile[0]);

let win = false;
let gameOver = false;

/*
 * Retrieves the last visited pipe and checks wether it can connect
 * to another pipe. If yes, the game continues until the "end pipe" is reached
 * in which case the player wins. If no connection can be made, the game is over
 * and the player loses
 *
 * If a connecting tile exists, the positing of that tile is returned
 */
function next() {
  let tile = tiles.getLastVisitedTile();

  if (tile) {
    // Check if there is a tile that connects
    let connectingTile = getConnectingTile(tile, tiles);

    if (connectingTile) {
      // Winning condition
      if (connectingTile[1].pipe === "end") {
        gameOver = true;
        win = true;
      } else {
        // Update connecting tile with a new direction
        tiles.set([connectingTile[0][0], connectingTile[0][1]], {
          ...connectingTile[1],
        });
        tiles.visit(connectingTile[0]);
        return connectingTile[0];
      }
    } else {
      gameOver = true;
    }
  }

  if (gameOver) {
    window.clearInterval(gameLoop);

    if (gridEl !== null) {
      gridEl.className = "game-over";
    }
    if (win) {
      console.log("__ WINNER ___");
      if (countdownEl !== null) {
        countdownEl.innerHTML = "GOOD JOB - <button>Restart</button>";
      }
    } else {
      console.log("__ LOSER ___");
      if (countdownEl !== null) {
        countdownEl.innerHTML = "GAME OVER - <button>Try Again</button>";
      }
    }
  }
}

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
      let newDirection: "n" | "s" | "w" | "e" | undefined = diff(
        [directionConnection],
        pipeConnection
      )[0];

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

// Game loop!
let gameLoop: number;
function panic() {
  renderNextTile(startTile[0]);
  gameLoop = window.setInterval(function () {
    let nextTilePosition = next();
    if (nextTilePosition) {
      renderNextTile(nextTilePosition);
    }
    if (gameOver && win) {
      renderNextTile(endTile[0]);
    }
  }, 1000);
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
gridEl.addEventListener("click", function (event) {
  if (gameOver) {
    return;
  }
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
