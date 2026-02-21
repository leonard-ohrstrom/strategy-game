import { RenderManager } from "../rendering/render.ts";
import { type Vector, type Rectangle, makeVector, getRandomInteger } from "../types/types.ts"

class Tile {
    private terrain: string;
    private texture: string = "";
    troops: number = 0;
    private selected: boolean = false;
    constructor(terrain: string) {
        this.terrain = terrain;
    }
    getTerrain(): string {
        return this.terrain;
    }
    getTexture(): string {
        const terrain = this.terrain;
        switch(terrain) {
            case "plain": {
                this.texture = "./textures/hexagon_camo_pattern1.png";
                break;
            }
            case "forest": {
                this.texture = "./textures/hexagon_camo_pattern2.png";
                break;
            }
            case "water": {
                this.texture = "./textures/hexagon_camo_pattern3.png";
                break;
            }
            case "mountain": {
                this.texture = "./textures/hexagon_camo_pattern4.png";
                break;
            }
            default: {
                this.texture = "./textures/hexagon.png";
            }
        }
        return this.texture;
    }
    selectTile(): void {
        this.selected = !this.selected; // flip boolean, ie select/unselect
    }
    isSelected(): boolean {
        return this.selected;
    }
}

export class GameMap {
    private static tile_grid: Array<Array<Tile>> = [[]];
    private static horizontal_tiles: number = 0;
    private static vertical_tiles: number = 0;
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
    // returns tile at position (x, y) on Map
    static readTile(x: number, y: number): Tile {
        const tile = GameMap.tile_grid[x][y]
        return tile;
    }
    static addTroopToTile(x: number, y: number): void {
        if (x > this.horizontal_tiles - 1 || y > this.vertical_tiles - 1) {
            console.log("ERROR: add_troop_to_tile out of grid", x, y);
        } else {
            const tile = GameMap.tile_grid[x][y];
            tile.troops++;
        }
    }

    static selectTile(x: number, y: number): void {
        if (x > this.horizontal_tiles - 1 || y > this.vertical_tiles - 1) {
            console.log("ERROR: select_tile out of grid", x, y);
        } else {
            const tile = GameMap.tile_grid[x][y]
            tile.selectTile();
        }
    }

    // sends instructions to draw map to drawer
    static drawMap(x_offset: number = 0, y_offset: number = 0, scale_factor: number = 1): void {
        const image_dimensions: Rectangle = {
            width: 1000,
            height: 1115,
            position: makeVector(0, 0)
        };

        for (let x = 0; x < GameMap.horizontal_tiles; x++) {
             for (let y = 0; y < GameMap.vertical_tiles; y++) {
                const tile = GameMap.readTile(x, y);

                const target_width = 1000 * scale_factor;
                const target_height = 1115 * scale_factor;

                let target_dimensions: Rectangle = {
                    width: target_width,
                    height: target_height,
                    position: makeVector(
                        x * target_width + x_offset,
                        y * target_height * 0.75 + y_offset
                    )
                };

                if (y % 2 === 1) {
                    // (for testing to differentiate odd and even tiles)
                    // tile.texture = "./textures/hexagon.png";
                    target_dimensions.position = makeVector(
                        x * target_width + target_width * 0.5 + x_offset, 
                        y * target_height * 0.75 + y_offset
                    );
                } else {}

                RenderManager.enqueueRender(tile.getTexture(), image_dimensions, target_dimensions);

                if (tile.troops === 0) {} else { /// to do: seperate function
                    const troop_texture: string = "./textures/division.png";
                    RenderManager.enqueueRender(troop_texture, image_dimensions, target_dimensions);
                    const number_texture = (tile.troops === 1)
                                         ? "./textures/number1.png"
                                         : (tile.troops === 2)
                                         ? "./textures/number2.png"
                                         : (tile.troops === 3)
                                         ? "./textures/number3.png"
                                         : (tile.troops === 4)
                                         ? "./textures/number4.png"
                                         : (tile.troops === 5)
                                         ? "./textures/number5.png"
                                         : (tile.troops === 6)
                                         ? "./textures/number6.png"
                                         : (tile.troops === 7)
                                         ? "./textures/number7.png"
                                         : (tile.troops === 8)
                                         ? "./textures/number8.png"
                                         : (tile.troops === 9)
                                         ? "./textures/number9.png"
                                         // (tile.troops > 9)
                                         : "./textures/number9plus.png"
                    RenderManager.enqueueRender(number_texture, image_dimensions, target_dimensions)
                }

                if (tile.isSelected()) {
                    const selected_texture: string = "./textures/hexagon_selection_outline2.png";
                    RenderManager.enqueueRender(selected_texture, image_dimensions, target_dimensions);
                }
            }
        }
    }
}