/**
 * Manages instructions of what to draw, and turns into instructions relayed to
 * context.
 */
import type { Rectangle } from "./types";
import { TextureManager } from "./texture_manager";
import { clearCanvas, context } from "./canvas_context";

export class RenderManager {
    static render(texture: string, target_dimensions: Rectangle): void {
        const image = new Image;
        image.src = TextureManager.getPath(texture);
        const texture_dimensions: Rectangle = TextureManager.getDimensions(texture);
        context.drawImage(
            image,
            texture_dimensions.position.x, // source image start x
            texture_dimensions.position.y, // source image start y
            texture_dimensions.width,      // source image width from start x
            texture_dimensions.height,     // source image height from start y
            target_dimensions.position.x, // target start x on canvas
            target_dimensions.position.y, // target start y on canvas
            target_dimensions.width,      // target image width on canvas
            target_dimensions.height      // target image height on canvas
        );
    }
    static clear(): void {clearCanvas()}
}