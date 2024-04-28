import { Tile, SetupTile } from "./grid";

export const fixtureTiles: Tile[] = [
  [[3, 1], { pipe: "c" }],
  [[4, 1], { pipe: "ne" }],
  [[4, 2], { pipe: "nw" }],
  [[3, 2], { pipe: "c" }],
  [[2, 2], { pipe: "se" }],
  [[2, 4], { pipe: "nw" }],
  [[1, 4], { pipe: "sw" }],
  [[1, 3], { pipe: "se" }],
  [[2, 3], { pipe: "c" }],
  [[3, 3], { pipe: "c" }],
  [[4, 3], { pipe: "ne" }],
  [[4, 4], { pipe: "nw" }],
  [[3, 4], { pipe: "sw" }],
];

export const fixtureStart: SetupTile = [
  [2, 1],
  {
    direction: "s",
  },
];

export const fixtureEnd: SetupTile = [[5, 1], { direction: "w" }];
