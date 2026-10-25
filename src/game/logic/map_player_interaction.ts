import { RenderLogicManager } from "../../render/render_logic_manager";
import type { Vector } from "../../utils/types";

export class MapPlayerInteraction {
    private static selected_tile: Vector | null;
    private static hovered_tile: Vector | null;

    public static updateHoveredTile(mouse_pixel_pos: Vector): void {
        this.hovered_tile = RenderLogicManager.tileOnPixel(mouse_pixel_pos);
    }

    public static getHoveredTile(): Vector | null {
        return this.hovered_tile;
    }

    public static getSelectedTile(): Vector | null {
        return this.selected_tile ?? null;
    }
}