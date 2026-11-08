import { Vector } from "../../foundation/vector";

export class MouseListener {
    private mousePos: Vector;
    private mouseActiveKeys: Set<string>;
    private mouseFrameKeys: Set<string>;

    private getMouseKey(button: number): string | undefined {
        if (button === 0) return "mouseLeft";
        if (button === 1) return "mouseMiddle";
        if (button === 2) return "mouseRight";

        return undefined;
    }

    private initiateEventListener(canvas: HTMLCanvasElement) {
        window.addEventListener("mousemove", (event) => {
            this.mousePos = new Vector(event.pageX, event.pageY);
        });

        canvas.addEventListener("mousedown", (event) => {
            const key: string | undefined = this.getMouseKey(event.button);

            if (key) {
                this.mouseActiveKeys.add(key);
                this.mouseFrameKeys.add(key);
            }
        });

        window.addEventListener("mouseup", (event) => {
            const key: string | undefined = this.getMouseKey(event.button);

            if (key) {
                this.mouseActiveKeys.delete(key);
            }
        });

        window.addEventListener("blur", () => { // clear active keys on tab out
            this.mouseActiveKeys.clear();
            this.mouseFrameKeys.clear();
        });

        canvas.addEventListener("contextmenu", (event) => { // prevents context menu on right click
            event.preventDefault();
        });
    }

    public constructor(canvas: HTMLCanvasElement) {
        this.mousePos = new Vector(0, 0);
        this.mouseActiveKeys = new Set<string>();
        this.mouseFrameKeys = new Set<string>();

        this.initiateEventListener(canvas);
    }

    public newFrame(): void {
        this.mouseFrameKeys.clear();
    }

    public position(): Vector {
        return Vector.copy(this.mousePos);
    }

    public keyActive(key: string): boolean {
        return this.mouseActiveKeys.has(key);
    }

    public keyPressed(key: string): boolean {
        return this.mouseFrameKeys.has(key);
    }
}