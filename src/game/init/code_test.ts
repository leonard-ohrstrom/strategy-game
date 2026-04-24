/**
 * Tests to ensure code exhibits expected behaviour on a more technical level.
 */

import { makeVector } from "../../types/type_constructors";
import { TileMapManager } from "../state/tile_map";

export function codeTest(): void {
    const tile_map_manager_passed: boolean = testTileMapManager();
    console.log("--- tileMapManager passed all tests:", tile_map_manager_passed, "---");
}

function testTileMapManager(): boolean {
    console.log("--- tileMapManager tests ---")
    TileMapManager.makeGrid(7, 3);

    function correctDimensions(): boolean {
        const correct_width: boolean = TileMapManager.readWidth() === 7;
        const correct_height: boolean = TileMapManager.readHeight() === 3;
        const correct_dimensions: boolean = correct_width && correct_height;
        console.log("correct dimensions:", correct_dimensions);
        return correct_dimensions;
    }

    function validPositions(): boolean {
        const valid_pos1: boolean = TileMapManager.positionExists(makeVector(0, 0));
        const valid_pos2: boolean = TileMapManager.positionExists(makeVector(6, 0));
        const valid_pos3: boolean = TileMapManager.positionExists(makeVector(6, 2));
        const valid_pos4: boolean = TileMapManager.positionExists(makeVector(0, 2));
        const valid_pos_exists: boolean = valid_pos1 && valid_pos2 && valid_pos3 && valid_pos4;
        console.log("valid positions exist:", valid_pos_exists);
        return valid_pos_exists;
    }

    function notInvalidPositions(): boolean {
        const invalid_pos1: boolean = TileMapManager.positionExists(makeVector(-1, 0));
        const invalid_pos2: boolean = TileMapManager.positionExists(makeVector(0, -1));
        const invalid_pos3: boolean = TileMapManager.positionExists(makeVector(7, 0));
        const invalid_pos4: boolean = TileMapManager.positionExists(makeVector(0, 3));
        const below_limit: boolean = invalid_pos1 || invalid_pos2;
        const above_limit: boolean = invalid_pos3 || invalid_pos4;
        const invalid_pos_not_exists: boolean = !below_limit && !above_limit;
        console.log("invalid positions do not exist:", invalid_pos_not_exists);
        return invalid_pos_not_exists;
    }
    return correctDimensions() && validPositions() && notInvalidPositions();
}