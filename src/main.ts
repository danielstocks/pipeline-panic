// TODO: prevent "visited pipes" from being changed
// TODO: End/start tile direction
// TODO "winning condition"
// TODO "Intersection pipes"
// TODO: "How to test?"
// TODO: "blank game state"
// TODO: 10 second timer to game start
// TODO: Score
// TODO: Resume/pause game on tab focus/blur

import "./style.css";
import { renderGrid, renderPipe, renderUpcomingPipes } from "./render";
import { AVAILABLE_PIPES, GRID_COLS, GRID_ROWS } from "./config";
import {
  getRandomItemFromArray,
  getRandomIntegerBetween,
  intersect,
  diff,
} from "./util";

// Initialize game state
const upcomingPipes = [...Array(6).keys()].map(() => {
  return getRandomItemFromArray(AVAILABLE_PIPES);
});

/*
  let startRow = getRandomIntegerBetween(2, GRID_ROWS - 2);
  let startCol = getRandomIntegerBetween(2, GRID_COLS - 2);
  let endRow = startRow;
  let endCol = startCol;
*/

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

let startRow = 1;
let startCol = 1;
let endRow = 3;
let endCol = 2;

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

/*
  const startDirection = getRandomItemFromArray(["s", "w", "n", "e"]);
  const endDirection = getRandomItemFromArray(["s", "w", "n", "e"]);
*/
const startDirection = "s";
const endDirection = "n";

type tile = {
  pipe: string;
  direction?: string;
};

type tileWithPosition = tile & {
  position: [number, number];
  direction: string;
};

const startTile: [string, tile] = [
  "1,1",
  { pipe: "start", direction: startDirection },
];

// const grid = new Map();
const grid = new Map<string, tile>([
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

const visitedTiles: tileWithPosition[] = [
  {
    position: [startRow, startCol],
    direction: startDirection,
    ...startTile[1],
  },
];

var i = 0;
let nextTilePosition: string | undefined;

function next(): boolean {
  i++;

  if (i > visitedTiles.length) {
    window.clearInterval(gameLoop);
    // alert("__ G A M E ___ O V E R ___");
    return false;
  }

  let nextTile = visitedTiles[visitedTiles.length - 1];

  nextTilePosition = nextTile?.position.join(",");

  if (typeof nextTile !== "undefined") {
    let inGrid = grid.get(`${nextTile.position[0]},${nextTile.position[1]}`);

    if (typeof inGrid !== "undefined") {
      grid.set(`${nextTile.position[0]},${nextTile.position[1]}`, {
        ...inGrid,
        direction: nextTile.direction,
      });
    }
    let connectingTile = getConnectingTile(nextTile, grid);

    if (connectingTile) {
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

    if (typeof c === "undefined") {
      throw new Error(from.direction + " doesnt connect with anything");
    }

    let a = [c];

    if (typeof b === "undefined") {
      throw new Error(next + " doesnt connect with anything");
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

if (gridEl === null) {
  throw new Error("Cannot find <div id='grid'>");
}

if (upcomingEl === null) {
  throw new Error("Cannot find <div id='upcoming-pipes'>");
}

gridEl.innerHTML = renderGrid(grid, nextTilePosition);
upcomingEl.innerHTML = renderUpcomingPipes(upcomingPipes);

gridEl.addEventListener("click", function (event) {
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
      grid.set(`${row},${col}`, { pipe: nextPipe });
      tile.outerHTML = renderPipe({ pipe: nextPipe }, row, col, false);
      upcomingEl.innerHTML = renderUpcomingPipes(upcomingPipes);
    }
  }
});

document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);

// Game loop!
let gameLoop = window.setInterval(function () {
  if (next() && nextTilePosition) {
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
}, 1000);
