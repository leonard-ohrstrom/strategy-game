/**
 * Stores data and allows reading of all tiles on the map.
 */
import { RenderLogicManager } from "../../render/render_logic_manager";
import { readJSON } from "../../types/file_parser";
import { hexVectorDoubleToOffset, hexVectorOffsetToDouble } from "../../types/hexagons";
import { vectorAdd, vectorMake, vectorEquals, vectorToString } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { godMenuSelectTile } from "../../scripts/god_menu";
import { CountryManager } from "./country_manager";
import { TroopManager } from "./troop_manager";

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

    public static makeGrid(width: number, height: number, terrain: string): void {
        this.tile_grid = [[]];
        this.width = width;
        this.height = height;
        for (let x = 0; x < width; x++) {
            this.tile_grid[x] = [];
            for (let y = 0; y < height; y++) {
                let tile_terrain: string = terrain;

                this.tile_grid[x][y] = new Tile(tile_terrain);
            }
        }
    }

    public static async loadMapFile(): Promise<void> {
        const terrain_grid: Array<Array<string>> = await readJSON("src/map_gen/output/map_geo.json");
        const owner_grid: Array<Array<string>> = await readJSON("src/map_gen/output/map_pol.json");

        const texture_grid_width: number = terrain_grid.length;
        const texture_grid_height: number = terrain_grid[0].length;

        for (let x = 0; x < texture_grid_width; x++) {
            this.tile_grid[x] = [];
            for (let y = 0; y < texture_grid_height; y++) {
                const terrain: string = terrain_grid[x][y];
                const tile: Tile = new Tile(terrain);
                this.tile_grid[x][y] = tile;
                if (terrain != "water") {
                    const owner_tag: string = owner_grid[x][y];
                    this.tile_grid[x][y].setOwner(owner_tag);
                    this.tile_grid[x][y].setController(owner_tag);
                }
            }
        }

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

    public static getOwner(x: number, y: number): string {
        return this.tile_grid[x][y].getOwner()!;
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
     * @param condition (optional) condition for being considered valid neighbour
     * @returns Array of Vectors representing all neighbours of the given tile on the map in offset format
     */
    public static getNeighbours(tile_position: Vector, condition: (tile_position: Vector) => boolean = () => true): Vector[] {
        const neighbours: Vector[] = [];

        const tile_position_double: Vector = hexVectorOffsetToDouble(tile_position);
        const north_east: Vector = vectorMake(1, -1);
        const east: Vector = vectorMake(2, 0);
        const south_east: Vector = vectorMake(1, 1);
        const south_west: Vector = vectorMake(-1, 1);
        const west: Vector = vectorMake(-2, 0);
        const north_west: Vector = vectorMake(-1, -1);
    
        const tile_NE: Vector = vectorAdd(tile_position_double, north_east);
        const tile_E: Vector = vectorAdd(tile_position_double, east);
        const tile_SE: Vector = vectorAdd(tile_position_double, south_east);
        const tile_SW: Vector = vectorAdd(tile_position_double, south_west);
        const tile_W: Vector = vectorAdd(tile_position_double, west);
        const tile_NW: Vector = vectorAdd(tile_position_double, north_west);

        const theoretical_neighbours: Vector[] = [tile_NE, tile_E, tile_SE, tile_SW, tile_W, tile_NW];

        theoretical_neighbours.forEach((position: Vector) => {
            position = hexVectorDoubleToOffset(position);
            if (TileMapManager.positionExists(position) && condition(position)) {
                neighbours.push(position);
            }
        });

        return neighbours;
    }

    /**
     * Returns the neighbouring tiles on the map of a given tile position.
     * @returns Array of Vectors representing all neighbours of the given tile on the map in offset format
     */
    public static isNeighbour(tile_pos_1: Vector, tile_pos_2: Vector, condition: (tile_position: Vector) => boolean = () => true): boolean {
        const neighbours: Vector[] = this.getNeighbours(tile_pos_2, condition);
        return neighbours.some(neighbour => vectorEquals(tile_pos_1, neighbour));
    }

    public static isBorder(tile_position: Vector): boolean {
        const min_y: number = 0;
        const max_y: number = this.readHeight() - 1;

        if (tile_position.y === min_y || tile_position.y === max_y) {
            return true;
        }

        function different_owner(neighbour_tile_pos: Vector): boolean {
            const this_owner: string = TileMapManager.getOwner(tile_position.x, tile_position.y);
            const neighbour_owner: string = TileMapManager.getOwner(neighbour_tile_pos.x, neighbour_tile_pos.y);

            return this_owner !== neighbour_owner;
        }

        const diff_owner_neighbours = this.getNeighbours(tile_position, (neighbour) => different_owner(neighbour));

        return diff_owner_neighbours.length > 0;
    }

    public static selectMouseTile(): void {
        const tile_on_mouse: Vector | null = RenderLogicManager.tileOnMouse();

        const pressed_selected_tile: boolean = vectorEquals(tile_on_mouse, this.selected_tile);

        if (pressed_selected_tile) { // tile was already selected => unselect it, select troops
            const troops_on_tile: string[] = TroopManager.getTroopsOnTile(this.selected_tile!); // selected tile already guaranteed non-null in bool double_select
            this.unselectTile();
            troops_on_tile.forEach((tag: string) => {
                TroopManager.selectTroop(tag);
            });
        } else { // tile wasn't selected => select it
            TroopManager.unselectAllTroops();
            this.setSelectedTile(tile_on_mouse);
        }
    }

    /** *TileMapManager.setSelectedTile(null)* */
    public static unselectTile(): void {
        this.setSelectedTile(null);
    }

    public static setSelectedTile(tile_pos: Vector | null): void {
        this.selected_tile = tile_pos;
        godMenuSelectTile(tile_pos ?? vectorMake(0, 0));
    }

    public static getSelectedTile(): Vector | null {
        if (this.selected_tile) {
            return { ...this.selected_tile };
        } else {
            return null;
        }
    }
}