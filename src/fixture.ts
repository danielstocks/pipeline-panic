import { Tile } from "./grid";
import { SetupTile } from "./create-initial-tiles";

export const fixtureTiles: Tile[] = [
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
];

export const fixtureStart: SetupTile = [
  [2, 1],
  {
    direction: "s",
  },
];

export const fixtureEnd: SetupTile = [[3, 3], { direction: "e" }];
