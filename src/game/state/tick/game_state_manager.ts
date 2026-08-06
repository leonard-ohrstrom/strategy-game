/**
 * Sends update to all aspects of game that need constant updating every frame.
 */

import { RenderManager } from "../../../render/render_manager";
import { GameMapManager } from "./game_map_manager";
import { InputManager } from "../../inputs/input_manager";
import { mousePositionManager } from "../../../render/mouse_position";

export class GameStateManager {
    static async update(delta_time: number) {
        InputManager.updateKeyAction(delta_time);
        InputManager.updateMouseAction();
        GameMapManager.update(delta_time);
        await RenderManager.update();
        mousePositionManager.update();
    }
}