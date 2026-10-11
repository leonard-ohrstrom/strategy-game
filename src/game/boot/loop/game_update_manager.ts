/**
 * Sends update to all aspects of game that need constant updating every frame.
 */

import { RenderManager } from "../../../render/render_manager";
import { InputManager } from "../../input/input_manager";
import { mousePositionManager } from "../../../render/mouse_position";
import { TroopManager } from "../../logic/troop_manager";

export class GameUpdateManager {
    static async update(delta_time: number) {
        InputManager.updateKeyAction(delta_time);
        TroopManager.update(delta_time);
        mousePositionManager.update();
        RenderManager.update();
    }
}