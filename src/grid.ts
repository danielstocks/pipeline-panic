export type Tile = [[number, number], TileEntry];

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
  visited: [number, number][];

  constructor(tiles: Tile[]) {
    this.tileMap = new Map();
    this.visited = [];
    for (let tile of tiles) {
      this.set(tile[0], tile[1]);
    }
  }

  get tiles() {
    return this.tileMap.entries();
  }

  set(key: [number, number], tile: TileEntry) {
    this.tileMap.set(`${key[0]},${key[1]}`, tile);
  }

  get(key: [number, number]) {
    return this.tileMap.get(`${key[0]},${key[1]}`);
  }

  visit([row, col]: [number, number]) {
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
