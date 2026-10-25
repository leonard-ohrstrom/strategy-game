/**
 * Sends update to all aspects of game that need constant updating every frame.
 */

import { RenderManager } from "../../../render/render_manager";
import { InputManager } from "../../input/input_manager";
import { TroopManager } from "../../logic/troop_manager";

export class GameUpdateManager {
    static async update(delta_time: number) {
        InputManager.update(delta_time);
        TroopManager.update(delta_time);
        RenderManager.update();
    }
}