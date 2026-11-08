import { Application, Assets, Rectangle as pixiRectangle, Sprite, Texture, TextureSource } from "pixi.js";
import { Rectangle } from "../foundation/rectangle";
import { AssetManager } from "./asset-manager";
import { type RenderOrder } from "./render-planner";


interface Renderer {
    beginFrame(): void;
    drawSprite(texturePath: string, area: Rectangle, color?: string, alpha?: number, blend?: string): void;
    endFrame(): void;
}

type pixiJSBlend = "normal" | "multiply" | "add" | "screen";

class PixiJSRenderer implements Renderer {
    private app: Application;
    private spritePool: Sprite[] = [];
    private activeSprites: number = 0;

    private assetManager: AssetManager;
    private textureCache: Map<string, Texture>;

    private frameStarted: boolean = false;

    private constructor(app: Application, assetManager: AssetManager, textureCache: Map<string, Texture>) {
        this.assetManager = assetManager;
        this.app = app;
        this.textureCache = textureCache;
    }

    public static async create(): Promise<PixiJSRenderer> {
        // Create and initialize application
        const app: Application = new Application();
        app.init({
            resizeTo: window,
            autoStart: false
        });

        // Add application to document body
        document.body.appendChild(app.canvas);

        // load sheets in Assets
        const assetManager: AssetManager = new AssetManager();

        const sheetLabels: string[] = assetManager.getSheetLabels();
        const sheetPaths: string[] = sheetLabels.map((sheetLabel) => assetManager.getSheetPath(sheetLabel));

        await Assets.load(sheetPaths);

        // save sprites in textureCache
        const textureCache: Map<string, Texture> = new Map<string, Texture>();
        const spriteLabels: string[] = assetManager.getSpriteLabels();

        for (const spriteLabel of spriteLabels) {
            // calculate sprite frame values
            const spriteBoundary: Rectangle = assetManager.getSpriteBoundaries(spriteLabel);

            const x0: number = spriteBoundary.x;
            const y0: number = spriteBoundary.y;
            const width: number = spriteBoundary.width;
            const height: number = spriteBoundary.height;

            // create sheet texture => sprite source
            const sheetPath: string = assetManager.getSpritePath(spriteLabel);
            const sheetTexture: Texture = Texture.from(sheetPath);
            const source: TextureSource = sheetTexture.source;

            const spriteTexture: Texture = new Texture({
                source: source,
                frame: new pixiRectangle(x0, y0, width, height)
            });

            // add texture to cache
            textureCache.set(spriteLabel, spriteTexture);
        }

        const pixiJSRenderer: PixiJSRenderer = new PixiJSRenderer(app, assetManager, textureCache);
        return pixiJSRenderer;
    }

    /**
     * Begins a frame.
     */
    public beginFrame(): void {
        if(this.frameStarted) throw new Error("frame already started");

        this.frameStarted = true;
        this.activeSprites = 0;
    }

    /**
     * Draws a sprite on the canvas.
     * @param texturePath texture file path
     * @param area area on screen to render the sprite
     * @param layer sprite layer
     * @param color sprite coloring (optional)
     */
    public drawSprite(texturePath: string, area: Rectangle, color?: string, alpha?: number, blend?: pixiJSBlend): void {
        let sprite: Sprite;
        const hasSpritePoolSpace: boolean = this.spritePool.length > this.activeSprites;

        // assign or create sprite
        if (hasSpritePoolSpace) {
            sprite = this.spritePool[this.activeSprites];
        } else {
            sprite = new Sprite();
            sprite.visible = false;

            this.app.stage.addChild(sprite);
            this.spritePool.push(sprite);
        }

        // set sprite to render order
        let texture: Texture | undefined = this.textureCache.get(texturePath);

        if (!texture) {
            console.warn(`could not find Texture of ${texturePath} in cache`);
            texture = Texture.from(texturePath);
            this.textureCache.set(texturePath, texture);
        }

        sprite.texture = texture;

        sprite.anchor = 0;

        sprite.position.set(
            area.x,
            area.y
        );

        sprite.width = area.width;
        sprite.height = area.height;

        if (color) {
            sprite.tint = color;
        } else {
            sprite.tint = 0xffffff;
        }

        if (alpha) {
            sprite.alpha = alpha;
        } else {
            sprite.alpha = 1.0;
        }

        if (blend) {
            sprite.blendMode = blend;
        } else {
            sprite.blendMode = "normal";
        }

        sprite.visible = true;

        this.activeSprites++;
    }

    /**
     * Ends the current frame, hiding all unused sprites and then rendering the frame.
     */
    public endFrame(): void {
        if (!this.frameStarted) throw new Error("frame not started");

        // hide all unused sprites in the pool
        for (let i = this.activeSprites; i < this.spritePool.length; i++) {
            this.spritePool[i].visible = false;
        }

        // render and end frame
        this.app.render();
        this.frameStarted = false;
    }
}

export class RenderEngine {
    private renderer: Renderer;

    private constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    public static async create(): Promise<RenderEngine> {
        const renderer: Renderer = await PixiJSRenderer.create();
        return new RenderEngine(renderer);
    }

    public renderState(renderQueue: RenderOrder[]): void {
        // start frame
        this.renderer.beginFrame();

        // Draw every render order in queue
        for (const renderOrder of renderQueue) {
            const path: string = renderOrder.texture;
            const area: Rectangle = renderOrder.target;

            this.renderer.drawSprite(path, area);
        }

        // end frame
        this.renderer.endFrame();
    }
}