/**
 * Misc functions
 */

/**
 * Generates a psuedorandom integer.
 * @param min - minimum value as integer
 * @param max - maximum value as integer
 * @returns a pseudorandom integer from min to max
 */
export function getRandomInteger(min: number, max: number): number {
    const delta = max - min;
    return Math.round(min + delta * Math.random());
}