/**
 * Knows what keys are active and not, as well as mouse's position, and can
 * perform appropriate action if any input or mouse position has an effect tied
 * to it.
 */
import type { Vector } from "../../types/types";
import { makeVector } from "../../types/type_constructors";
import { GameCamera } from "../../render/game_camera";
import { TileMapManager } from "../state/tile_map";
import { TroopManager } from "../state/division_manager";

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
            GameCamera.incrementPos(0, -factor);
        }

        if (this.keyDown("arrowdown")) {
            GameCamera.incrementPos(0, factor);
        }

        if (this.keyDown("arrowright")) {
            GameCamera.incrementPos(factor, 0);
        }

        if (this.keyDown("arrowleft")) {
            GameCamera.incrementPos(-factor, 0);
        }
    }

    static pressedKey(key: string): void {
        switch(key) {
            case "+":
                GameCamera.zoomIn();
                break;
            case "-":
                GameCamera.zoomOut();
                break;
            case "escape":
                TileMapManager.unselectTile();
                break;
        }
    }

    static pressedMouseKey(key: string): void {
        switch(key) {
            case "0":
                // left click
                TileMapManager.selectTile();
                break;
            case "2":
                // right click
                if (this.keyDown("control")) {
                    // control right click
                    TroopManager.enqueueTroopToMouse();
                } else {
                    // right click
                    TroopManager.setTroopToMouse();
                }
                break;
        }
    }
}