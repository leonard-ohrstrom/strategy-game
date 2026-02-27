import { RenderManager } from "../rendering/render";
import { makeVector, type Rectangle } from "../types/types";
import { GameCamera } from "./camera";

const image_dimensions: Rectangle = {
        width: 1000,
        height: 1115,
        position: makeVector(0, 0)
    }

// render troop at grid x, y
export function renderTroops(amount: number, target_dimensions: Rectangle) {
    if (amount === 0) {
        // do nothing
    } else {
        const troop_texture: string = "./textures/division.png";
        const number_texture = getNumberTexture(amount);
        RenderManager.enqueueRender(troop_texture, image_dimensions, target_dimensions);
        RenderManager.enqueueRender(number_texture, image_dimensions, target_dimensions);
    }
}

export function renderTile(x: number, y: number) {
    const scale_factor = GameCamera.getZoom();
    const target_width = image_dimensions.width * scale_factor;
    const target_height = image_dimensions.height * scale_factor;
    const x_offset = GameCamera.getPosition().x;
    const y_offset = GameCamera.getPosition().y;

    let target_dimensions: Rectangle = {
        width: target_width,
        height: target_height,
        position: makeVector(
            x * target_width + x_offset,
            y * target_height * 0.75 + y_offset
        )
    };

    if (y % 2 === 1) {
        target_dimensions.position = makeVector(
            x * target_width + target_width * 0.5 + x_offset, 
            y * target_height * 0.75 + y_offset
        );
    } else {}

    
}

function getNumberTexture(amount: number): string {
    let texture = "";
    switch (amount) {
        case 0: {
            texture = "./textures/number0.png";
            break;
        }
        case 1: {
            texture = "./textures/number1.png";
            break;
        }
        case 2: {
            texture = "./textures/number2.png";
            break
        }
        case 3: {
            texture = "./textures/number3.png";
            break;
        }
        case 4: {
            texture = "./textures/number4.png";
            break;
        }
        case 5: {
            texture = "./textures/number5.png";
            break;
        }
        case 6: {
            texture = "./textures/number6.png";
            break;
        }
        case 7: {
            texture = "./textures/number7.png";
            break;
        }
        case 8: {
            texture = "./textures/number8.png";
            break;
        }
        case 9: {
            texture = "./textures/number9.png";
            break;
        }
        default: {
            texture = "./textures/number9plus.png"
        }
    }
    return texture;
}