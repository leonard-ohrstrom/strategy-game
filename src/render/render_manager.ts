import { Application, Assets, Rectangle as pixiRectangle, Sprite, Texture, TextureSource } from "pixi.js";
import type { Rectangle } from "../types/types";
import { RenderLogicManager, type RenderOrder } from "./render_logic_manager";
import { TextureManager, type Boundaries } from "./texture_manager";

interface Renderer {
    init(): Promise<void>;
    beginFrame(): void;
    drawSprite(path: string, area: Rectangle, color?: string | null, alpha?: number): void;
    endFrame(): void;
}

class pixiJSrenderer implements Renderer {
    private app: Application = new Application();
    private frame_started: boolean = false;
    private sprite_pool: Sprite[] = [];
    private active_sprites: number = 0;
    private texture_cache: Map<string, Texture> = new Map;

    public async init(): Promise<void> {
        // Initialize the application
        await this.app.init({
            resizeTo: window,
            autoStart: false
        });

        // Add application to document body
        document.body.appendChild(this.app.canvas);

        // load sheets in Assets
        const sheet_labels: string[] = TextureManager.getSheetLabels();
        const sheet_paths: string[] = sheet_labels.map((sheet_label) => TextureManager.getSheetPath(sheet_label));
        await Assets.load(sheet_paths);

        // save sprites in texture_cache
        const sprite_labels: string[] = TextureManager.getSpriteLabels();

        for (const sprite_label of sprite_labels) {
            // calculate sprite frame values
            const sprite_boundaries: Boundaries = TextureManager.getSpriteBoundaries(sprite_label);

            const x0: number = sprite_boundaries.x0;
            const y0: number = sprite_boundaries.y0;
            const width: number = sprite_boundaries.x1 - sprite_boundaries.x0;
            const height: number = sprite_boundaries.y1 - sprite_boundaries.y0;

            // create sheet texture => sprite source
            const sheet_path: string = TextureManager.getSpritePath(sprite_label);
            const sheet_texture: Texture = Texture.from(sheet_path);
            const source: TextureSource = sheet_texture.source;

            const sprite_texture: Texture = new Texture({
                source: source,
                frame: new pixiRectangle(x0, y0, width, height)
            });

            // add texture to cache
            this.texture_cache.set(sprite_label, sprite_texture);
        }
     }

    /**
     * Begins a frame.
     */
    public beginFrame(): void {
        this.frame_started = true;
        this.active_sprites = 0;
    }

    /**
     * Draws a sprite on the canvas.
     * @param path texture file path
     * @param area area on screen to render the sprite
     * @param layer sprite layer
     * @param color sprite coloring (optional)
     */
    public drawSprite(path: string, area: Rectangle, color: string | null = null, alpha: number = 1): void {
        let sprite: Sprite;
        const sprite_pool_available: boolean = this.sprite_pool.length > this.active_sprites;

        // assign or create sprite
        if (sprite_pool_available) {
            sprite = this.sprite_pool[this.active_sprites];
        } else {
            sprite = new Sprite();
            sprite.visible = false;

            this.app.stage.addChild(sprite);
            this.sprite_pool.push(sprite);
        }

        // set sprite to render order
        let texture: Texture | undefined = this.texture_cache.get(path);

        if (!texture) {
            console.warn(`could not find Texture of ${path} in cache`);
            texture = Texture.from(path);
            this.texture_cache.set(path, texture);
        }

        sprite.texture = texture;

        sprite.anchor = 0;

        sprite.position.set(
            area.position.x,
            area.position.y
        );

        sprite.width = area.width;
        sprite.height = area.height;

        if (color) {
            sprite.tint = color;
        } else {
            sprite.tint = 0xffffff;
        }

        sprite.alpha = alpha;

        sprite.visible = true;

        this.active_sprites++;
    }

    /**
     * Ends the current frame, hiding all unused sprites and then rendering the frame.
     */
    public endFrame(): void {
        if (!this.frame_started) {
            console.error('Attempting to end frame that has not started.');
            return;
        }

        // hide all unused sprites in the pool
        for (let i = this.active_sprites; i < this.sprite_pool.length; i++) {
            this.sprite_pool[i].visible = false;
        }

        // render and end frame
        this.app.render();
        this.frame_started = false;
    }
}

export class RenderManager {
    private static renderer: Renderer = new pixiJSrenderer;

    public static async init() {
        await this.renderer.init();
    }

    public static update() {
        // start frame
        this.renderer.beginFrame();

        // Draw every render order
        const render_queue: Array<RenderOrder> = RenderLogicManager.getRenderQueue();

        render_queue.forEach((render_order: RenderOrder) => {
            const path: string = render_order.texture;
            const area: Rectangle = render_order.target;
            const color: string | null = render_order.color; 
            const alpha: number = render_order.alpha;
            this.renderer.drawSprite(path, area, color, alpha);
        });

        // Clear the render queue in RenderLogicManager
        RenderLogicManager.clearRenderQueue();

        // end frame
        this.renderer.endFrame();
    }
}