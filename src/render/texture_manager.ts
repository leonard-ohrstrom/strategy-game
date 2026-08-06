import { readJSON } from "../types/file_parser";
import { makeRectangle } from "../types/type_constructors";
import type { Rectangle } from "../types/types";

// Terminology confusing because of overlap with PixiJS. Consider changing "sprite" to "subsheet" or other term.

type TextureRecord = {
    sprite_sheets: {
        "labels": Array<string>,
        "sheets": Record<string, SheetRecord>
    }
}

type SheetRecord = {
    "path": string,
    "sprite_labels": string[],
    "sprites": Record<string, Subsheet>
}

export type Boundaries = {
    x0: number,
    y0: number,
    x1: number,
    y1: number
}

type Subsheet = {
    "boundaries": Boundaries
}

type PathBoundariesRecord = {
    "path": string,
    "boundaries": Boundaries
}

/**
 * Allows reading path and dimension of a given texture label.
 */
export class TextureManager {
    private static sheet_labels: string[] = [];
    private static sheet_map: Map<string, string> = new Map;
    private static sprite_labels: string[] = [];
    private static sprite_map: Map<string, PathBoundariesRecord> = new Map;
    static async init(): Promise<void> {
        // load textures JSON
        const texture_json: TextureRecord = await readJSON("./data/textures/textures.json");

        // get all sheet labels
        const sprite_sheets = texture_json.sprite_sheets;
        const sheet_labels: string[] = sprite_sheets.labels;

        // set sheet labels to array
        this.sheet_labels = sheet_labels;

        // access each sheet from labels
        sheet_labels.forEach((sheet_label: string) => {
            const sheet: SheetRecord = sprite_sheets.sheets[sheet_label];
            const path: string = sheet.path;

            // Map sheet label to path
            this.sheet_map.set(sheet_label, path);

            // get all sprite labels
            const sprite_labels: string[] = sheet.sprite_labels;

            // Map each sprite label to record of sheet path and sprite boundaries
            sprite_labels.forEach((sprite_label: string) => {
                // save label in sprite_labels array
                this.sprite_labels.push(sprite_label);

                // get sprite
                const sheet_sprite: Subsheet = sheet.sprites[sprite_label];

                // record path and boundaries
                const boundaries: Boundaries = sheet_sprite.boundaries;
                const record: PathBoundariesRecord = {
                    "path": path,
                    "boundaries": boundaries
                }

                // save in map
                console.log("saving to map:", sprite_label, "\n", record);
                this.sprite_map.set(sprite_label, record);
            });
        });
    }

    static getSheetLabels(): string[] {
        // return [...this.sheet_labels];
        console.warn("not using copy for testing temporarily in getSheetLabels");
        return this.sheet_labels;
    }

    static getSpriteLabels(): string[] {
        // return [...this.sprite_labels];
        console.warn("not using copy for testing temporarily in getSpriteLabels");
        return this.sprite_labels;
    }

    static getSpriteBoundaries(sprite_label: string): Boundaries {
        const sheet_sprite: PathBoundariesRecord | undefined = this.sprite_map.get(sprite_label);
        if (sheet_sprite) {
            return {...sheet_sprite.boundaries};
        } else {
            console.error(`error retrieving label '${sprite_label}':s boundaries from Sprite Map`);
            return { x0: 0, y0: 0, x1: 0, y1: 0 };
        }
    }

    static getSpritePath(sprite_label: string): string {
        const sheet_sprite: PathBoundariesRecord | undefined = this.sprite_map.get(sprite_label);
        if (sheet_sprite) {
            return sheet_sprite.path;
        } else {
            console.error(`error retrieving label '${sprite_label}':s path from Sprite Map`);
            return "";
        }
    }

    static getSheetPath(sheet_label: string): string {
        const sheet_path: string | undefined = this.sheet_map.get(sheet_label);
        if (sheet_path) {
            return sheet_path;
        } else {
            console.error(`error retrieving label '${sheet_label}':s path from Sheet Map`);
            return "";
        }
    }

    static getSpriteDimensions(texture_label: string): Rectangle {
        const boundaries: Boundaries = this.getSpriteBoundaries(texture_label);

        // boundaries
        let x0: number = boundaries.x0;
        let y0: number = boundaries.y0;
        let x1: number = boundaries.x1;
        let y1: number = boundaries.y1;

        // move to origin
        y1 -= y0;
        x1 -= x0;
        y0 -= y0;
        x0 -= x0;

        // make Rectangle
        return makeRectangle(x0, y0, x1, y1);
    }
}