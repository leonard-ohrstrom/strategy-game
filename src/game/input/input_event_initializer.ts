/**
 * Detects keyboard inputs and mouse movement, and sends corresponding
 * information forward to InputManager.
 */
import { vectorMake } from "../../types/type_constructors";
import { InputManager } from "./input_manager";

export class InputEventInitializer {
    static canvas: HTMLCanvasElement | undefined = undefined;

    public static init(): void {
        this.canvas = document.querySelector("canvas") as HTMLCanvasElement;

        if (this.canvas) {
            this.setEventListeners();
        } else {
            console.warn("no canvas, not setting event listener!")
        }
    }

    private static setEventListeners(): void {
        if (!this.canvas) {
            console.warn("no canvas, aborting event listener!");
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
            InputManager.setMousePos(vectorMake(event.pageX, event.pageY));
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