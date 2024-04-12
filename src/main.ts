// * 0.1 release BACKLOG *
//------------------------
// -------- TODAY --------
// TODO: Bug: "game over" condition too fast.
// TODO: Bug: Replacing tile is possible without causing game over.
// -------- LATER --------
// TODO: Reset game button
// TODO  Intersection pipes
// TODO: Score
// TODO: Resume/pause game on tab focus/blur
// TODO: Major refactor
// TODO: "How to test?"
// TODO: Graphic/UI/Story enhhancement
// TODO: Release 0.1

import "./style.css";
import { renderGrid, renderPipe, renderUpcomingPipes } from "./render";
import { AVAILABLE_PIPES, GRID_COLS, GRID_ROWS } from "./config";
import {
  getRandomItemFromArray,
  getRandomIntegerBetween,
  intersect,
  diff,
} from "./util";

let gameOver = false;

// Initialize game state
const upcomingPipes = [...Array(6).keys()].map(() => {
  return getRandomItemFromArray(AVAILABLE_PIPES);
});

const connectsWith: {
  [key: string]: string[];
} = {
  h: ["e", "w"],
  v: ["n", "s"],
  ne: ["n", "e"],
  nw: ["n", "w"],
  sw: ["s", "w"],
  se: ["s", "e"],
};

const dirConnect: {
  [key: string]: string;
} = {
  s: "n",
  n: "s",
  e: "w",
  w: "e",
};

let startRow = getRandomIntegerBetween(2, GRID_ROWS - 2);
let startCol = getRandomIntegerBetween(2, GRID_COLS - 2);
let endRow = startRow;
let endCol = startCol;

let invalidEndPositions = [
  `${startRow},${startCol}`,
  `${startRow},${startCol + 1}`,
  `${startRow},${startCol - 1}`,
  `${startRow - 1},${startCol}`,
  `${startRow - 1},${startCol + 1}`,
  `${startRow - 1},${startCol - 1}`,
  `${startRow + 1},${startCol}`,
  `${startRow + 1},${startCol + 1}`,
  `${startRow + 1},${startCol - 1}`,
];

while (invalidEndPositions.includes(`${endRow},${endCol}`)) {
  endRow = getRandomIntegerBetween(2, GRID_ROWS - 2);
  endCol = getRandomIntegerBetween(2, GRID_COLS - 2);
}

startRow = 2;
startCol = 1;
endRow = 2;
endCol = 4;

const startDirection = "s"; // getRandomItemFromArray(["s", "w", "n", "e"]);
const endDirection = "w"; // getRandomItemFromArray(["s", "w", "n", "e"]);

type tile = {
  pipe: string;
  direction?: string;
};

type tileWithPosition = tile & {
  position: [number, number];
  direction: string;
};

const startTile: [string, tile] = [
  `${startRow},${startCol}`,
  { pipe: "start", direction: startDirection },
];

const endTile: [string, tile] = [
  `${endRow},${endCol}`,
  { pipe: "end", direction: endDirection },
];

const grid = new Map<string, tile>([
  ["2,2", { pipe: "h" }],
  ["2,3", { pipe: "h" }],

  ["2,1", { pipe: "v" }],
  ["3,1", { pipe: "v" }],
  ["4,1", { pipe: "ne" }],
  ["4,2", { pipe: "nw" }],
  ["3,2", { pipe: "v" }],
  ["2,2", { pipe: "se" }],
  ["2,3", { pipe: "h" }],
  ["2,4", { pipe: "nw" }],
  ["1,4", { pipe: "sw" }],
  ["1,3", { pipe: "h" }],
  ["1,2", { pipe: "ne" }],
  ["0,2", { pipe: "se" }],
  ["0,3", { pipe: "h" }],
  ["0,4", { pipe: "h" }],
  ["0,5", { pipe: "sw" }],
  ["1,5", { pipe: "v" }],
  ["2,5", { pipe: "v" }],
  ["3,5", { pipe: "nw" }],
  ["3,4", { pipe: "h" }],
]);

grid.set(...startTile);
grid.set(...endTile);

const visitedTiles: tileWithPosition[] = [
  {
    position: [startRow, startCol],
    direction: startDirection,
    ...startTile[1],
  },
];

