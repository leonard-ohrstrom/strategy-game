/**
 * Constructors for types used in the code.
 */
import { type Vector, type Rectangle } from "./types";

export function makeVector(a : number, b: number): Vector {
    return {
        x : a,
        y : b
    }
}

export function makeRectangle(x0 : number, y0: number, x1: number, y1: number): Rectangle {
    x0 = roundNumber(x0, 3);
    y0 = roundNumber(y0, 3);
    x1 = roundNumber(x1, 3);
    y1 = roundNumber(y1, 3);
    return {
        position: makeVector(x0, y0),
        width: x1 - x0,
        height: y1 - y0
    }
}

/**
 * Scales a given rectangle around the origin (0, 0).
 * @param rectangle a Rectangle
 * @param factor scaling factor
 * @returns rectangle scaled by factor around origin
 */
export function scaleRectangle(rectangle: Rectangle, factor: number): Rectangle {
    const x0: number = rectangle.position.x * factor;
    const y0: number = rectangle.position.y * factor;
    const x1: number = (rectangle.position.x + rectangle.width) * factor;
    const y1: number = (rectangle.position.y + rectangle.height) * factor;
    return makeRectangle(x0, y0, x1, y1);
}

/**
 * Translates (moves) a given rectangle by an x and y amount
 * @param shape a given shape to translate
 * @param x amount to move in x-direction
 * @param y amount to move in y-direction
 * @returns the given shape translated by (x, y)
 */
export function translateRectangle(shape: Rectangle, x: number, y: number): Rectangle {
    const x0: number = shape.position.x + x;
    const y0: number = shape.position.y + y;
    const x1: number = shape.position.x + shape.width + x;
    const y1: number = shape.position.y + shape.height + y;
    const translated_rectangle: Rectangle = makeRectangle(x0, y0, x1, y1);
    return translated_rectangle;
}

function roundNumber(number: number, decimals: number) {
    return Math.round(number * (10**decimals)) / 10**decimals;
}