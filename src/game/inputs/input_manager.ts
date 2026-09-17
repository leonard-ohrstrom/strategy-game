/**
 * Knows what keys are active and not, as well as mouse's position, and can
 * perform appropriate action if any input or mouse position has an effect tied
 * to it.
 */
import type { Vector } from "../../types/types";
import { makeVector } from "../../types/type_constructors";
import { GameCamera } from "../../render/game_camera";
import { TileMapManager } from "../state/tile_map";
import { TroopManager } from "../state/troop_manager";
import { GameMapManager } from "../state/tick/game_map_manager";

export class InputManager {
    private static active_keys: Set<string> = new Set();
    private static mouse_pos: Vector = makeVector(0, 0);

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
            Inputs.cameraUp(factor);
        }

        if (this.keyDown("arrowdown")) {
            Inputs.cameraDown(factor);
        }

        if (this.keyDown("arrowleft")) {
            Inputs.cameraLeft(factor);
        }

        if (this.keyDown("arrowright")) {
            Inputs.cameraRight(factor);
        }
    }

    static pressedKey(key: string): void {
        switch(key) {
            case "+":
                Inputs.cameraZoomIn();
                break;
            case "-":
                Inputs.cameraZoomOut();
                break;
            case "escape":
                Inputs.deselect();
                break;
            case "m":
                Inputs.stepMapMode();
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
                    Inputs.pressTile();
                }
            break;
            case "2":
                if (this.keyDown("control")) {
                    // control right click
                    Inputs.enqueueMoveTroops();
                } else {
                    // right mouse button
                    Inputs.moveTroops();
                }
            break;
        }
    }
}

class Inputs {
    static cameraUp(factor: number): void {
        GameCamera.incrementPos(0, -factor);
    }

    static cameraDown(factor: number): void {
        GameCamera.incrementPos(0, factor);
    }

    static cameraLeft(factor: number): void {
        GameCamera.incrementPos(-factor, 0);
    }

    static cameraRight(factor: number): void {
        GameCamera.incrementPos(factor, 0);
    }

    static cameraZoomIn(): void {
        GameCamera.zoomIn();
    }

    static cameraZoomOut(): void {
        GameCamera.zoomOut();
    }

    static pressTile(): void {
        TileMapManager.selectMouseTile();
    }

    static moveTroops(): void {
        TroopManager.moveTroopsToMouse();
    }

    static enqueueMoveTroops(): void {
        console.log("enqueueing movement");
        TroopManager.enqueueMoveTroopsToMouse();
    }

    static deselect(): void {
        TileMapManager.unselectTile();
        TroopManager.unselectAllTroops();
    }

    static stepMapMode(): void {
        GameMapManager.stepMapMode();
    }
}