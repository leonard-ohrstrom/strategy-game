/**
 * Stores data and allows reading of all tiles on the map.
 */
import { makeTile } from "../../types/type_constructors";
import type { Tile } from "../../types/types";

export class TileMapManager {
    private static tile_grid: Array<Array<Tile>>;
    private static width: number;
    private static height: number;
    static makeGrid(width: number, height: number): void {
        this.tile_grid = [[]];
        this.width = width;
        this.height = height;
        for (let x = 0; x < width; x++) {
            this.tile_grid[x] = [];
            for (let y = 0; y < height; y++) {
                this.tile_grid[x][y] = makeTile();
            }
        }
    }
    static readWidth(): number { return this.width }
    static readHeight(): number { return this.height }
    static readTile(x: number, y: number): Tile {
        try { return this.tile_grid[x][y] }
        catch (error) {
            console.error("tile_maps.ts ReadTile", x, y, "accessing error");
            return makeTile();
        }
    }
}