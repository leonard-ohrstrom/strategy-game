import { makeVector, type Vector } from "../types/types";
import { GameCamera } from "../game/camera.ts";

export class InputManager {
    static {
        onkeydown = (event) => {
            const key: string = event.key.toLocaleLowerCase();
            InputManager.addKey(key);
        }

        onkeyup = (event) => {
            const key: string = event.key.toLocaleLowerCase();
            InputManager.removeKey(key);
        }

        onmousemove = (event) => {
            InputManager.mouse_pos = makeVector(event.pageX, event.pageY);
        }

        onwheel = (event) => {
            GameCamera.zoomCamera(event.deltaY / 5000);
        }
    }

    private static keys_down: Array<string> = [];

    private static mouse_pos: Vector = makeVector(0, 0);

    static MousePos(): Vector {
        console.log(InputManager.mouse_pos);
        return InputManager.mouse_pos;
    }

    private static addKey(key: string): void {
        if (!InputManager.keyPressed(key)) {
            InputManager.keys_down.push(key);
        } else {}
    }

    private static removeKey(key: string): void {
        InputManager.keys_down = InputManager.keys_down.filter(char => (char !== key));
        InputManager.keys_down.filter(char => (char === key));
    }

    static keyPressed(key: string): boolean {
        return InputManager.keys_down.includes(key);
    }
}