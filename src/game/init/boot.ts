/**
 * Runs code in right order necessary for program to start correctly.
 */
import { TextureManager } from "../../render/texture_manager";
import {InputEventManager} from "../inputs/input_event_manager";
import { TileMapManager } from "../state/tile_map";
import { startTicker } from "../state/tick/ticker";
import { RenderManager } from "../../render/render_manager";
import { CountryManager } from "../state/country_manager";

function buildMap(): void {
    TileMapManager.makeGrid(8, 8);
}

export async function boot(): Promise<void> {
    await TextureManager.init();
    await InputEventManager.init();
    await RenderManager.init();
    await CountryManager.init();
    buildMap();
    startTicker();
}