import { makeVector, type Vector } from "../types/types";

const zoom_upper_limit: number = 0.4;
const zoom_lower_limit: number = 0.1;

// const square = (n: number): number => n * n;

export class GameCamera {
    private static x = 0;
    private static y = 0;
    private static scale = zoom_lower_limit;

    static moveCamera(x: number, y: number) {
        GameCamera.x = GameCamera.x + x * GameCamera.scale;
        GameCamera.y = GameCamera.y + y * GameCamera.scale;
    }

    static zoomCamera(zoom: number) {
        let new_zoom = GameCamera.scale + zoom;
        if (new_zoom > zoom_lower_limit && new_zoom < zoom_upper_limit) {
            GameCamera.scale = new_zoom;
        }
        else {
            if (zoom > 0) {
                GameCamera.scale = zoom_upper_limit;
            } else if (zoom < 0) {
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