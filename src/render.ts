import { bend, straight, short, cross } from "./pipes";
import { GRID_COLS, GRID_ROWS } from "./config";
import { getRandomItemFromArray } from "./util";

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

export function renderUpcomingPipes({
  upcomingPipes,
}: {
  upcomingPipes: string[];
}) {
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

export function renderGrid({
  grid,
  startCol,
  startRow,
  endCol,
  endRow,
}: {
  grid: Map<any, any>;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}) {
  let gridOutput = "";

  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    let row = Math.floor(i / GRID_COLS);
    let col = i % GRID_COLS;
    let pipe = grid.get(`${row},${col}`) || "";

    let isStart = startRow == row && startCol == col;
    let isEnd = endRow == row && endCol == col;

    if (isStart) {
      gridOutput += `<div>
          <div class="label">S</div>
          <div class="rotate-${angles[startingDirection]}">${short}</div>
        </div>`;
    } else if (isEnd) {
      gridOutput += `<div>
          <div class="label">E</div>
          <div class="rotate-${angles[endingDirection]}">${short}</div>
        </div>`;
    } else {
      gridOutput += `<div class="tile" data-row="${row}" data-col="${col}">
      ${(pipe == "se" && bend) || ""}
      ${(pipe == "ne" && `<div class="rotate-270">${bend}</div>`) || ""}  
      ${(pipe == "nw" && `<div class="rotate-180">${bend}</div>`) || ""}
      ${(pipe == "sw" && `<div class="rotate-90">${bend}</div>`) || ""}
      ${(pipe == "v" && straight) || ""}
      ${(pipe == "h" && `<div class="rotate-90">${straight}</div>`) || ""}
      ${(pipe == "c" && cross) || ""}
    
    </div>
    `;
    }
  }

  return gridOutput;
}
