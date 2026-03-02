/**
 * Knows what keys are active and not, as well as mouse's position, and can
 * perform appropriate action if any input or mouse position has an effect tied
 * to it.
 */
import type { Vector } from "./types";
import { makeVector } from "./type_constructors";

export class InputManager {
    private static active_keys: Set<string> = new Set();
    private static mouse_pos: Vector = makeVector(0, 0);
    static addKey(key: string): void { this.active_keys.add(key) }
    static removeKey(key: string): void { this.active_keys.delete(key) }
    static setMousePos(pos: Vector): void { this.mouse_pos = pos }
    static getMousePos(): Vector { return this.mouse_pos }
    private static isKeyActive(key: string) { return this.active_keys.has(key) }
    static updateKeyAction(): void {} // for each action key if active do action
    static updateMouseAction(): void {} // for each mouse pos condition if true do action
}