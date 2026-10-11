/**
 * Knows what keys are active and not, as well as mouse's position, and can
 * perform appropriate action if any input or mouse position has an effect tied
 * to it.
 */
import type { Vector } from "../../types/types";
import { vectorMake, vectorEquals } from "../../types/type_constructors";
import { GameCamera } from "../../render/game_camera";
import { TileMapManager } from "../logic/tile_map_manager";
import { TroopManager } from "../logic/troop_manager";
import { MapModeManager } from "../../render/map_mode_manager";
import { RenderLogicManager } from "../../render/render_logic_manager";
import { InputEventInitializer } from "./input_event_initializer";

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
                Inputs.cycleMapMode();
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
                    Inputs.select();
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

    static select(): void {
        const tile_on_mouse: Vector | null = RenderLogicManager.tileOnMouse();
        const selected_tile: Vector | null = TileMapManager.getSelectedTile();

        if (tile_on_mouse && selected_tile && vectorEquals(tile_on_mouse, selected_tile)) { // pressed selected tile
            const troops: string[] = TroopManager.getTroopsOnTile(selected_tile);
            troops.forEach(troop => TroopManager.selectTroop(troop));
            TileMapManager.unselectTile();
        } else {
            TroopManager.unselectAllTroops();
            TileMapManager.setSelectedTile(tile_on_mouse);
        }
    }

    static moveTroops(): void {
        TroopManager.moveTroopsToMouse();
    }

    static enqueueMoveTroops(): void {
        TroopManager.enqueueMoveTroopsToMouse();
    }

    static deselect(): void {
        TileMapManager.unselectTile();
        TroopManager.unselectAllTroops();
    }

    static cycleMapMode(): void {
        MapModeManager.stepMapMode();
    }
}