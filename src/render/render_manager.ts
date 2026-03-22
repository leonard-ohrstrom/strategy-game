/**
 * Manages instructions of what to draw forwards to context.
 */
import type { Rectangle } from "../types/types";
import { TextureManager } from "./texture_manager";
import { clearCanvas, context } from "./canvas_context";

export class RenderManager {
    static pre_loaded_images: Map<string, HTMLImageElement> = new Map;
    static async init(): Promise<void> {
        const pre_load_textures: Array<string> = await fetch('config.json')
            .then(response => response.json())
            .then(data => data);
        pre_load_textures.forEach((picture: string) => {
            const image = new Image;
            image.src = TextureManager.getPath(picture);
            this.pre_loaded_images.set(picture, image);
        });
    }
    private static drawImage(image: HTMLImageElement, source: Rectangle, target: Rectangle) {
        context.drawImage(
            image,
            source.position.x, // source image start x
            source.position.y, // source image start y
            source.width,      // source image width from start x
            source.height,     // source image height from start y
            target.position.x, // target start x on canvas
            target.position.y, // target start y on canvas
            target.width,      // target image width on canvas
            target.height      // target image height on canvas
        );
    }
    static clear(): void { clearCanvas(); }
    static render(texture: string, target_dimensions: Rectangle): void {
        let image: HTMLImageElement = new Image;
        if(this.pre_loaded_images.has(texture)) {
            try { image = this.pre_loaded_images.get(texture)! }
            catch(error) { console.error("RenderManager pre-render rendering error:", error) }
        } else {
            console.error("loading non pre-rendered image");
            image.src = TextureManager.getPath(texture);
            image.onload = () => { }
        }
        const texture_dimensions: Rectangle = TextureManager.getDimensions(texture);
        this.drawImage(image, texture_dimensions, target_dimensions);
    }
}