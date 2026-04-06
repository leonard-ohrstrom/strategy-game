/**
 * Handles interpreting what texture names correspond to what actual filepath.
 */
import { loadConfig } from "../types/file_parser";
import { makeRectangle } from "../types/type_constructors";
import type { Rectangle } from "../types/types";

export class TextureManager {
    private static texture_config: any;
    static async init(): Promise<void> {
        this.texture_config = await loadConfig("./texture_config.ini");
    }
    static getPath(texture: string): string {
        return this.texture_config[texture]["path"];
    }
    static getDimensions(texture: string): Rectangle {
        const x0: number = this.texture_config[texture]["x0"];
        const y0: number = this.texture_config[texture]["y0"];
        const x1: number = this.texture_config[texture]["x1"];
        const y1: number = this.texture_config[texture]["y1"];
        return makeRectangle(x0, y0, x1, y1);
    }
}