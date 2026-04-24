/**
 * Sends update to all aspects of game that need constant updating every frame.
 */

import { RenderLogicManager } from "../../../render/render_logic_manager";
import { GameMapManager } from "./game_map_manager";
import { InputManager } from "../../inputs/input_manager";
import { setCanvasToBrowser } from "../../../render/canvas_context";
import { mousePositionManager } from "../../../render/mouse_position";

export class GameStateManager {
    static update(delta_time: number) {
        setCanvasToBrowser();
        InputManager.updateKeyAction(delta_time);
        InputManager.updateMouseAction();
        GameMapManager.update(delta_time);
        RenderLogicManager.update();
        mousePositionManager.update();
    }
}