/**
 * Handles interpreting what texture names correspond to what actual filepath.
 */
import type { Rectangle } from "./types";
import { makeRectangle } from "./type_constructors";

export class TextureManager {
    static getPath(texture: string): string {
        return "";
    }
    static getDimensions(texture: string): Rectangle {
        return makeRectangle(0, 0, 0, 0);
    }
}