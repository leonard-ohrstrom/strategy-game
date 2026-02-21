import { context } from "./canvas.ts";
import { type Rectangle } from '../types/types.ts'

export class RenderManager {
    private static render_queue: Array<[string, Rectangle, Rectangle]> = [];

    static enqueueRender(texture: string, source_dimensions: Rectangle,
                          target_dimensions: Rectangle): void {
        RenderManager.render_queue.push([texture, source_dimensions, target_dimensions])
    }

    static RenderQueue(image_smoothing: boolean = true): void {
        if (!(this.render_queue.length === 0)) {
            const render_queue_front = RenderManager.render_queue[0];

            const texture: string = render_queue_front[0];
            const source_dimensions: Rectangle = render_queue_front[1];
            const target_dimensions: Rectangle = render_queue_front[2];

            context.imageSmoothingEnabled = image_smoothing;
            const image = new Image;
            image.src = texture;

            context.drawImage(
                image,
                source_dimensions.position.x, // source image start x
                source_dimensions.position.y, // source image start y
                source_dimensions.width,      // source image width from start x
                source_dimensions.height,     // source image height from start y
                target_dimensions.position.x, // target start x on canvas
                target_dimensions.position.y, // target start y on canvas
                target_dimensions.width,      // target image width on canvas
                target_dimensions.height      // target image height on canvas
            );

            RenderManager.render_queue.shift();

            RenderManager.RenderQueue(image_smoothing);

        } else {}
    }

    static clearRenderQueue() {
        this.render_queue = [];
    }
}

// function drawIMG(img_path: string, source_dimensions: Rectangle,
//                         target_dimensions: Rectangle): void {
//     context.imageSmoothingEnabled = false;
//     const image = new Image;
//     image.src = img_path;
//     image.onload = () => {
//         context.drawImage(
//             image,
//             source_dimensions.position.x, // source image start x
//             source_dimensions.position.y, // source image start y
//             source_dimensions.width,      // source image width from start x
//             source_dimensions.height,     // source image height from start y
//             target_dimensions.position.x, // target start x on canvas
//             target_dimensions.position.y, // target start y on canvas
//             target_dimensions.width,      // target image width on canvas
//             target_dimensions.height      // target image height on canvas
//         );
//     };
// }