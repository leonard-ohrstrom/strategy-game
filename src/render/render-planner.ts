import { Rectangle } from "../foundation/rectangle";
import { GameState } from "../game/game-state/.game-state";

export type RenderOrder = {
    texture: string,
    target: Rectangle
}

export class RenderPlanner {
    public planStateRender(gameState: GameState): RenderOrder[] {
        // TODO: Stub
        return [];
    }
}