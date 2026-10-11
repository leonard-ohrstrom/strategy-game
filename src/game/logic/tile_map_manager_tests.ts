import { vectorMake } from "../../types/type_constructors";
import { TileMapManager } from "./tile_map_manager";

/**
 * Tests if all TileMapManager functions work correctly.
 * @returns boolean representing if all tests passed
 */
export function testTileMapManager(): boolean {
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
        const valid_pos1: boolean = TileMapManager.positionExists(vectorMake(0, 0));
        const valid_pos2: boolean = TileMapManager.positionExists(vectorMake(6, 0));
        const valid_pos3: boolean = TileMapManager.positionExists(vectorMake(6, 2));
        const valid_pos4: boolean = TileMapManager.positionExists(vectorMake(0, 2));
        const valid_pos_exists: boolean = valid_pos1 && valid_pos2 && valid_pos3 && valid_pos4;
        console.log("valid positions exist:", valid_pos_exists);
        return valid_pos_exists;
    }

    function notInvalidPositions(): boolean {
        const invalid_pos1: boolean = TileMapManager.positionExists(vectorMake(-1, 0));
        const invalid_pos2: boolean = TileMapManager.positionExists(vectorMake(0, -1));
        const invalid_pos3: boolean = TileMapManager.positionExists(vectorMake(7, 0));
        const invalid_pos4: boolean = TileMapManager.positionExists(vectorMake(0, 3));
        const below_limit: boolean = invalid_pos1 || invalid_pos2;
        const above_limit: boolean = invalid_pos3 || invalid_pos4;
        const invalid_pos_not_exists: boolean = !below_limit && !above_limit;
        console.log("invalid positions do not exist:", invalid_pos_not_exists);
        return invalid_pos_not_exists;
    }
    return correctDimensions() && validPositions() && notInvalidPositions();
}
