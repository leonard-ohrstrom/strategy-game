/**
 * Game camera for navigating map, keeps track of it's own position (x, y) as
 * well as how zoomed in it is.
 */
import type { Vector } from "../types/types";
import { vectorMake } from "../types/type_constructors";

export class GameCamera {
    private static pos: Vector = vectorMake(0, 0);
    static getPos(): Vector { return this.pos }
    static incrementPos(x: number, y: number): void {
        this.pos = vectorMake(this.pos.x + x, this.pos.y + y)
    }
    static getZoom(): number { return ZoomManager.getZoom() }
    static getZoomLevel(): number { return ZoomManager.getZoomLevel() }
    static setPos(pos: Vector) { this.pos = pos }
    static zoomIn(): void { ZoomManager.zoomIn() }
    static zoomOut(): void { ZoomManager.zoomOut() }
}

class ZoomManager {
    private static zoom_level: number = 3;
    private static max_zoom_level: number = 1;
    private static min_zoom_level: number = 8;

    private static zoomBound(n: number): number {
        return Math.min(Math.max(this.max_zoom_level, n), this.min_zoom_level);
    }

    public static getZoom(): number {
        switch(this.zoom_level) {
            case 8: return 1/128;
            case 7: return 1/64;
            case 6: return 1/32;
            case 5: return 1/16;
            case 4: return 1/8;
            case 3: return 1/4;
            case 2: return 1/2;
            case 1: return 1;
            default: console.error("zoomManager get_zoom missing case"); return 0;
        }
    }

    public static getZoomLevel(): number {
        return this.zoom_level;
    }

    public static zoomIn(): void { this.zoom_level = this.zoomBound(this.zoom_level - 1) }
    public static zoomOut(): void { this.zoom_level = this.zoomBound(this.zoom_level + 1) }
    public static setZoom(zoom: number): void {this.zoom_level = zoom}
}