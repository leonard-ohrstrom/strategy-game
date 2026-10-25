/**
 * Detects keyboard inputs and mouse movement.
 */
import { vectorCopy, vectorMake } from "../../../utils/type_constructors";
import type { Vector } from "../../../utils/types";

export class MachineInputManager {
    static canvas: HTMLCanvasElement | undefined = undefined;

    /** keys which are currently pressed */
    private static active_keys: Set<string> = new Set;
    /** keys which were pressed this frame */
    private static frame_keys: Set<string> = new Set;
    /** mouse position on canvas (screen pixel(x, y)) */
    private static mouse_pos: Vector = vectorMake(0, 0);

    public static init(): void {
        this.canvas = document.querySelector("canvas") as HTMLCanvasElement;

        if (this.canvas) {
            this.setEventListeners();
        } else {
            console.warn("no canvas, not setting event listener!")
        }
    }

    public static newFrame(): void {
        this.frame_keys.clear();
    }

    public static getActiveKeys(): string[] {
        return Array.from(this.active_keys);
    }

    public static getFrameKeys(): string[] {
        return Array.from(this.frame_keys);
    }

    public static mousePos(): Vector {
        return vectorCopy(this.mouse_pos);
    }

    private static setEventListeners(): void {
        if (!this.canvas) {
            console.warn("no canvas, aborting event listener!");
            return;
        }

        // key pressed
        onkeydown = (event) => {
            this.active_keys.add(event.key.toLocaleLowerCase());
            this.frame_keys.add(event.key.toLocaleLowerCase());
        }

        // key no longer pressed
        onkeyup = (event) => {
            this.active_keys.delete(event.key.toLocaleLowerCase());
        }

        // mouse moved
        onmousemove = (event) => {
            this.mouse_pos = vectorMake(event.pageX, event.pageY);
        }

        // mouse key pressed
        this.canvas.addEventListener("mousedown", (event) => {
            let key: string | undefined;

            if (event.button === 0) key = "mouse_left";
            else if (event.button === 1) key = "mouse_middle";
            else if (event.button === 2) key = "mouse_right";

            if (!key) return;

            this.active_keys.add(key);
            this.frame_keys.add(key)
        });

        // mouse key no longer pressed
        this.canvas.addEventListener("mousedown", (event) => {
            let key: string | undefined;

            if (event.button === 0) key = "mouse_left";
            else if (event.button === 1) key = "mouse_middle";
            else if (event.button === 2) key = "mouse_right";

            if (!key) return;

            this.active_keys.delete(key);
        });


        // disable context menu (default opens by right click)
        this.canvas.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
        });
    }
}