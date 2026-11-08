export type GameSpeedNumber = 1 | 2 | 3 | 4 | 5;



const GAME_SPEED_INTERVALS: Record<GameSpeedNumber, number> = {
    1: 2000,
    2: 500,
    3: 200,
    4: 100,
    5: 0
} as const satisfies Record<GameSpeedNumber, number>;



export class GameSpeedManager {
    private readonly speedInterval: Record<GameSpeedNumber, number>;

    constructor() {
        this.speedInterval = GAME_SPEED_INTERVALS;
    }

    public getSpeedInterval(gameSpeed: GameSpeedNumber): number {
        return this.speedInterval[gameSpeed];
    }
}