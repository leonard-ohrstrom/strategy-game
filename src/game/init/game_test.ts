/**
 * Run tests in isolation, without having to run boot.
 */

import { RenderManager } from "../../render/render_manager";
import { TextureManager } from "../../render/texture_manager";
import { TileMapManager } from "../state/tile_map";

export async function gameTest() {
    console.log("start of gameTest()");
    await TileMapManager.makeGrid(4, 4, "blank");
    await TextureManager.init();
    await RenderManager.init();
    RenderManager.update();
    console.log("end of gameTest()");
}