/**
 * Constructors for types used in the code.
 */
import { type Vector, type Rectangle } from "./types";

type nullish = null | undefined;

export function vectorMake(a: number, b: number): Vector {
    return {
        x : a,
        y : b
    }
}

export function vectorAdd(vector1: Vector, vector2: Vector): Vector {
    return vectorMake(vector1.x + vector2.x, vector1.y + vector2.y);
}

export function vectorSubtract(vector1: Vector, vector2: Vector): Vector {
    const vector2_inverse: Vector = vectorScale(vector2, -1);
    return vectorAdd(vector1, vector2_inverse);
}

export function vectorScale(vector: Vector, factor: number): Vector {
    return vectorMake(vector.x * factor, vector.y * factor);
}

export function vectorEquals(vector1: Vector | nullish, vector2: Vector | nullish): boolean {
    return vector1 == vector2 || (!!vector1 && !!vector2 && vector1.x === vector2.x && vector1.y === vector2.y);
}

export function vectorCopy(vector: Vector): Vector {
    return { ...vector };
}

export function vectorDistance(vector1: Vector, vector2: Vector) {
    const x_dist: number = vector1.x - vector2.x;
    const y_dist: number = vector1.y - vector2.y;
    return Math.sqrt(x_dist * x_dist + y_dist * y_dist);
}

export function rectangleMake(x0 : number, y0: number, x1: number, y1: number): Rectangle {
    x0 = numberRound(x0, 3);
    y0 = numberRound(y0, 3);
    x1 = numberRound(x1, 3);
    y1 = numberRound(y1, 3);

    return {
        position: vectorMake(x0, y0),
        width: x1 - x0,
        height: y1 - y0
    }
}

export function vectorToString(vector: Vector): string {
    return `(${vector.x}, ${vector.y})`;
}

export function vectorFromString(vector_string: string): Vector
{
    const i_opening_parentheses: number = vector_string.indexOf("(");
    const i_comma: number = vector_string.indexOf(",", i_opening_parentheses + 1);
    const i_closing_parentheses: number = vector_string.indexOf(")", i_comma + 1);

    const str_x: string = vector_string.slice(i_opening_parentheses + 1, i_comma);
    const str_y: string = vector_string.slice(i_comma + 2, i_closing_parentheses);

    const x: number = Number(str_x);
    const y: number = Number(str_y);

    return vectorMake(x, y);
}

/**
 * Scales a given rectangle around the origin (0, 0).
 * @param rectangle a Rectangle
 * @param factor scaling factor
 * @returns rectangle scaled by factor around origin
 */
export function rectangleScale(rectangle: Rectangle, factor: number): Rectangle {
    const x0: number = rectangle.position.x * factor;
    const y0: number = rectangle.position.y * factor;
    const x1: number = (rectangle.position.x + rectangle.width) * factor;
    const y1: number = (rectangle.position.y + rectangle.height) * factor;
    return rectangleMake(x0, y0, x1, y1);
}

/**
 * Scales width and height of rectangle by factor.
 */
export function rectangleFactor(rectangle: Rectangle, factor: number): void {
    rectangle.width *= factor;
    rectangle.height *= factor;
}

/**
 * Translates (moves) a given rectangle by an x and y amount
 * @param shape a given shape to translate
 * @param x amount to move in x-direction
 * @param y amount to move in y-direction
 * @returns the given shape translated by (x, y)
 */
export function rectangleTranslate(shape: Rectangle, x: number, y: number): Rectangle {
    const x0: number = shape.position.x + x;
    const y0: number = shape.position.y + y;
    const x1: number = shape.position.x + shape.width + x;
    const y1: number = shape.position.y + shape.height + y;
    const translated_rectangle: Rectangle = rectangleMake(x0, y0, x1, y1);
    return translated_rectangle;
}

function numberRound(number: number, decimals: number) {
    return Math.round(number * (10**decimals)) / 10**decimals;
}