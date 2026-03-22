/**
 * Constructors for types used in the code.
 */
import { getRandomTerrain } from "./random";
import type { Vector, Rectangle, Tile } from "../types/types";
type num = number;
export function makeVector(a : num, b: num): Vector { return{x : a, y : b} }
export function makeRectangle(x0 : num, y0: num, x1: num, y1: num) : Rectangle {
    return {position: makeVector(x0, y0), width: x1 - x0, height: y1 - y0}
}
export function incrementRectangle(rectangle: Rectangle, increment_x: number, increment_y: number = increment_x) {
    const x0: number = rectangle.position.x;
    const y0: number = rectangle.position.y;
    const x1: number = x0 + rectangle.width;
    const y1: number = y0 + rectangle.height;
    return makeRectangle(x0 + increment_x, y0 + increment_y, x1 + increment_x, y1 + increment_y);
}
export function scaleRectangle(rectangle: Rectangle, factor_x: number, factor_y: number = factor_x) {
    const x0: number = rectangle.position.x;
    const y0: number = rectangle.position.y;
    const x1: number = x0 + rectangle.height;
    const y1: number = y0 + rectangle.height;
    return makeRectangle(x0, y0, x1 * factor_x, y1 * factor_y);
}
export function makeTile(): Tile { return{terrain: getRandomTerrain()} }