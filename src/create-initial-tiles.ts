import { GRID_COLS, GRID_ROWS } from "./config";
import { getRandomIntegerBetween, getRandomItemFromArray } from "./util";

const directions = ["n", "e", "s", "w"] as const;

export type SetupTile = [
  [number, number],
  {
    direction: (typeof directions)[number];
  }
];

type Tile = [
  SetupTile[0],
  SetupTile[1] & {
    pipe: string;
  }
];

export function createInitialTiles({
  start,
  end,
}: {
  start?: SetupTile;
  end?: SetupTile;
} = {}): [Tile, Tile] {
  let startRow = start?.[0][0] || getRandomIntegerBetween(2, GRID_ROWS - 2);
  let startCol = start?.[0][1] || getRandomIntegerBetween(2, GRID_COLS - 2);
  let endRow = end?.[0][0] || startRow;
  let endCol = end?.[0][1] || startCol;

  const startDirection =
    start?.[1].direction || getRandomItemFromArray([...directions]);
  const endDirection =
    end?.[1].direction || getRandomItemFromArray([...directions]);

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

  const startTile: Tile = [
    [startRow, startCol],
    { pipe: "start", direction: startDirection },
  ];

  const endTile: Tile = [
    [endRow, endCol],
    { pipe: "end", direction: endDirection },
  ];

  return [startTile, endTile];
}
