import { SetupTile, createInitialTiles } from "./create-initial-tiles";
import { intersect, diff, getRandomItemFromArray } from "./util";

export type position = [row: number, col: number];

export type Tile = [position, TileEntry];

export type TileEntry = {
  pipe: string;
  direction?: "n" | "s" | "w" | "e" | undefined;
};

/*
 * A map of available pipes and which directions
 * they can connect with
 *
 * h = horizontal
 * v = vertical
 * c = cross
 * ne = north-east
 * ...
 */
export const pipes: {
  [key: string]: ("n" | "e" | "s" | "w")[];
} = {
  c: ["n", "e", "s", "w"],
  ne: ["n", "e"],
  nw: ["n", "w"],
  sw: ["s", "w"],
  se: ["s", "e"],
  h: ["e", "w"],
  v: ["n", "s"],
};

/*
 * A list of directions and what directions they
 * connec with. eg. South connects with north
 */
const directionConnectionMap: {
  [key: string]: "n" | "e" | "s" | "w";
} = {
  s: "n",
  n: "s",
  e: "w",
  w: "e",
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
  upcomingPipes: string[];

  constructor(start?: SetupTile, end?: SetupTile, tiles: Tile[] = []) {
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

    this.upcomingPipes = [...Array(6).keys()].map(() => {
      return getRandomItemFromArray(Object.keys(pipes));
    });
  }

  get tiles() {
    return this.tileMap.entries();
  }

  getUpcomingPipe() {
    let nextPipe = this.upcomingPipes.pop();
    if (!nextPipe) {
      throw new Error("no upcoming pipe could be found");
    }
    this.upcomingPipes.unshift(getRandomItemFromArray(Object.keys(pipes)));
    return nextPipe;
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

  /*
   * Takes one tile and see if it connects with another tile on the grid
   */
  getConnectingTile(): Tile | void {
    let [position, { direction }] = this.getLastVisitedTile();

    // Shift position based on direction
    if (direction === "s") {
      position[0] = position[0] + 1;
    } else if (direction === "n") {
      position[0] = position[0] - 1;
    } else if (direction === "e") {
      position[1] = position[1] + 1;
    } else if (direction === "w") {
      position[1] = position[1] - 1;
    } else if (!direction) {
      throw new Error("No direction on visited tile found");
    }

    // Attempt to retrieve tile in shifted position
    const nextTile = this.get([position[0], position[1]]);

    // if next tile exists, check wether it connects with the
    // current tile direciton
    if (nextTile) {
      let directionConnection = directionConnectionMap[direction];
      if (!directionConnection) {
        // TODO: if end pipe is reached here it will throw an error if it doenst connect
        throw new Error(direction + " direction has no connection");
      }

      // If next pipe is end, check if it connects, if yes, return it.
      if (nextTile.pipe === "end") {
        if (directionConnection === nextTile.direction) {
          return [[position[0], position[1]], nextTile];
        }
      }

      let pipeConnection = pipes[nextTile.pipe];
      if (!pipeConnection) {
        throw new Error(nextTile.pipe + " pipe has no connection");
      }

      // Check if directionConnection and a pipeConnection intersects, eg. connects.
      if (intersect([directionConnection], pipeConnection).length === 1) {
        // Extract the non-intersecting direction to set the
        // directional flow of the next pipe
        let newDirection = diff([directionConnection], pipeConnection)[0];
        if (!newDirection) {
          throw new Error("A direction for next tile could not be found");
        }

        return [
          [position[0], position[1]],
          {
            direction: newDirection,
            pipe: nextTile.pipe,
          },
        ];
      }
    }
  }
}
