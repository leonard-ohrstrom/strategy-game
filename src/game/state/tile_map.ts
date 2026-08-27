/**
 * Stores data and allows reading of all tiles on the map.
 */
import { RenderLogicManager } from "../../render/render_logic_manager";
import { readJSON } from "../../types/file_parser";
import { getRandomInteger } from "../../types/general_functions";
import { hexVectorDoubleToOffset, hexVectorOffsetToDouble } from "../../types/hexagons";
import { addVector, makeVector } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { godMenuSelectTile } from "../../scripts/god_menu";
import { CountryManager } from "./country_manager";

export class Tile {
    private terrain: string;
    private owner: string | null;
    private controller: string | null;
    private troops: number;

    constructor(terrain: string) {
        this.terrain = terrain;
        this.owner = null;
        this.controller = null;
        this.troops = 0;
    }

    public getTerrain(): string {
        return this.terrain;
    }

    public setTerrain(terrain: string): void {
        this.terrain = terrain;
    }

    public setTroops(amount: number): void {
        this.troops = amount;
    }

    public addTroop(): void {
        this.troops++;
    }

    public removeTroop(): void {
        if (this.troops <= 0) {
            this.troops = 0;
        } else {
            this.troops--;
        }
    }

    public getOwner(): string | null {
        return this.owner;
    }

    public setOwner(tag: string) {
        if (CountryManager.tag_valid(tag)) {
            this.owner = tag;
        } else {
            console.warn("Tile setOwner could not find tag", tag);
        }
    }

    public getController(): string | null {
        return this.controller;
    }

    public setController(tag: string) {
        if (CountryManager.tag_valid(tag)) {
            this.controller = tag;
        } else {
            console.warn("Tile setOwner could not find tag", tag);
        }
    }

    public isOccupied(): boolean {
        return this.controller !== this.owner;
    }
}

export class TileMapManager {
    private static tile_grid: Array<Array<Tile>>;
    private static width: number = 0;
    private static height: number = 0;
    private static selected_tile: Vector | null = null;

    public static makeGrid(width: number, height: number, terrain: string | undefined = undefined): void {
        this.tile_grid = [[]];
        this.width = width;
        this.height = height;
        for (let x = 0; x < width; x++) {
            this.tile_grid[x] = [];
            for (let y = 0; y < height; y++) {
                let tile_terrain: string | undefined = terrain;

                if (!tile_terrain) {
                    tile_terrain = getRandomTerrain();
                }

                this.tile_grid[x][y] = new Tile(tile_terrain);
            }
        }
    }

    public static async loadMapFile(): Promise<void> {
        const texture_grid: Array<Array<string>> = await readJSON("src/map/output/map.json");

        const texture_grid_width: number = texture_grid.length;
        const texture_grid_height: number = texture_grid[0].length;

        for (let x = 0; x < texture_grid_width; x++) {
            for (let y = 0; y < texture_grid_height; y++) {
                const tile_terrain: string = texture_grid[x][y];
                if (tile_terrain === "blank") {
                    texture_grid[x][y] = getRandomTerrain();
                }
            }
        }

        this.tile_grid = texture_grid.map(row => row.map(texture => new Tile(texture)));
        this.width = this.tile_grid.length;
        this.height = this.tile_grid[0].length;
    }

    public static readWidth(): number {
        return this.width
    }

    public static readHeight(): number {
        return this.height
    }

    public static readTile(x: number, y: number): Tile {
        try { return this.tile_grid[x][y] }
        catch (error) {
            console.error("tile_maps.ts ReadTile", x, y, "accessing error");
            return new Tile('');
        }
    }

    public static setTerrain(x: number, y: number, terrain: string): void {
        this.tile_grid[x][y].setTerrain(terrain);
    }

    public static setOwner(x: number, y: number, tag: string): void {
        this.tile_grid[x][y].setOwner(tag);
        this.setController(x, y, tag);
    }

    public static setController(x: number, y: number, tag: string): void {
        this.tile_grid[x][y].setController(tag);
    }

    public static positionExists(position: Vector): boolean {
        const x: number = position.x;
        const y: number = position.y;
        return (x >= 0 && y >= 0 && x < this.width && y < this.height);
    }

    /**
     * Returns the neighbouring tiles on the map of a given tile position.
     * @param tile_position tile position in offset format
     * @returns Array of Vectors representing all neighbours of the given tile on the map
     */
    public static getNeighbours(tile_position: Vector, condition: (tile_position: Vector) => boolean = () => true): Vector[] {
        const neighbours: Vector[] = [];

        const tile_position_double: Vector = tile_position;
        const north_east: Vector = makeVector(1, -1);
        const east: Vector = makeVector(2, 0);
        const south_east: Vector = makeVector(1, 1);
        const south_west: Vector = makeVector(-1, 1);
        const west: Vector = makeVector(-2, 0);
        const north_west: Vector = makeVector(-1, -1);
    
        const tile_NE: Vector = addVector(tile_position_double, north_east);
        const tile_E: Vector = addVector(tile_position_double, east);
        const tile_SE: Vector = addVector(tile_position_double, south_east);
        const tile_SW: Vector = addVector(tile_position_double, south_west);
        const tile_W: Vector = addVector(tile_position_double, west);
        const tile_NW: Vector = addVector(tile_position_double, north_west);

        const theoretical_neighbours: Vector[] = [tile_NE, tile_E, tile_SE, tile_SW, tile_W, tile_NW];

        theoretical_neighbours.forEach((position: Vector) => {
            position = hexVectorDoubleToOffset(position);
            if (TileMapManager.positionExists(position) && condition(position)) {
                neighbours.push(position);
            }
        });

        return neighbours;
    }

