/**
 * Sends update to all aspects of game that need constant updating every frame.
 */

import { DrawManager } from "./draw_manager";
import { GameMapManager } from "./game_map_manager";
import { InputManager } from "./input_manager";

export class GameStateManager {
    static update(delta_time: number) {
        InputManager.updateKeyAction();
        InputManager.updateMouseAction();
        GameMapManager.update(delta_time);
        DrawManager.update();
    }
}