export class KeyboardListener {
    private activeKeys: Set<string>;
    private frameKeys: Set<string>;

    private initiateKeyListeners(): void {
        window.addEventListener("keydown", (event) => {
            const key: string = event.code.toLowerCase();

            this.activeKeys.add(key);
            this.frameKeys.add(key);
        });

        window.addEventListener("keyup", (event) => {
            const key: string = event.code.toLowerCase();

            this.activeKeys.delete(key);
        });

        window.addEventListener("blur", () => { // clear active keys on tab out
            this.activeKeys.clear();
            this.frameKeys.clear();
        });
    }

    public constructor() {
        this.activeKeys = new Set;
        this.frameKeys = new Set;

        this.initiateKeyListeners();
    }

    public newFrame(): void {
        this.frameKeys.clear();
    }

    public keyActive(key: string): boolean {
        return this.activeKeys.has(key);
    }

    public keyPressed(key: string): boolean {
        return this.frameKeys.has(key);
    }
}