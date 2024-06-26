import { bend, straight, short, shortEnd, cross } from "./pipes";
import { GRID_COLS, GRID_ROWS } from "./config";
import { Grid, Tile, TileEntry } from "./grid";

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

export function animateTile(tile: Tile) {
  let [row, col] = tile[0];
  let tileEl = document.querySelector(
    `div[data-row="${row}"][data-col="${col}"]`
  );
  if (tileEl !== null) {
    tileEl.outerHTML = renderPipe(tile[1], row, col, true);
  }
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

export function renderPipe(
  tile: TileEntry,
  row: number,
  col: number,
  animate: boolean
) {
  let output = "";
  let fill = "";

  switch (tile.pipe) {
    case "start":
      fill = "short";
      output += `<div class="start-tile ${tile.direction}">
      <div class="label">S</div>
      <div class="svg">${short}</div>
    </div>`;
      break;
    case "end":
      fill = "short";
      output += `<div class="end-tile ${tile.direction}">
        <div class="label">E</div>
        <div class="svg">${shortEnd}</div>
      </div>`;
      break;
    case "se":
      if (tile.direction == "e") {
        output += `<div class="flip-90">${bend}</div>`;
      } else {
        output += `<div>${bend}</div>`;
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
        output += `<div>${straight}</div>`;
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
      if (tile.direction === "n") {
        output += `
        <div class="rotate-180 on-top vertical">${straight}</div>
        <div class="rotate-90 horizontal ${
          tile.initialDirection && "already-visisted"
        }">${straight}</div>
      `;
      } else if (tile.direction == "s") {
        output += `
        <div class="on-top vertical ">${straight}</div>
        <div class="rotate-90 horizontal ${
          tile.initialDirection && "already-visisted"
        }">${straight}</div>
      `;
      } else if (tile.direction == "w") {
        output += `
        <div class="rotate-90 horizontal">${straight}</div>
        <div class="on-top vertical ${
          tile.initialDirection && "already-visisted"
        }">${straight}</div>
      `;
      } else if (tile.direction == "e") {
        output += `
        <div class="rotate-270 horizontal">${straight}</div>
        <div class="on-top vertical ${
          tile.initialDirection && "already-visisted"
        }">${straight}</div>
      `;
      } else {
        output += `
        <div class="rotate-180 on-top vertical">${straight}</div>
        <div class="rotate-90 horizontal">${straight}</div>
      `;
      }

      break;
  }

  if (animate) {
    fill = "fill-pipe-animate";
  }

  return renderTile(row, col, output, fill);
}

export function renderGrid(tiles: Grid) {
  let gridOutput = "";

  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    let row = Math.floor(i / GRID_COLS);
    let col = i % GRID_COLS;
    let tile = tiles.get([row, col]);

    if (typeof tile === "undefined") {
      gridOutput += renderTile(row, col);
    } else {
      gridOutput += renderPipe(tile, row, col, false);
    }
  }

  return gridOutput;
}
