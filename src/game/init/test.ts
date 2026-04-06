/**
 * fill test function with temporary testing stuff
 */

import { TileMapManager } from "../state/tile_map";

// runs tests
export function test() {
    TileMapManager.setTroops(0, 0, 1);
    TileMapManager.setTroops(1, 0, 1);
    TileMapManager.setTroops(0, 1, 1);
    TileMapManager.setOwner(0, 0, "SWE");
    TileMapManager.setController(0, 1, "SWE");
}