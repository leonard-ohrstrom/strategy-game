/**
 * For calculating which pixel on game screen mouse is. (i.e., canvas but taking into account camera
 * zoom and position.) Borderline belongs in './render' because of overlap.
 */
import { makeVector } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { GameCamera } from "../../render/game_camera";
import { InputManager } from "./input_manager";

export class mousePositionManager {
    private static raw_mouse_pos: Vector = makeVector(0, 0);
    private static relative_mouse_pos: Vector = makeVector(0, 0);

    static update(): void {
        this.raw_mouse_pos = InputManager.getMousePos();
        console.log(this.raw_mouse_pos);
        console.log(this.relative_mouse_pos);
    }

    /**
     * Calculates the relative mouse position on screen of a given mouse position.
     * @param mouse_pos Vector representing a raw mouse position on a canvas
     * @returns Vector representing mouse position taking into account game camera position and zoom
     */
    private static calcRelativeMousePos(mouse_pos: Vector): Vector {
        return makeVector(0, 0);
    }
}