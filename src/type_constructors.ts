/**
 * Constructors for types used in the code.
 */
import { getRandomTerrain } from "./random";
import type { Vector, Rectangle, Tile } from "./types";
type num = number;
export function makeVector(a : num, b: num): Vector { return{x : a, y : b} }
export function makeRectangle(x1 : num, y1: num, x2: num, y2: num) : Rectangle {
    return {position: makeVector(x1, x2), width: x2 - x1, height: y2 - y1}
}
export function makeTile(): Tile { return{terrain: getRandomTerrain()} }