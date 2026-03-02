/**
 * Fetches information from other aspects of game to interpret and send to
 * RenderManager as medium level abstraction instructions of what to draw.
 */

import { GameCamera } from "./game_camera";
import type { Vector } from "./types";

export class DrawManager {
    static update() {}
    private static draw_tiles() {
        const camera_pos: Vector = GameCamera.getPos();
        const camera_zoom: number = GameCamera.getZoom();
    }
}