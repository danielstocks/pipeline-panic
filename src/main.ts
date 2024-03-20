// # TODO: Unit tests
import "./style.css";
import { renderGrid, renderUpcomingPipes } from "./render";
import { AVAILABLE_PIPES, GRID_COLS, GRID_ROWS } from "./config";
import { getRandomItemFromArray, getRandomIntegerBetween } from "./util";

// Initialize game state
const upcomingPipes = [...Array(6).keys()].map(() => {
  return getRandomItemFromArray(AVAILABLE_PIPES);
});

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

const grid = new Map();

const state = {
  grid,
  upcomingPipes,
  startRow,
  startCol,
  endRow,
  endCol,
};

// Initial Game Render
const gridEl = document.querySelector<HTMLDivElement>("#grid");
const upcomingEl = document.querySelector<HTMLDivElement>("#upcoming-pipes");

if (gridEl === null) {
  throw new Error("Cannot find <div id='grid'>");
}
if (upcomingEl === null) {
  throw new Error("Cannot find <div id='upcoming-pipes'>");
}

gridEl.innerHTML = renderGrid(state);
upcomingEl.innerHTML = renderUpcomingPipes(state);

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
      const row = tile.dataset.row;
      const col = tile.dataset.col;
      grid.set(`${row},${col}`, nextPipe);
      gridEl.innerHTML = renderGrid(state);
      upcomingEl.innerHTML = renderUpcomingPipes(state);
    }
  }
});

document.documentElement.style.setProperty("--num-cols", `${GRID_COLS}`);
