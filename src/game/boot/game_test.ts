/**
 * Run tests in isolation, without having to run boot.
 */

import { RenderManager } from "../../render/render_manager";
import { TextureManager } from "../../render/texture_manager";
import { vectorMake } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { InputEventInitializer } from "../input/input_event_initializer";
import { CountryManager } from "../logic/country_manager";
import { TileMapManager } from "../logic/tile_map_manager";
import { TroopManager } from "../logic/troop_manager";
import { startTicker } from "./loop/ticker";

export async function gameTest() {
    await TextureManager.init();
    await RenderManager.init();
    await CountryManager.init();
    await InputEventInitializer.init();
    await TileMapManager.makeGrid(8, 8, "plain");
    startTicker();

    const tag: string = TroopManager.createTroop(vectorMake(1, 1), "SWE");
    TroopManager.setTroopMovement(tag, vectorMake(7, 7));
}