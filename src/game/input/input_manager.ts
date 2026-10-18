/**
 * Knows what keys are active and not, as well as mouse's position, and can
 * perform appropriate action if any input or mouse position has an effect tied
 * to it.
 */
import type { Vector } from "../../utils/types";
import { vectorMake } from "../../utils/type_constructors";
import { GameCamera } from "../../render/game_camera";
import { InputEventInitializer } from "./input_event_initializer";
import { InputActionManager } from "./input_action_manager";

export class InputManager {
    private static active_keys: Set<string> = new Set();
    private static mouse_pos: Vector = vectorMake(0, 0);

    public static init(): void {
        InputEventInitializer.init();
    }

    static addKey(key: string): void {
        this.active_keys.add(key);
    }

    static removeKey(key: string): void {
        this.active_keys.delete(key);
    }

    static setMousePos(pos: Vector): void {
        this.mouse_pos = pos;
    }

    static getMousePos(): Vector {
        return this.mouse_pos;
    }

    private static keyDown(key: string): boolean {
        return this.active_keys.has(key);
    }

    static updateKeyAction(delta_time: number): void {
        const factor: number = delta_time / GameCamera.getZoom();

        if (this.keyDown("arrowup")) {
            InputActionManager.cameraUp(factor);
        }

        if (this.keyDown("arrowdown")) {
            InputActionManager.cameraDown(factor);
        }

        if (this.keyDown("arrowleft")) {
            InputActionManager.cameraLeft(factor);
        }

        if (this.keyDown("arrowright")) {
            InputActionManager.cameraRight(factor);
        }
    }

    static pressedKey(key: string): void {
        switch(key) {
            case "+":
                InputActionManager.cameraZoomIn();
                break;
            case "-":
                InputActionManager.cameraZoomOut();
                break;
            case "escape":
                InputActionManager.deselect();
                break;
            case "m":
                InputActionManager.cycleMapMode();
        }
    }

    static pressedMouseKey(key: string): void {
        switch(key) {
            case "0":
                // left mouse button
                if (this.keyDown("control")) {
                    // control left click
                    // add troop on mouse to selected troops
                    break;
                } else {
                    // left click
                    InputActionManager.select();
                }
            break;
            case "2":
                if (this.keyDown("control")) {
                    // control right click
                    InputActionManager.enqueueMoveTroops();
                } else {
                    // right mouse button
                    InputActionManager.moveTroops();
                }
            break;
        }
    }
}