    public static getPath(start: Vector, end: Vector): Vector[] {
        start = hexVectorOffsetToDouble(start);
        end = hexVectorOffsetToDouble(end);

        const north_east: Vector = makeVector(1, -1);
        const east: Vector = makeVector(2, 0);
        const south_east: Vector = makeVector(1, 1);
        const south_west: Vector = makeVector(-1, 1);
        const west: Vector = makeVector(-2, 0);
        const north_west: Vector = makeVector(-1, -1);

        const start_is_end: boolean = start.x === end.x && start.y === end.y;
        const above: boolean = start.y > end.y;
        const below: boolean = start.y < end.y;
        const left: boolean = start.x > end.x;
        const right: boolean = start.x < end.x;

        
        if (start_is_end) {
            return [];
        } else if (above && right) {
            start = addVector(start, north_east);
        } else if (above) {
            start = addVector(start, north_west);
        } else if (below && left) {
            start = addVector(start, south_west);
        } else if (below) {
            start = addVector(start, south_east);
        } else if (right) {
            start = addVector(start, east);
        } else if (left) {
            start = addVector(start, west);
        } else {
            console.warn(`no path found from ${start} to ${end}`);
            return [];
        }

        start = hexVectorDoubleToOffset(start);
        end = hexVectorDoubleToOffset(end);
        const remaining_path = this.getPath(start, end); // might cause major memory issues lol should probably be recursive
        return [start].concat(remaining_path);
    }

    public static selectTile(): void {
        this.setSelectedTile(RenderLogicManager.tileOnMouse());
    }

    public static unselectTile(): void {
        this.setSelectedTile(null);
    }

    private static setSelectedTile(tile_pos: Vector | null): void {
        if (!tile_pos) {
            this.selected_tile = tile_pos;
            godMenuSelectTile(makeVector(0, 0));
        } else if (this.positionExists(tile_pos)) {
            this.selected_tile = tile_pos;
            godMenuSelectTile(tile_pos);
        } else {
            console.error("attempting to select tile", tile_pos, "which does not exist");
        }
    }

    public static getSelectedTile(): Vector | null {
        if (this.selected_tile) {
            return { ...this.selected_tile };
        } else {
            return null;
        }
    }
}

/**
 * Generates a random terrain type valid for tiles
 * @returns string of a randomly generated terrain type
 */
function getRandomTerrain(): string {
    const terrain_number: number = getRandomInteger(1, 2);
    switch (terrain_number) {
        case 1:
            return "plain";
        case 2:
            return "forest";
        default:
            console.error("GETRANDOMTERRAIN RANDOM INTEGER OUT OF RANGE");
            return ""
    }
}

/**
 * Tests if all TileMapManager functions work correctly.
 * @returns boolean representing if all tests passed
 */
export function testTileMapManager(): boolean {
    console.log("--- tileMapManager tests ---")
    TileMapManager.makeGrid(7, 3);

    function correctDimensions(): boolean {
        const correct_width: boolean = TileMapManager.readWidth() === 7;
        const correct_height: boolean = TileMapManager.readHeight() === 3;
        const correct_dimensions: boolean = correct_width && correct_height;
        console.log("correct dimensions:", correct_dimensions);
        return correct_dimensions;
    }

    function validPositions(): boolean {
        const valid_pos1: boolean = TileMapManager.positionExists(makeVector(0, 0));
        const valid_pos2: boolean = TileMapManager.positionExists(makeVector(6, 0));
        const valid_pos3: boolean = TileMapManager.positionExists(makeVector(6, 2));
        const valid_pos4: boolean = TileMapManager.positionExists(makeVector(0, 2));
        const valid_pos_exists: boolean = valid_pos1 && valid_pos2 && valid_pos3 && valid_pos4;
        console.log("valid positions exist:", valid_pos_exists);
        return valid_pos_exists;
    }

    function notInvalidPositions(): boolean {
        const invalid_pos1: boolean = TileMapManager.positionExists(makeVector(-1, 0));
        const invalid_pos2: boolean = TileMapManager.positionExists(makeVector(0, -1));
        const invalid_pos3: boolean = TileMapManager.positionExists(makeVector(7, 0));
        const invalid_pos4: boolean = TileMapManager.positionExists(makeVector(0, 3));
        const below_limit: boolean = invalid_pos1 || invalid_pos2;
        const above_limit: boolean = invalid_pos3 || invalid_pos4;
        const invalid_pos_not_exists: boolean = !below_limit && !above_limit;
        console.log("invalid positions do not exist:", invalid_pos_not_exists);
        return invalid_pos_not_exists;
    }
    return correctDimensions() && validPositions() && notInvalidPositions();
}