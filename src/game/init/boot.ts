/**
 * Triggers scripts necessary for program to start.
 */
import { TextureManager } from "../../render/texture_manager";
import {InputEventManager} from "../inputs/input_event_manager";
import { TileMapManager } from "../state/tile_map";
import { startTicker } from "../state/tick/ticker";
import { RenderManager } from "../../render/render_manager";

export async function boot(): Promise<void> {
    await TextureManager.init();
    await InputEventManager.init();
    await RenderManager.init();
    buildMap();
    startTicker();
}

function buildMap(): void {
    TileMapManager.makeGrid(8, 8);
}