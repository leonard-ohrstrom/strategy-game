import { drawSVG } from "../rendering/draw";
import { type Vector, type Rectangle } from '../types/types.ts'

class Tile {}

export class Map {
    private static tile_grid: Array<Array<Tile>> = [[]];
    private static horizontal_tiles: number = 0;
    private static vertical_tiles: number = 0;
    // constructs a grid of size width x height
    static construct_grid(width: number, height: number) {
        Map.horizontal_tiles = width;
        Map.vertical_tiles = height;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                Map.tile_grid[x][y] = new Tile;
            }
        }
    }
    // returns tile at position (x, y) on Map
    static access_tile(x: number, y: number): Tile {
        return Map.tile_grid[x][y];
    }
    // draws map
    static draw_map(): void {
        // for (let x = 0; x < Map.horizontal_tiles; x++) {
        //     for (let y = 0; y < Map.vertical_tiles; y++) {
        //         drawSVG();
        //     }
        // }
        drawSVG('./textures/hexagon.svg');
    }
}