var i = 0;
let nextTilePosition: string | undefined;
let win = false;

function next(): boolean {
  i++;

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

      let endTile = visitedTiles[visitedTiles.length - 1];
      if (endTile) {
        renderNextTile(`${endTile.position[0]},${endTile.position[1]}`);
      }
    } else {
      console.log("__ LOSER ___");
      if (countdownEl !== null) {
        countdownEl.innerHTML = "GAME OVER - <button>Try Again</button>";
      }
    }
    return false;
  }

  let nextTile = visitedTiles[visitedTiles.length - 1];

  if (typeof nextTile !== "undefined") {
    nextTilePosition = nextTile.position.join(",");
    let inGrid = grid.get(`${nextTile.position[0]},${nextTile.position[1]}`);

    if (typeof inGrid !== "undefined") {
      grid.set(`${nextTile.position[0]},${nextTile.position[1]}`, {
        ...inGrid,
        direction: nextTile.direction,
      });
    }

    let connectingTile = getConnectingTile(nextTile, grid);

    console.log(connectingTile);

    if (connectingTile) {
      if (connectingTile.pipe === "end") {
        gameOver = true;
        win = true;
      }

      visitedTiles.push(connectingTile);
    }
  }

  return true;
}

function getConnectingTile(
  from: tileWithPosition,
  grid: Map<string, { pipe: string }>
): tileWithPosition | void {
  let position = from.position;
  if (from.direction === "s") {
    position[0] = position[0] + 1;
  } else if (from.direction === "n") {
    position[0] = position[0] - 1;
  } else if (from.direction === "e") {
    position[1] = position[1] + 1;
  } else if (from.direction === "w") {
    position[1] = position[1] - 1;
  }

  const next = grid.get(`${position[0]},${position[1]}`);

  if (next) {
    let c = dirConnect[from.direction];
    let b = connectsWith[next.pipe];

    if (next.pipe === "end") {
      if (c === endDirection) {
        return {
          position: [position[0], position[1]],
          direction: endDirection,
          pipe: "end",
        };
      }
    }

    if (typeof c === "undefined") {
      throw new Error(
        JSON.stringify(from.direction) + " doesnt connect with anything"
      );
    }

    let a = [c];

    if (typeof b === "undefined") {
      throw new Error(JSON.stringify(next) + " doesnt connect with anything");
    }

    if (intersect(a, b).length === 1) {
      let direction = diff(a, b)[0];

      if (typeof direction === "undefined") {
        throw new Error("no direction found");
      }

      return {
        position: [position[0], position[1]],
        direction,
        pipe: next.pipe,
      };
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

gridEl.innerHTML = renderGrid(grid, nextTilePosition);
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
      upcomingPipes.unshift(getRandomItemFromArray(AVAILABLE_PIPES));
      if (!nextPipe) {
        throw new Error("no next pipe available");
      }
      const row = parseFloat(tile.dataset.row || "");
      const col = parseFloat(tile.dataset.col || "");
      let existingTile = grid.get(`${row},${col}`);
      // Don't allow replacing tiles that have been visited
      if (existingTile && existingTile.direction) {
        return;
      }
      grid.set(`${row},${col}`, { pipe: nextPipe });
      tile.outerHTML = renderPipe({ pipe: nextPipe }, row, col, false);
      upcomingEl.innerHTML = renderUpcomingPipes(upcomingPipes);
    }
  }
});

document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);

// Game loop!

let gameLoop: number;

function renderNextTile(nextTilePosition: string) {
  let [row, col] = nextTilePosition.split(",");
  let tile = document.querySelector(
    `div[data-row="${row}"][data-col="${col}"]`
  );
  let inGrid = grid.get(`${row},${col}`);

  if (tile !== null && inGrid) {
    tile.outerHTML = renderPipe(
      { ...inGrid },
      parseFloat(row || ""),
      parseFloat(col || ""),
      true
    );
  }
}

function panic() {
  gameLoop = window.setInterval(function () {
    if (next() && nextTilePosition) {
      renderNextTile(nextTilePosition);
    }
  }, 1000);
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
