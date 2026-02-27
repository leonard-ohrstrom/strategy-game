import { makeVector, type Vector } from "../types/types";

const zoom_upper_limit: number = 0.4;
const zoom_lower_limit: number = 0.1;

// const square = (n: number): number => n * n;

export class GameCamera {
    private static x = 0;
    private static y = 0;
    private static scale = zoom_lower_limit;

    static moveCamera(x: number, y: number) {
        GameCamera.x = GameCamera.x + x;
        GameCamera.y = GameCamera.y + y;
    }

    static scaleCamera(scale: number) {
        let new_scale = GameCamera.scale + scale;
        if (new_scale > zoom_lower_limit && new_scale < zoom_upper_limit) {
            GameCamera.scale = new_scale;
        }
        else {
            if (scale > 0) {
                GameCamera.scale = zoom_upper_limit;
            } else if (scale < 0) {
                GameCamera.scale = zoom_lower_limit;
            } else {}
        }
    }

    static getZoom(): number {
        return GameCamera.scale;
    }

    static getPosition(): Vector {
        return makeVector(GameCamera.x, GameCamera.y);
    }
}