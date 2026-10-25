/**
 * For testing game code / functionality which requires game loop.
 */

import { startTicker } from "../game/boot/loop/ticker";
import { InputManager } from "../game/input/input_manager";
import { CountryManager } from "../game/logic/country_manager";
import { TileMapManager } from "../game/logic/tile_map_manager";
import { TroopManager } from "../game/logic/troop_manager";
import { RenderManager } from "../render/render_manager";
import { TextureManager } from "../render/texture_manager";
import { vectorMake } from "../utils/type_constructors";

export async function gameTest() {
    await TextureManager.init();
    await RenderManager.init();
    await CountryManager.init();
    await InputManager.init();
    await TileMapManager.makeGrid(8, 8, "plain");
    await startTicker();

    const tag: string = TroopManager.createTroop(vectorMake(1, 1), "SWE");
    TroopManager.setTroopMovement(tag, vectorMake(7, 7));
}