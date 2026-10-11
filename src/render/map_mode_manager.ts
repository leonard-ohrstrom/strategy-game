export class MapModeManager {
    private static map_mode: string = "tactical";
    private static valid_map_modes: string[] = ["political", "terrain", "tactical"];

    public static getMapMode(): string {
        return this.map_mode;
    }

    public static setMapMode(mode: string): void {
        if (this.valid_map_modes.includes(mode)) {
            this.map_mode = mode;
        } else {
            console.error(`Unable to set map mode to "${mode}"`);
        }
    }

    public static stepMapMode(): void {
        const mode_max_modulu: number = this.valid_map_modes.length;
        let map_mode_index: number = this.valid_map_modes.indexOf(this.map_mode);

        map_mode_index = (map_mode_index + 1) % mode_max_modulu;
        this.map_mode = this.valid_map_modes[map_mode_index];
    }
}
