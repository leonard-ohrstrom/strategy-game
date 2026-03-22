/**
 * Handles interpreting what texture names correspond to what actual filepath.
 */
import { makeRectangle } from "../types/type_constructors";
import type { Rectangle } from "../types/types";
import * as ini from "ini";

export class TextureManager {
    private static config: any;
    static async init(): Promise<void> {
        this.config = await loadConfig("./config.ini");
    }
    static getPath(texture: string): string {
        return this.config[texture]["path"];
    }
    static getDimensions(texture: string): Rectangle {
        const x0: number = this.config[texture]["x0"];
        const y0: number = this.config[texture]["y0"];
        const x1: number = this.config[texture]["x1"];
        const y1: number = this.config[texture]["y1"];
        return makeRectangle(x0, y0, x1, y1);
    }
}

async function loadConfig(path: string): Promise<any> {
    const response = await fetch(path);
    if (!response.ok) {throw new Error("Failed to load config")}
    const text = await response.text();
    const config = ini.parse(text);
    return config;
}