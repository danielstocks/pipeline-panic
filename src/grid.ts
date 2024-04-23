import { GRID_COLS, GRID_ROWS } from "./config";
import {
  intersect,
  diff,
  getRandomItemFromArray,
  getRandomIntegerBetween,
} from "./util";

export type position = [row: number, col: number];
export type Tile = [position, TileEntry];
export type SetupTile = [
  [row: number, col: number],
  {
    direction: Direction;
  }
];
export type TileEntry = {
  pipe: pipe;
  direction?: Direction | undefined;
  initialDirection?: Direction | undefined;
};
type Direction = "n" | "s" | "w" | "e";
type pipe = "c" | "ne" | "nw" | "sw" | "se" | "v" | "h" | "start" | "end";
const PLAYABLE_PIPES: pipe[] = ["c", "ne", "nw", "sw", "se", "v", "h"];
const directions = ["n", "e", "s", "w"] as const;

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
const pipeConnections: {
  [K in pipe]: Direction[];
} = {
  c: ["n", "e", "s", "w"],
  ne: ["n", "e"],
  nw: ["n", "w"],
  sw: ["s", "w"],
  se: ["s", "e"],
  h: ["e", "w"],
  v: ["n", "s"],
  start: [],
  end: [],
};

/*
 * A list of directions and what directions they
 * connec with. eg. South connects with north
 */
const oppositeDirections: { [K in Direction]: Direction } = {
  n: "s",
  s: "n",
  w: "e",
  e: "w",
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
  upcomingPipes: pipe[];

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

    this.#visit(startTile[0]);
    for (let tile of tiles) {
      this.set(tile[0], tile[1]);
    }

    this.upcomingPipes = [...Array(6).keys()].map(() => {
      return getRandomItemFromArray(PLAYABLE_PIPES);
    });
  }

  getUpcomingPipe(): pipe {
    let nextPipe = this.upcomingPipes.pop();
    if (!nextPipe) {
      throw new Error("no upcoming pipe could be found");
    }
    this.upcomingPipes.unshift(getRandomItemFromArray(PLAYABLE_PIPES));
    return nextPipe;
  }

  set(key: position, tile: TileEntry) {
    this.tileMap.set(`${key[0]},${key[1]}`, tile);
  }

  get(key: position) {
    return this.tileMap.get(`${key[0]},${key[1]}`);
  }

  #visit([row, col]: position) {
    this.visited.push([row, col]);
  }

  visitNextTile(): Tile | void {
    let nextTile = this.#getConnectingTile();
    if (nextTile) {
      this.set([nextTile[0][0], nextTile[0][1]], {
        ...nextTile[1],
      });
      this.#visit(nextTile[0]);
      return nextTile;
    }
  }

  /*
   * Returns the last visisted tile
   */
  #getLastVisitedTile(): Tile {
    let lastVisitedPosition = this.visited[this.visited.length - 1];
    if (lastVisitedPosition) {
      let lastVisitedTile = this.get(lastVisitedPosition);
      if (lastVisitedTile) {
        return [lastVisitedPosition, lastVisitedTile];
      }
    }
    // Should technically never happen since startTile is visited by default
    throw new Error("No last visited tile found");
  }

  /*
   * Takes one tile and see if it connects with another tile on the grid
   */
  #getConnectingTile(): Tile | void {
    let [position, { direction }] = this.#getLastVisitedTile();

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

    // If next tile exists, check wether it connects with the
    // current tile direciton
    if (nextTile) {
      let directionConnection = oppositeDirections[direction];

      // If next pipe is end, check if it connects, if yes, return it.
      if (nextTile.pipe === "end") {
        if (directionConnection === nextTile.direction) {
          return [[position[0], position[1]], nextTile];
        }
      }

      let pipeConnection = pipeConnections[nextTile.pipe];

      // Check if directionConnection and a pipeConnection intersects, eg. connects.
      if (intersect([directionConnection], pipeConnection).length === 1) {
        // Extract the non-intersecting direction to set the
        // directional flow of the next pipe
        let newDirection = diff([directionConnection], pipeConnection)[0];

        let initialDirection;

        // Intersection pipe, can be visited twice,
        // Keep track of the initial direction
        if (nextTile.pipe === "c") {
          // just get the opposiste direction
          newDirection = oppositeDirections[directionConnection];

          // Have we already crossed once?
          if (nextTile.direction) {
            initialDirection = newDirection;
          }
        }

        // We should be able to type this?
        if (!newDirection) {
          throw new Error("A direction for next tile could not be found");
        }

        return [
          [position[0], position[1]],
          {
            direction: newDirection,
            pipe: nextTile.pipe,
            initialDirection: initialDirection ? nextTile.direction : undefined,
          },
        ];
      }
    }
  }
}

/*
 * Creates initial tiles (start + end) to be placed in grid
 * in a randomized location. Makes sure they don't
 * face an impossible direction like facing an edge,
 * or facing eachother by ensuring a space of atleast
 * one empty tile inbetween
 */

function createInitialTiles({
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
