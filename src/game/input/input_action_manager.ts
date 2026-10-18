import { GameCamera } from "../../render/game_camera";
import { MapModeManager } from "../../render/map_mode_manager";
import { RenderLogicManager } from "../../render/render_logic_manager";
import { godMenuSelectTile } from "../../scripts/god_menu";
import { vectorEquals, vectorMake } from "../../utils/type_constructors";
import type { Vector } from "../../utils/types";
import { TileMapManager } from "../logic/tile_map_manager";
import { TroopManager } from "../logic/troop_manager";

export class InputActionManager {
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
            godMenuSelectTile(tile_on_mouse ?? vectorMake(0, 0));
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
