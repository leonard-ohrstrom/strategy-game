/**
 * Stores data and allows reading of all tiles on the map.
 */
import { getRandomInteger } from "../../types/general_functions";
import { CountryManager } from "./country_manager";

export class Tile {
    constructor(terrain: string) {
        this.terrain = terrain;
        this.owner = null;
        this.controller = null;
        this.troops = 0;
    }
    private terrain: string;
    private owner: string | null;
    private controller: string | null;
    private troops: number;
    public getTerrain(): string { return this.terrain }
    public setTerrain(terrain: string): void { this.terrain = terrain }
    public getTroops(): number { return this.troops }
    public setTroops(amount: number): void { this.troops = amount }
    public addTroop(): void { this.troops++ }
    public removeTroop(): void { if (this.troops <= 0) { this.troops = 0 } else { this.troops-- } }
    public setOwner(tag: string) {
        if (CountryManager.country_exists(tag)) {
            this.owner = tag;
        } else {
            console.warn("Tile setOwner could not find tag", tag);
        }
    }
    public getOwner(): string | null { return this.owner }
    public setController(tag: string) { this.controller = tag }
    public getController(): string | null { return this.controller }
    public isOccupied(): boolean { return this.controller !== this.owner }
}

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
                this.tile_grid[x][y] = new Tile(getRandomTerrain());
            }
        }
    }
    static readWidth(): number { return this.width }
    static readHeight(): number { return this.height }
    static readTile(x: number, y: number): Tile {
        try { return this.tile_grid[x][y] }
        catch (error) {
            console.error("tile_maps.ts ReadTile", x, y, "accessing error");
            return new Tile('');
        }
    }
    static setTerrain(x: number, y: number, terrain: string): void {
        this.tile_grid[x][y].setTerrain(terrain);
    }
    static setTroops(x: number, y: number, amount: number): void {
        this.tile_grid[x][y].setTroops(amount);
    }
    static setOwner(x: number, y: number, tag: string): void {
        this.tile_grid[x][y].setOwner(tag);
        this.setController(x, y, tag);
    }
    static setController(x: number, y: number, tag: string): void {
        this.tile_grid[x][y].setController(tag);
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
            console.error("random.ts line 17: GETRANDOMTERRAIN RANDOM INTEGER OUT OF RANGE");
    }
    return "";
}