import { describe, expect, test, beforeAll } from "bun:test";
import { Grid } from "./grid";
import { fixtureStart, fixtureEnd, fixtureTiles } from "./fixture";

describe("Grid", () => {
  describe("constructor", () => {
    describe("no args", () => {
      let grid: Grid;

      beforeAll(() => {
        grid = new Grid();
      });

      test("sets a start tile", () => {
        expect(grid.startTile[1].pipe).toBe("start");
      });

      test("sets an end tile", () => {
        expect(grid.endTile[1].pipe).toBe("end");
      });

      test("visits the start tile", () => {
        let [row, col] = grid.startTile[0];
        expect(grid.visited.length).toBe(1);
        expect(grid.visited[0]).toEqual([row, col]);
      });

      test("creates 6 upcoming pipes", () => {
        expect(grid.upcomingPipes.length).toBe(6);
      });

      /*
      // TODO: test custom start/end tiles
      describe("with custom start & end tiles", () => {
        let grid: Grid;

        beforeAll(() => {
          grid = new Grid();
        });
      });
      */
    });

    describe("Upcoming pipes", () => {
      test("get upcoming pipe", () => {
        let grid = new Grid();
        let nextPipe = grid.upcomingPipes[grid.upcomingPipes.length - 1]!;
        expect(grid.getUpcomingPipe()).toEqual(nextPipe);
      });
    });

    describe("set and get tiles", () => {
      let grid: Grid;

      beforeAll(() => {
        grid = new Grid();
      });

      test("set pipe", () => {
        grid.set([1, 1], { pipe: "c" });
      });

      test("get pipe", () => {
        let tile = grid.get([1, 1]);
        expect(tile?.pipe).toBe("c");
      });
    });

    describe("vist next tile", () => {
      test("no tile in next position", () => {
        let grid = new Grid();
        expect(grid.visitNextTile()).toBe(undefined);
      });

      test("tile in next position that connects", () => {
        let grid = new Grid(fixtureStart, fixtureEnd, fixtureTiles);
        expect(grid.visitNextTile()).toEqual([
          [3, 1],
          {
            direction: "s",
            pipe: "c",
            initialDirection: undefined,
          },
        ]);
      });

      test("tile in next position but no connection", () => {
        let grid = new Grid(fixtureStart, fixtureEnd);
        expect(grid.visitNextTile()).toBe(undefined);
      });

      // TODO: Test intersection tile condition
      // TODO: Test end tile condition
    });
  });
});
