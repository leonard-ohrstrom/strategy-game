import { Country } from "./countries/.country";
import { Tile } from "./tile-map/.tile-map";
import { Troop } from "./military/.military";
import { GameSpeedManager, type GameSpeedNumber } from "./game-speed-manager";
import { FileHandler } from "../../foundation/file-handler";

export class GameState {
    public readonly countries: Map<number, Country>;
    public readonly tiles: Map<number, Tile>;
    public readonly troops: Map<number, Troop>;

    public paused: boolean;
    public speed: GameSpeedNumber;
    private gameSpeedManager: GameSpeedManager;

    public constructor() {
        this.countries = new Map<number, Country>();
        this.tiles = new Map<number, Tile>();
        this.troops = new Map<number, Troop>();

        this.paused = false;
        this.gameSpeedManager = new GameSpeedManager();
        this.speed = 3;
    }

    public async loadMap(path: string): Promise<void> {
        const tileMap: Tile[][] = await FileHandler.readJSON(path);

        let i: number = 0;
        for (const yColumn of tileMap) {
            for (const xTile of yColumn) {
                this.tiles.set(i, xTile);
            }
        }
    }

    public getUpdateInterval(): number {
        return this.gameSpeedManager.getSpeedInterval(this.speed);
    }
}