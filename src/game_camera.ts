/**
 * Game camera for navigating map, keeps track of it's own position (x, y) as
 * well as how zoomed in it is.
 */
import type { Vector } from "./types";
import { makeVector } from "./type_constructors";

export class GameCamera {
    private static pos: Vector = makeVector(0, 0);
    private static zoom: number = 0;
    static getPos(): Vector { return this.pos }
    static getZoom(): number { return this.zoom }
    static setPos(pos: Vector) { this.pos = pos }
    static setZoom(zoom: number) { this.zoom = zoom }
}