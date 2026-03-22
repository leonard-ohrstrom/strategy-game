/**
 * Functions for generating things by random chance.
 */
/**
 * Generate random number
 * @param min - minimum value as integer
 * @param max - maximum value as integer
 * @returns a pseudorandom whole number within the span of min to max
 */
export function getRandomInteger(min: number, max: number): number {
    const delta = max - min;
    return Math.round(min + delta * Math.random());
}
/**
 * Generates a random terrain type valid for tiles
 * @returns a randomly generated terrain type
 */
export function getRandomTerrain(): string {
    const terrain_number: number = getRandomInteger(1, 2);
    switch (terrain_number) {
        case 1:
            return "plain";
        case 2:
            return "forest";
        default:
            console.error("random.ts line 17: GETRANDOMTERRAIN RANDOM INTEGER OUT OF RANGE");
    }
    return "";
}