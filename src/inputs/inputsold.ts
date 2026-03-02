import { makeVector, type Vector } from "../types/typesold.ts";
import { GameCamera } from "../game/cameraold.ts";
import { getCanvasCentre } from "../rendering/canvasold.ts";

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
            GameCamera.scaleCamera(event.deltaY / 5000);
        }
    }

    private static keys_down: Array<string> = [];

    private static mouse_pos: Vector = getCanvasCentre();

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