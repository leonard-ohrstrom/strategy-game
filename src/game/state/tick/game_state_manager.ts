/**
 * Sends update to all aspects of game that need constant updating every frame.
 */

import { RenderManager } from "../../../render/render_manager";
import { GameMapManager } from "./game_map_manager";
import { InputManager } from "../../inputs/input_manager";
import { mousePositionManager } from "../../../render/mouse_position";
import { TroopManager } from "../division_manager";

export class GameStateManager {
    static async update(delta_time: number) {
        InputManager.updateKeyAction(delta_time);
        GameMapManager.update(delta_time);
        TroopManager.update(delta_time);
        mousePositionManager.update();
        RenderManager.update();
    }
}