import { RenderManager } from "../render/render.entry";
import { GameState } from "./game-state/game-state.entry";
import { GameUpdate } from "./game-update/game-update.entry";
import { InputState } from "./input/input.entry";

export class Game {
    private lastTick: number;
    private input: InputState;
    private gameState: GameState;
    private gameUpdate: GameUpdate;
    private renderManager?: RenderManager;

    public constructor() {
        this.lastTick = 0;
        this.input = new InputState();
        this.gameState = new GameState();
        this.gameUpdate = new GameUpdate();
    }

    public async setRenderer(renderManager: RenderManager): Promise<void> {
        this.renderManager = renderManager;
    }

    private update (deltaTime: number): void {
        this.input.update();

        this.gameUpdate.update(this.gameState, deltaTime);

        if (this.renderManager) {
            this.renderManager.renderState(this.gameState);
        }
    }

    private tickLoop = (timestamp: number): void => {
    const deltaTime: number = timestamp - this.lastTick;
    this.lastTick = timestamp;

    this.update(deltaTime);

    requestAnimationFrame(this.tickLoop);
    }

    public run(): void {
        this.lastTick = performance.now();
        requestAnimationFrame(this.tickLoop);
    }
}