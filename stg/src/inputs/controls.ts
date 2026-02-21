import { canvas, getCanvasDimensions } from "../rendering/canvas";
import { InputManager } from "./inputs";
import { GameCamera } from "../game/camera";

export class ControlManager {
    static tickControls() {
        const edge: number = getCanvasDimensions().x * 0.05;

        const scroll_right: number = getCanvasDimensions().x - edge;
        const scroll_left: number = edge;
        const scroll_down: number = getCanvasDimensions().y - edge;
        const scroll_up: number = edge;

        console.log(getCanvasDimensions());
        if(InputManager.MousePos().x > scroll_right) {
            GameCamera.moveCamera(-25, 0);
            console.log("right");
        } else if (InputManager.MousePos().x < scroll_left) {
            GameCamera.moveCamera(25, 0);
            console.log("left");
        } else {}

        if (InputManager.MousePos().y > scroll_down) {
            GameCamera.moveCamera(0, -25);
            console.log("down");
        } else if (InputManager.MousePos().y < scroll_up) {
            GameCamera.moveCamera(0, 25);
            console.log("up");
        } else {}
    }
}