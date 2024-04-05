import { bend, straight, short, cross } from "./pipes";
import { GRID_COLS, GRID_ROWS } from "./config";

export function renderUpcomingPipes(upcomingPipes: string[]) {
  return upcomingPipes
    .map((pipe) => {
      return `<div>
      ${pipe == "se" && bend}
      ${pipe == "v" && straight}
      ${pipe == "c" && cross}
      ${pipe == "ne" && `<div class="rotate-270">${bend}</div>`}  
      ${pipe == "nw" && `<div class="rotate-180">${bend}</div>`}
      ${pipe == "sw" && `<div class="rotate-90">${bend}</div>`}
      ${pipe == "h" && `<div class="rotate-90">${straight}</div>`}
      </div>`;
    })
    .join("");
}

function renderTile(
  row: number,
  col: number,
  children: string = "",
  className: string = ""
) {
  return `<div class="${
    className || "tile"
  }" data-row="${row}" data-col="${col}">${children}</div>`;
}

type tile = {
  pipe: string;
  direction?: string;
};

export function renderPipe(
  tile: tile,
  row: number,
  col: number,
  animate: boolean
) {
  let output = "";
  let fill = "";

  if (animate) {
    fill = "fill-pipe-animate";
  }

  switch (tile.pipe) {
    case "start":
      output += `<div class="start-tile">
      <div class="label">s</div>
      <div class="">${short}</div>
    </div>`;
      break;
    case "end":
      output += `<div>
        <div class="label">E</div>
        <div class="">${short}</div>
      </div>`;
      break;
    case "se":
      if (tile.direction == "e") {
        output += `<div class="flip-90">${bend}</div>`;
      } else {
        output += bend;
      }
      break;
    case "ne":
      if (tile.direction === "n") {
        output += `<div class="flip-180">${bend}</div>`;
      } else {
        output += `<div class="rotate-270">${bend}</div>`;
      }
      break;
    case "nw":
      if (tile.direction === "w") {
        output += `<div class="flip-270">${bend}</div>`;
      } else {
        output += `<div class="rotate-180">${bend}</div>`;
      }
      break;
    case "sw":
      if (tile.direction === "s") {
        output += `<div class="flip">${bend}</div>`;
      } else {
        output += `<div class="rotate-90">${bend}</div>`;
      }
      break;
    case "v":
      if (tile.direction === "n") {
        output += `<div class="rotate-180">${straight}</div>`;
      } else {
        output += straight;
      }
      break;
    case "h":
      if (tile.direction === "e") {
        output += `<div class="rotate-270">${straight}</div>`;
      } else {
        output += `<div class="rotate-90">${straight}</div>`;
      }
      break;
    case "c":
      output += cross;
      break;
  }

  return renderTile(row, col, output, fill);
}

export function renderGrid(
  grid: Map<string, tile>,
  nextTilePosition: string | undefined
) {
  let gridOutput = "";

  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    let row = Math.floor(i / GRID_COLS);
    let col = i % GRID_COLS;
    let tile = grid.get(`${row},${col}`);

    if (typeof tile === "undefined") {
      gridOutput += renderTile(row, col);
    } else {
      let animate = nextTilePosition == `${row},${col}`;
      gridOutput += renderPipe(tile, row, col, animate);
    }
  }

  return gridOutput;
}
