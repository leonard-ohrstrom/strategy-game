import { RenderManager } from "../rendering/renderold.ts";
import { type Rectangle, makeVector, getRandomInteger } from "../types/typesold.ts"
import { Tile } from "./tileold.ts";
import { renderTroops } from "./mapHelpersold.ts";

export class GameMap {
    private static tile_grid: Array<Array<Tile>> = [[]];
    private static horizontal_tiles: number = 0;
    private static vertical_tiles: number = 0;
    static map_centre = makeVector(0, 0);

    // constructs a grid of size width x height
    static constructGrid(width: number, height: number): void {
        GameMap.horizontal_tiles = width;
        GameMap.vertical_tiles = height;
        for (let x = 0; x < width; x++) {
            GameMap.tile_grid[x] = [];
            for (let y = 0; y < height; y++) {
                const randomNum = getRandomInteger(1, 10);
                GameMap.tile_grid[x][y] = (randomNum <= 4)
                                        ? new Tile("plain")
                                        : (randomNum <= 8)
                                        ? new Tile("forest")
                                        : (randomNum <= 9)
                                        ? new Tile("water")
                                        : (randomNum <= 10)
                                        ? new Tile("mountain")
                                        : new Tile("empty");
            }
        }
    }
    // returns tile at position (x, y) on map
    static readTile(x: number, y: number): Tile {
        const tile = GameMap.tile_grid[x][y]
        return tile;
    }

    // adds troop to tile at position (x, y) on map
    static addTroopToTile(x: number, y: number, amount: number = 1): void {
        const x_within_bounds: boolean = (x > 0 && x < this.horizontal_tiles - 1)
        const y_within_bounds: boolean = (y > 0 && x < this.vertical_tiles - 1)

        if (x_within_bounds && y_within_bounds) {
            const tile = GameMap.tile_grid[x][y];
            tile.addTroops(amount);
        } else {
            console.log("ERROR: add_troop_to_tile out of grid", x, y);
        }
    }

    // toggles selection for tile at position (x, y) on map
    static selectTile(x: number, y: number): void {
        if (x > this.horizontal_tiles - 1 || y > this.vertical_tiles - 1) {
            console.log("ERROR: select_tile out of grid", x, y);
        } else {
            const tile = GameMap.tile_grid[x][y]
            tile.selectTile();
        }
    }

    // sends instructions for drawing GameMap to RenderManager
    static drawMap(x_offset: number = 0, y_offset: number = 0, scale_factor: number = 1): void {
        const image_dimensions: Rectangle = {
            width: 1000,
            height: 1115,
            position: makeVector(0, 0)
        };

        GameMap.map_centre = makeVector(
            image_dimensions.width * scale_factor * GameMap.horizontal_tiles  + x_offset,
            image_dimensions.height * scale_factor * GameMap.vertical_tiles + y_offset
        );

        for (let x = 0; x < GameMap.horizontal_tiles; x++) {
             for (let y = 0; y < GameMap.vertical_tiles; y++) {
                const tile = GameMap.readTile(x, y);
                const troops = tile.getTroopCount();

                const target_width = image_dimensions.width * scale_factor;
                const target_height = image_dimensions.height * scale_factor;

                let target_dimensions: Rectangle = {
                    width: target_width,
                    height: target_height,
                    position: makeVector(
                        x * target_width + x_offset,
                        y * target_height * 0.75 + y_offset
                    )
                };

                if (y % 2 === 1) {
                    target_dimensions.position = makeVector(
                        x * target_width + target_width * 0.5 + x_offset, 
                        y * target_height * 0.75 + y_offset
                    );
                } else {}

                RenderManager.enqueueRender(tile.getTerrainTexture(), image_dimensions, target_dimensions);

                renderTroops(troops, target_dimensions);

                if (tile.isSelected()) {
                    const selected_texture: string = "./textures/hexagon_selection_outline2.png";
                    RenderManager.enqueueRender(selected_texture, image_dimensions, target_dimensions);
                } else {}
            }
        }
    }
}