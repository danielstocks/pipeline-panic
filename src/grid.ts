import { SetupTile, createInitialTiles } from "./create-initial-tiles";

type position = [row: number, col: number];

export type Tile = [position, TileEntry];

export type TileEntry = {
  pipe: string;
  direction?: "n" | "s" | "w" | "e" | undefined;
};

/*
 *  A wrapper around a Map() that stores row & col
 *  as a serialized string in order for easy read/write
 *  but allows access passing an array [row, col]
 *
 *  Also contains logic around what tiles
 *  are visisted tiles.
 */
export class Grid {
  private tileMap: Map<string, TileEntry>;
  visited: [row: number, col: number][];

  startTile: Tile;
  endTile: Tile;

  constructor(start: SetupTile, end: SetupTile, tiles: Tile[]) {
    this.tileMap = new Map();
    const [startTile, endTile] = createInitialTiles({
      start,
      end,
    });

    this.startTile = startTile;
    this.endTile = endTile;
    this.set(...startTile);
    this.set(...endTile);

    this.visited = [];
    this.visit(startTile[0]);
    for (let tile of tiles) {
      this.set(tile[0], tile[1]);
    }
  }

  get tiles() {
    return this.tileMap.entries();
  }

  set(key: position, tile: TileEntry) {
    this.tileMap.set(`${key[0]},${key[1]}`, tile);
  }

  get(key: position) {
    return this.tileMap.get(`${key[0]},${key[1]}`);
  }

  visit([row, col]: position) {
    this.visited.push([row, col]);
  }

  getLastVisitedTile(): Tile {
    let lastVisitedPosition = this.visited[this.visited.length - 1];
    if (lastVisitedPosition) {
      let lastVisitedTile = this.get(lastVisitedPosition);
      if (lastVisitedTile) {
        return [lastVisitedPosition, lastVisitedTile];
      }
    }
    throw new Error("No last visited tile found");
  }
}
