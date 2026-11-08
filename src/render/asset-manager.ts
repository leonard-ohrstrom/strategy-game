import { Rectangle } from "../foundation/rectangle";

export class AssetManager {
    private sheetsMap: Map<string, string>;
    private spritesMap: Map<string, string>;

    public constructor() {
        this.sheetsMap = new Map<string, string>();
        this.spritesMap = new Map<string, string>();

        this.sheetsMap.set("tiles", "assets/textures/tiles.png");
    }

    public getSheetLabels(): string[] {
        const keys: MapIterator<string> = this.sheetsMap.keys();

        return Array.from(keys);
    }

    public getSheetPath(sheetLabel: string): string {
        const sheetPath: string | undefined = this.sheetsMap.get(sheetLabel);
        if (!sheetPath) {
            throw new Error("missing entry");
        }

        return sheetPath;
    }

    public getSpriteLabels(): string[] {
        // TODO: Stub
        return [];
    }

    public getSpriteBoundaries(spriteLabel: string): Rectangle {
        // TODO: Stub
        return new Rectangle(0, 0, 0, 0);
    }

    public getSpritePath(spriteLabel: string): string {
        // TODO: Stub
        return "";
    }
}