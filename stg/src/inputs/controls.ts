import { getCanvasDimensions } from "../rendering/canvas";
import { InputManager } from "./inputs";
import { GameCamera } from "../game/camera";

const square = (n: number): number => (n * n);
export class ControlManager {
    static tickControls() {
        const canvas_dimensions = getCanvasDimensions();
        const edge_length: number = canvas_dimensions.x * 0.1;

        const scroll_right: number = canvas_dimensions.x - edge_length;
        const scroll_left: number = edge_length;
        const scroll_down: number = canvas_dimensions.y - edge_length;
        const scroll_up: number = edge_length;

        const mouse_pos = InputManager.MousePos();
        let edge_percent = 0;
        // right
        if(mouse_pos.x > scroll_right) {
            edge_percent = 1 - (canvas_dimensions.x - mouse_pos.x) / edge_length;
            GameCamera.moveCamera(-15 * square(edge_percent), 0);
        // left
        } else if (mouse_pos.x < scroll_left) {
            edge_percent = 1 - mouse_pos.x / edge_length;
            GameCamera.moveCamera(15 * square(edge_percent), 0);
        } else {}
        // up
        if (mouse_pos.y > scroll_down) {
            edge_percent = 1 - (canvas_dimensions.y - mouse_pos.y) / edge_length;
            GameCamera.moveCamera(0, -15 * square(edge_percent));
        // down
        } else if (mouse_pos.y < scroll_up) {
            edge_percent = 1 - mouse_pos.y / edge_length;
            GameCamera.moveCamera(0, 15 * square(edge_percent));
        } else {}

        console.log(edge_percent);
    }
}