/**
 * Detects keyboard inputs and mouse movement, and sends corresponding
 * information forward to InputManager.
 */
import { makeVector } from "../../types/type_constructors";
import { InputManager } from "./input_manager";

export class InputEventManager {
    static init(): void {}
    static {
        onkeydown = (event) => {
            InputManager.addKey(event.key.toLocaleLowerCase());
            InputManager.pressedKey(event.key.toLocaleLowerCase());
        }
        onkeyup = (event) => {
            InputManager.removeKey(event.key.toLocaleLowerCase());
        }
        onmousemove = (event) => {
            InputManager.setMousePos(makeVector(event.pageX, event.pageY));
        }
    }
}