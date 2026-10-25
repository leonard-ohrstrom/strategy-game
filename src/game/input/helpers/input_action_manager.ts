import { GameCamera } from "../../../render/game_camera";
import { MapModeManager } from "../../../render/map_mode_manager";
import { godMenuSelectTile } from "../../../scripts/god_menu";
import { vectorEquals, vectorMake } from "../../../utils/type_constructors";
import type { Vector } from "../../../utils/types";
import { MapPlayerInteraction } from "../../logic/map_player_interaction";
import { TileMapManager } from "../../logic/tile_map_manager";
import { TroopManager } from "../../logic/troop_manager";

type VoidInputFn = () => void;
type TimeInputFn = (delta_time: number) => void;
export type InputFn = VoidInputFn | TimeInputFn;

export type InputActionMap = Map<string, InputFn>

type CursorInputFn = (mouse_pixel_pos: Vector) => void;

type CursorActionMap = Map<string, CursorInputFn>;

export class InputActionManager {
    private static input_action_maps: Map<string, InputActionMap> = new Map;
    private static cursor_action_maps: Map<string, CursorActionMap> = new Map;

    public static init(): void {
        // keys held down (repeats)
        this.input_action_maps.set("normal", new Map);
        this.input_action_maps.get("normal")!.set("w",
            (delta_time: number) => InputActions.cameraUp(delta_time * (1 / GameCamera.getZoom())));
        this.input_action_maps.get("normal")!.set("s",
            (delta_time: number) => InputActions.cameraDown(delta_time * (1 / GameCamera.getZoom())));
        this.input_action_maps.get("normal")!.set("a",
            (delta_time: number) => InputActions.cameraLeft(delta_time * (1 / GameCamera.getZoom())));
        this.input_action_maps.get("normal")!.set("d",
            (delta_time: number) => InputActions.cameraRight(delta_time * (1 / GameCamera.getZoom())));

        // keys pressed (fires once)
        this.input_action_maps.set("frame", new Map);
        this.input_action_maps.get("frame")!.set("+",
            () => InputActions.cameraZoomIn());
        this.input_action_maps.get("frame")!.set("-",
            () => InputActions.cameraZoomOut());
        this.input_action_maps.get("frame")!.set("mouse_left",
            () => InputActions.select());
        this.input_action_maps.get("frame")!.set("esc",
            () => InputActions.deselect());
        this.input_action_maps.get("frame")!.set("m",
            () => InputActions.cycleMapMode());

        // mouse cursor position
        this.cursor_action_maps.set("mouse", new Map);
        this.cursor_action_maps.get("mouse")!.set("+",
            (mouse_pos: Vector) => MapPlayerInteraction.updateHoveredTile(mouse_pos));
    }

    public static getActionMap(mode: string): InputActionMap {
        return this.input_action_maps.get(mode) ?? new Map;
    }

    public static updateMouse(mouse_pos: Vector): void {
        const cursor_action_map: CursorActionMap = this.cursor_action_maps.get("mouse") ?? new Map;
        cursor_action_map.forEach((cursor_fn => cursor_fn(mouse_pos)));

    }
}


class InputActions {
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
        const tile_on_mouse: Vector | null = MapPlayerInteraction.getHoveredTile();
        const selected_tile: Vector | null = MapPlayerInteraction.getSelectedTile();

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