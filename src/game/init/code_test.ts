/**
 * Tests to ensure code exhibits expected behaviour internally.
 */

import { hexagonsTests } from "../../types/hexagons";
import { testTileMapManager } from "../state/tile_map";

export function codeTest(): void {
    const tile_map_manager_passed: boolean = testTileMapManager();
    console.log("--- tileMapManager passed all tests:", tile_map_manager_passed, "---");
    const hexagons_passed: boolean = hexagonsTests();
    console.log("--- hexagons passed all tests:", hexagons_passed, "---");
    const all_tests_passed: boolean = tile_map_manager_passed && hexagons_passed;
    console.log("--- all code tests passed:", all_tests_passed, "---");
}