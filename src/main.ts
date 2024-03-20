// # TODO: Refactor/Cleanup v0.1

import "./style.css";

import { bend, straight, short, cross } from "./pipes";

const GRID_COLS = 8;
const GRID_ROWS = 5;

function getRandomItemFromArray(array: string[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomIntegerBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const availablePipes = ["h", "v", "ne", "nw", "se", "sw", "c"];

const upcomingPipes = [...Array(6).keys()].map(() => {
  return getRandomItemFromArray(availablePipes);
});

const startingDirection = getRandomItemFromArray(["s", "w", "n", "e"]);
const endingDirection = getRandomItemFromArray(["s", "w", "n", "e"]);

const angles: {
  [key: string]: number;
} = {
  s: 0,
  w: 90,
  n: 180,
  e: 270,
};

let startRow = getRandomIntegerBetween(2, GRID_ROWS - 2);
let startCol = getRandomIntegerBetween(2, GRID_COLS - 2);
const start: [string, string] = [`${startRow},${startCol}`, "start"];

// # TODO: implement end tile
// 1. Pick random position (but not on edges, on or adjacent to starting tile)
// if start row = 2, col=3
// Forbidden tiles: 1:234 ,2:234, 3:234
let endRow = 0;
let endCol = 0;

//while([ startRow  endRow )
const end: [string, string] = [`${endRow},${endCol}`, "end"];

// # TODO: prevent start & end pipes from being replaced
const grid = new Map([start, end]);

function renderUpcomingPipes() {
  return upcomingPipes
    .map((pipe) => {
      return `<div>
    ${(pipe == "se" && bend) || ""}
    ${(pipe == "ne" && `<div class="rotate-270">${bend}</div>`) || ""}  
    ${(pipe == "nw" && `<div class="rotate-180">${bend}</div>`) || ""}
    ${(pipe == "sw" && `<div class="rotate-90">${bend}</div>`) || ""}
    ${(pipe == "v" && straight) || ""}
    ${(pipe == "h" && `<div class="rotate-90">${straight}</div>`) || ""}
    ${(pipe == "c" && cross) || ""}
    </div>`;
    })
    .join("");
}

function renderGrid() {
  let gridOutput = "";

  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    let row = Math.floor(i / GRID_COLS);
    let col = i % GRID_COLS;
    let pipe = grid.get(`${row},${col}`) || "";

    gridOutput += `<div class="tile" data-row="${row}" data-col="${col}">
    ${(pipe == "se" && bend) || ""}
    ${(pipe == "ne" && `<div class="rotate-270">${bend}</div>`) || ""}  
    ${(pipe == "nw" && `<div class="rotate-180">${bend}</div>`) || ""}
    ${(pipe == "sw" && `<div class="rotate-90">${bend}</div>`) || ""}
    ${(pipe == "v" && straight) || ""}
    ${(pipe == "h" && `<div class="rotate-90">${straight}</div>`) || ""}
    ${(pipe == "c" && cross) || ""}

    ${
      (pipe == "start" &&
        `<div class="label">S</div>
        <div class="rotate-${angles[startingDirection]}">${short}</div>`) ||
      ""
    }

    ${
      (pipe == "end" &&
        `<div class="label">E</div>
        <div class="rotate-${angles[endingDirection]}">${short}</div>`) ||
      ""
    }

  </div>
  `;
  }

  return gridOutput;
}

const gridEl = document.querySelector<HTMLDivElement>("#grid");
const upcomingEl = document.querySelector<HTMLDivElement>("#upcoming-pipes");

if (gridEl === null) {
  throw new Error("Cannot find <div id='grid'>");
}
if (upcomingEl === null) {
  throw new Error("Cannot find <div id='upcoming-pipes'>");
}

gridEl.innerHTML = renderGrid();
upcomingEl.innerHTML = renderUpcomingPipes();

gridEl.addEventListener("click", function (event) {
  const target = event.target;

  if (target instanceof HTMLElement || target instanceof SVGElement) {
    const tile = target.closest(".tile");

    let nextPipe = upcomingPipes.pop();
    upcomingPipes.unshift(getRandomItemFromArray(availablePipes));

    if (!nextPipe) {
      throw new Error("no next pipe available");
    }

    if (tile instanceof HTMLElement) {
      const row = tile.dataset.row;
      const col = tile.dataset.col;

      grid.set(`${row},${col}`, nextPipe);

      gridEl.innerHTML = renderGrid();

      upcomingEl.innerHTML = renderUpcomingPipes();
    }
  }
});

document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);
