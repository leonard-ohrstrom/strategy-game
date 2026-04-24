/**
 * Runs code in right order necessary for program to start correctly.
 */
import { TextureManager } from "../../render/texture_manager";
import {InputEventManager} from "../inputs/input_event_manager";
import { TileMapManager } from "../state/tile_map";
import { startTicker } from "../state/tick/ticker";
import { RenderManager } from "../../render/render_manager";
import { CountryManager } from "../state/country_manager";
import { DivisionManager } from "../state/division_manager";

async function buildMap(): Promise<void> {
    await TileMapManager.loadMapFile();
}

export async function boot(): Promise<void> {
    console.log("initialising textures")
    await TextureManager.init();
    console.log("initialising inputs")
    await InputEventManager.init();
    console.log("initialising renders")
    await RenderManager.init();
    console.log("initialising countries")
    await CountryManager.init();
    console.log("initialising division manager")
    await DivisionManager.init();
    console.log("building map")
    await buildMap();
    console.log("starting ticker")
    startTicker();
}