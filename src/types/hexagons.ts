//
// npx tsx src/types/hexagons.ts
//

import { makeVector } from "./type_constructors";
import type { Vector } from "./types";

/**
 * Converts an offset hexagonal grid to double format.
 * @param offset_hexagon_grid a hexagon grid represented in offset format
 * @returns corresponding grid represented in double format
 */
export function hexGridOffsetToDouble<Hex>(offset_hexagon_grid: Hex[][]): Hex[][] { // ts wrong
    const double_hexagon_grid: Hex[][] = [];
    let x = 0;
    let y = 0;

    offset_hexagon_grid.forEach((x_column: Hex[]) => {
        double_hexagon_grid[x * 2] = [];
        double_hexagon_grid[x * 2 + 1] = [];

        x_column.forEach((hex: Hex) => {
            const even: boolean = y % 2 === 0;
            if (even) {
                double_hexagon_grid[2 * x][y] = hex;
            } else {
                double_hexagon_grid[2 * x + 1][y] = hex;
            }
            y++;
        });
        y=0;
        x++;
    });

    return double_hexagon_grid;
}

/**
 * Converts a double hexagonal grid to offset format.
 * @param double_hexagon_grid a hexagon grid represented in double format
 * @returns corresponding grid represented in offset format
 */
export function hexGridDoubleToOffset<Hex>(double_hexagon_grid: Hex[][]): Hex[][] {
    const offset_hexagon_grid: Hex[][] = [];
    let offset_x = 0;
    let double_x = 0;

    double_hexagon_grid.forEach((x_column: Hex[]) => {
        const even_column = double_x % 2 === 0;
        if (even_column) {
            offset_hexagon_grid[offset_x] = [];
            for (let y = 0; y < x_column.length; y += 2) {
                offset_hexagon_grid[offset_x][y] = double_hexagon_grid[double_x][y];
            }
        } else {
            for (let y = 1; y < x_column.length; y += 2) {
                offset_hexagon_grid[offset_x][y] = double_hexagon_grid[double_x][y];
            }
            offset_x++;
        }
        double_x++;
    });

    return offset_hexagon_grid;
}

/**
 * Converts Vector from offset to double format and returns copy
 * @param offset_coordinate The Vector's coordinate in offset format
 * @returns The Vector's coordinate in double format
 */
export function hexVectorOffsetToDouble(offset_coordinate: Vector): Vector {
    const x: number = offset_coordinate.x;
    const y: number = offset_coordinate.y;
    const offset: number = y % 2;

    return makeVector(x * 2 + offset, y);
}

/**
 * Converts Vector from double to offset format and returns copy
 * @param offset_coordinate The Vector's coordinate in double format
 * @returns The Vector's coordinate in offset format
 */
export function hexVectorDoubleToOffset(double_coordinate: Vector): Vector {
    const x: number = double_coordinate.x;
    const y: number = double_coordinate.y;

    return makeVector(Math.floor(x / 2), y);
}

/**
 * Tests if all hexagons functions work correctly.
 * @returns boolean representing if all tests passed
 */
export function hexagonsTests(): boolean {
    console.log("--- hexagons tests ---")
    //
    // offset --> double --> offset
    //
    const hex_before_0: string[][] = [
        ["a1", "b2", "b3"],
        ["c", "a", "b"],
        ["b", "a", "c"]
    ];

    const hex_expected_0: string[][] = [
        ["a1", "b2", "b3"],
        ["c", "a", "b"],
        ["b", "a", "c"]
    ];

    const hex_doubled_0: string[][] = hexGridOffsetToDouble(hex_before_0);

    const hex_result_0: string[][] = hexGridDoubleToOffset(hex_doubled_0);

    let test_0: boolean = true;

    for (let x = 0; x < hex_result_0.length; x++) {
        for (let y = 0; y < hex_result_0[0].length; y++) {
            test_0 = test_0 && (hex_expected_0[x][y] === hex_result_0[x][y]);
        }
    }

    console.log("offset -> double -> offset:", test_0);

    //
    // coordinate offset --> double --> offset
    //
    const coordinate_offset_1: Vector = makeVector(5, 3);
    const coordinate_doubled_1: Vector = hexVectorOffsetToDouble(coordinate_offset_1);
    const coordinate_result_1: Vector = hexVectorDoubleToOffset(coordinate_doubled_1);

    const test_1: boolean = coordinate_offset_1.x === coordinate_result_1.x && coordinate_offset_1.y === coordinate_result_1.y

    console.log("coordinate offset -> double -> offset:", test_1);

    return test_0 && test_1;
}