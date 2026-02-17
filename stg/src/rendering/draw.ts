import { canvas, context } from "./canvas";
import { type Vector, type Rectangle } from '../types/types.ts'

function make_vector(a : number = 0, b: number = 0): Vector {
    return {
        x: a,
        y: b
    }
}

export function drawIMG(img_path: string, source_dimensions: Rectangle,
                        target_dimensions: Rectangle): void {
    context.imageSmoothingEnabled = false;
    const image = new Image;
    image.src = img_path;
    image.onload = () => {
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
    };
}

export function drawSVG(img_path: string, target_dimensions: Rectangle): void {
    context.imageSmoothingEnabled = false;
    const image = new Image;
    image.src = img_path;
    image.onload = () => {
        context.drawImage(
            image,
            target_dimensions.position.x, // target start x on canvas
            target_dimensions.position.y, // target start y on canvas
            target_dimensions.width,      // target image width on canvas
            target_dimensions.height      // target image height on canvas
        );
    };
}

// const image_dimensions: Rectangle = {
//     width: 8,
//     height: 16,
//     position: make_vector(0, 0)
// };

// const target_dimensions: Rectangle = {
//     width: 160,
//     height: 320,
//     position: make_vector(0, 0)
// };

// drawIMG('./textures/soldaten.png', image_dimensions, target_dimensions);

const scale = 20;
const target_dimensions_svg: Rectangle = {
    width: 2 * scale,
    height: 1.73205080757 * scale,
    position: make_vector(0, 0)
}

drawSVG('./textures/hexagon.svg', target_dimensions_svg);