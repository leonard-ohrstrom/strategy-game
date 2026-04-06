/**
 * Game camera for navigating map, keeps track of it's own position (x, y) as
 * well as how zoomed in it is.
 */
import type { Vector } from "../types/types";
import { makeVector } from "../types/type_constructors";

export class GameCamera {
    private static pos: Vector = makeVector(0, 0);
    static getPos(): Vector { return this.pos }
    static incrementPos(x: number, y: number): void {
        this.pos = { x: this.pos.x + x, y: this.pos.y + y }
    }
    static getZoom(): number { return zoomManager.getZoom() }
    static setPos(pos: Vector) { this.pos = pos }
    static zoomIn(): void { zoomManager.zoomIn() }
    static zoomOut(): void { zoomManager.zoomOut() }
}

class zoomManager {
    private static min_zoom_level: number = 1;
    private static max_zoom_level: number = 2;
    private static zoom_level: number = this.min_zoom_level;
    private static zoomBound(n: number): number {
        return Math.min(Math.max(this.min_zoom_level, n), this.max_zoom_level);
    }
    static getZoom(): number {
        switch(this.zoom_level) {
            case 1: return 0.5;
            case 2: return 1;
            default: console.error("zoomManager get_zoom missing case"); return 0;
        }
    }
    public static zoomIn(): void { this.zoom_level = this.zoomBound(this.zoom_level + 1) }
    public static zoomOut(): void { this.zoom_level = this.zoomBound(this.zoom_level - 1) }
}