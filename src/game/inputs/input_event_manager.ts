/**
 * Detects keyboard inputs and mouse movement, and sends corresponding
 * information forward to InputManager.
 */
import { makeVector } from "../../types/type_constructors";
import { InputManager } from "./input_manager";

export class InputEventManager {
    static canvas: HTMLCanvasElement | undefined = undefined;

    static init(): void {
        this.canvas = document.querySelector("canvas") as HTMLCanvasElement;

        if (this.canvas) {
            this.setEventListeners();
        }
    }

    static setEventListeners(): void {
        if (!this.canvas) {
            console.warn("no event listener");
            return;
        }

        // key pressed
        onkeydown = (event) => {
            InputManager.addKey(event.key.toLocaleLowerCase());
            InputManager.pressedKey(event.key.toLocaleLowerCase());
        }

        // key no longer pressed
        onkeyup = (event) => {
            InputManager.removeKey(event.key.toLocaleLowerCase());
        }

        // mouse moved
        onmousemove = (event) => {
            InputManager.setMousePos(makeVector(event.pageX, event.pageY));
        }

        // mouse key pressed
        this.canvas.onmousedown = (event: MouseEvent) => {
            InputManager.pressedMouseKey(event.button.toLocaleString());
        }

        // double click
        this.canvas.ondblclick = () => {
            InputManager.pressedMouseKey("dblclick");
        }

        // disable context menu (right click)
        this.canvas.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
        });
    }
}