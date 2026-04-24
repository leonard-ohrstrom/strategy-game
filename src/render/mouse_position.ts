/**
 * For calculating which pixel on game screen mouse is. (i.e., canvas but taking into account camera
 * zoom and position.) Borderline belongs in /inputs/ because of overlap in functionality.
 */
import { makeVector } from "../types/type_constructors";
import type { Vector } from "../types/types";
import { InputManager } from "../game/inputs/input_manager";

export class mousePositionManager {
    private static raw_mouse_pos: Vector = makeVector(0, 0);

    static update(): void {
        this.raw_mouse_pos = InputManager.getMousePos();
    }
}