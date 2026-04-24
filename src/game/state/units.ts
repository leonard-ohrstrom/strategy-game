import { loadConfig } from "../../types/file_parser";
import type { Vector } from "../../types/types";
import { TileMapManager } from "./tile_map";

/**
 * An instance of a land based unit.
 */
export class troop {
    private unit: string
    private position: Vector
    private movement_path: Vector | null
    private movement_progress: number

    constructor(unit: string, position: Vector) {
        this.unit = unit;
        this.position = position;
        this.movement_path = null;
        this.movement_progress = 0;
    }

    readUnit(): string {
        return this.unit;
    }

    readPosition(): Vector {
        return this.position;
    }

    readMovement(): Vector | null {
        return this.movement_path;
    }

    startMovement(goal_tile: Vector): void {
        const is_new_movement: boolean = !(this.movement_path === goal_tile);
        const is_valid_direction: boolean = TileMapManager.positionExists(goal_tile);
        if (is_new_movement && is_valid_direction) {
            this.movement_path = goal_tile;
            this.movement_progress = 0;
        } else if (!is_valid_direction) {
            console.error("invalid movement of unit:", this.unit, "to tile:", goal_tile);
        }
    }

    stopMovement(): void {
        this.movement_path = null;
        this.movement_progress = 0;
    }

    inMovement(): boolean {
        return this.movement_path !== null;
    }

    readMovementProgress(): number {
        return this.movement_progress;
    }

    updateMovement(game_hours: number): void {}
}

/**
 * Manages reading and returning data for units' actions. Should only be used by troop class besides
 * initialisation.
 */
export class UnitManager {
}