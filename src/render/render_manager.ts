/**
 * Manages instructions of what to draw forwards to context.
 */
import type { Rectangle } from "../types/types";
import { TextureManager } from "./texture_manager";
import { clearCanvas, context } from "./canvas_context";

const image_smoothing_quality: ImageSmoothingQuality = 'medium';

export class RenderManager {
    private static color_canvas: HTMLCanvasElement = document.createElement('canvas');
    private static color_context: CanvasRenderingContext2D = this.color_canvas.getContext('2d')!;

    static pre_loaded_images: Map<string, HTMLImageElement> = new Map;
    static async init(): Promise<void> {
        const textures: Array<string> = await fetch('textures.json')
            .then(response => response.json())
            .then(data => data);
        textures.forEach((texture: string) => {
            try {
                const image = new Image;
                image.src = TextureManager.getPath(texture);
                this.pre_loaded_images.set(texture, image);
            } catch (error) {
                console.error("errorrrrr hihihihi")
            }
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
    public static drawImageColor(image: HTMLImageElement, source: Rectangle, target: Rectangle, color: string) {
        this.color_canvas.width = target.width;
        this.color_canvas.height = target.height;
        this.color_context.imageSmoothingEnabled = context.imageSmoothingEnabled;
        this.color_context.drawImage(
            image,
            source.position.x, // source image start x
            source.position.y, // source image start y
            source.width,      // source image width from start x
            source.height,     // source image height from start y
            0, // target start x on canvas
            0, // target start y on canvas
            target.width,      // target image width on canvas
            target.height      // target image height on canvas
        );
        this.color_context.globalCompositeOperation = "source-in";
        this.color_context.fillStyle = color;
        this.color_context.fillRect(0, 0, target.width, target.height);
        context.drawImage(
            this.color_canvas,
            target.position.x,
            target.position.y,
            target.width,
            target.height
        )
    }

    static clear(): void { clearCanvas(); }

    static render(texture: string, target_dimensions: Rectangle, color: string | null = null): void {
        context.imageSmoothingQuality = image_smoothing_quality;
        let image: HTMLImageElement = new Image;
        if(this.pre_loaded_images.has(texture)) {
            try { image = this.pre_loaded_images.get(texture)! }
            catch(error) { console.error("RenderManager pre-render rendering error:", error) }
        } else {
            console.error("loading non pre-rendered image", texture);
            image.src = TextureManager.getPath(texture);
            image.onload = () => { }
        }
        const texture_dimensions: Rectangle = TextureManager.getDimensions(texture);
        if (color) {
            this.drawImageColor(image, texture_dimensions, target_dimensions, color);
        } else {
            this.drawImage(image, texture_dimensions, target_dimensions);
        }
    }
}