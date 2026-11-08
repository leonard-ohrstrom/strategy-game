import { GameState } from "../game/game-state/game-state.entry";
import { RenderEngine } from "./render-engine";
import { type RenderOrder, RenderPlanner } from "./render-planner";

export class RenderManager {
    private renderPlanner: RenderPlanner;
    private renderer: RenderEngine;

    private constructor(renderer: RenderEngine) {
        this.renderPlanner = new RenderPlanner();
        this.renderer = renderer;
    }

    public static async create(): Promise<RenderManager> {
        const renderer: RenderEngine = await RenderEngine.create();

        return new RenderManager(renderer);
    }

    public renderState(gameState: GameState): void {
        const renderQueue: RenderOrder[] = this.renderPlanner.planStateRender(gameState);

        this.renderer.renderState(renderQueue);
    }
}