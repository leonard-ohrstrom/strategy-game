import { RenderLogicManager } from "../../render/render_logic_manager";
import { vectorEquals, vectorToString } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { TroopMovementManager } from "./troop_movement_manager";
import { TagManager } from "./troop_tag_manager";

class Troop {
    // How to identify it
    private troop_tag: string = TagManager.getTag();
    // Who controls it
    private owner_tag: string
    // Where it is
    private position: Vector
    // Where it is going
    private movement: Vector | null = null;
    // Where it will go after current movement
    private movement_queue: Vector[] = [];
    // Percentage (0.00 - 1.00) how much of current movement has been completed.
    private movement_percentage: number = 0;

    constructor(position: Vector, owner_tag: string) {
        this.position = { ...position };
        this.owner_tag = owner_tag;
    }

    public read_tag(): string {
        return this.troop_tag;
    }

    public read_owner(): string {
        return this.owner_tag;
    }

    /**
     * Returns a copy of the troop's position.
     * @returns [Vector] of troop's position on the map
     */
    public read_pos(): Vector {
        return { ...this.position };
    }

    /**
     * Updates the troop's movement status.
     * @param elapsed_time time elapsed since last update in ms
     */
    public update(elapsed_time: number) {
        const arrived: boolean = this.movement_percentage >= 1;
        const completion_time: number = 500; // (milliseconds)
        if (this.movement && arrived) {
            TroopManager.updateTroopPos(this.troop_tag, this.movement); // update position in TroopManager
            this.position = this.movement; // update internal position

            this.movement_percentage -= 1; // decrease movement percentage (retain surplus progress)
            this.movement = this.movement_queue.shift() ?? null; // set movement to next (possibly none)
        } else if (this.movement) {
            this.movement_percentage += (elapsed_time / completion_time);
        } else {
            this.movement = this.movement_queue.shift() ?? null; // see if we have new movement
        }
    }

    /**
     * Sets the troop to a new movement target, cancelling the current and all enqueued movements.
     * @param target_tile Vector of tile position to set
     */
    public setMovement(target_tile: Vector): void {
        const path: Vector[] = TroopMovementManager.getPath(this.troop_tag, this.position, target_tile);

        const new_movement: Vector | null = path.length > 0 ? path[0] : null;

        if (!vectorEquals(new_movement, this.movement)) {
            this.movement_percentage = 0; // if new direction, set movement to 0
        }
        this.movement = new_movement;
        this.movement_queue = path;
    }

    /**
     * Enqueues a given movement target to the troop.
     * @param target_tile Vector of tile position to enqueue
     */
    public enqueueMovement(target_tile: Vector): void {
        let end_point: Vector;
        const queue_not_empty: boolean = this.movement_queue.length > 0;

        if (queue_not_empty) {
            const end_index = this.movement_queue.length - 1;
            end_point = this.movement_queue[end_index];
        } else {
            end_point = this.movement ?? this.position;
        }

        const path: Vector[] = TroopMovementManager.getPath(this.troop_tag, end_point, target_tile);
        this.movement_queue = this.movement_queue.concat(path);
    }

    /**
     * Stop all current and queued movements of the troop.
     */
    public stopMovement(): void {
        this.movement = null;
        this.movement_queue = [];
        this.movement_percentage = 0;
    }
}

export class TroopManager {
    private static troop_by_tag: Map<string, Troop> = new Map;
    private static troops_on_tile: Map<string, string[]> = new Map;
    private static selected_troops: string[] = [];

    public static update(delta_time: number): void {
        this.troop_by_tag.forEach((troop: Troop) => {
            troop.update(delta_time);
        });
    }

    /**
     * Updates a troop's position in the TroopManager. Call **before** actually updating the troop's internal position!
     * @param tag the troop's tag
     */
    public static updateTroopPos(tag: string, new_pos: Vector): void {
        const troop: Troop | undefined = this.troop_by_tag.get(tag);

        if (!troop) {
            console.error(`no troop with tag ${tag} found in tag Map`);
            return
        }

        // remove tag from old position on position Map-Array
        const old_pos_string: string = vectorToString(troop.read_pos());

        let old_pos_troops: string[] = this.getTroopsOnTile(troop.read_pos());

        old_pos_troops = old_pos_troops.filter((tile_troop_tag: string) => {
            return (tile_troop_tag !== tag);
        });

        this.troops_on_tile.set(old_pos_string, old_pos_troops);

        // add tag to new position on position Map-Array
        const new_pos_string: string = vectorToString(new_pos);

        const new_tile_troops: string[] = this.getTroopsOnTile(new_pos);

        new_tile_troops.push(tag);

        this.troops_on_tile.set(new_pos_string, new_tile_troops);
    }

    /**
     * Creates a troop and returns its tag
     * @param position where the troop is to be created
     * @param owner_tag who the troop is to belong to
     * @returns troops unique tag
     */
    public static createTroop(position: Vector, owner_tag: string): string {
        const troop: Troop = new Troop(position, owner_tag);
        const pos_string: string = vectorToString(troop.read_pos());
        const tag = troop.read_tag();

        // add to tag Map
        this.troop_by_tag.set(tag, troop);

        // add to position Map-Array
        const tile_troops: string[] = this.getTroopsOnTile(position);
        tile_troops.push(tag);
        this.troops_on_tile.set(pos_string, tile_troops);

        return troop.read_tag();
    }

    /**
     * Deletes a troop by tag.
     * @param tag a troop's tag
     */
    public static deleteTroop(tag: string): void {
        const troop: Troop | undefined = this.troop_by_tag.get(tag);

        if (!troop) {
            console.error(`no troop with tag ${tag} found in tag Map`);
            return;
        }

        const pos_string = vectorToString(troop.read_pos());
        const tile_troops: string[] | undefined = this.troops_on_tile.get(pos_string);

        if (!tile_troops) {
            console.error(`no Array for ${pos_string} found in positon Map`);
            return;
        }

        tile_troops.filter((tile_troop_tag: string) => {
            tile_troop_tag !== tag;
        });
    }

    /**
     * Checks if a given tile position has any troops on it.
     * @param tile_position Vector of a tile position
     * @returns boolean representing if the tile has any troops on it
     */
    public static tileHasTroops(tile_position: Vector): boolean {
        const has_troops: boolean = this.getTroopsOnTile(tile_position).length > 0;
        return has_troops;
    }

    /**
     * Gets tags of all troops on a given tile.
     * @param tile_position Vector of a tile position
     * @returns copy of Array of all troop tags on tile position
     */
    public static getTroopsOnTile(tile_position: Vector): string[] {
        const pos_string: string = vectorToString(tile_position);
        const troops: string[] = this.troops_on_tile.get(pos_string) ?? [];
        return [...troops];
    }

    public static getTroopByTag(tag: string): Troop | undefined {
        return this.troop_by_tag.get(tag);
    }

    public static getSelectedTroops(): string[] {
        return [...this.selected_troops];
    }

    public static troopSelected(tag: string): boolean {
        return this.selected_troops.includes(tag);
    }

    public static unselectAllTroops(): void {
        this.selected_troops = [];
    }

    public static selectTroop(tag: string): void {
        if (!this.troopSelected(tag)) {
            this.selected_troops.push(tag);
        }
    }

    public static unselectTroop(tag: string): void {
        this.selected_troops.filter((troop_tag: string) => {
            troop_tag !== tag;
        });
    }

    public static setTroopMovement(tag: string, goal: Vector): void {
        const troop: Troop = this.getTroopByTag(tag)!;
        troop.setMovement(goal);
    }

    public static moveTroopsToMouse(): void {
        const tile_on_mouse: Vector | null = RenderLogicManager.tileOnMouse();
    
        if (tile_on_mouse) {
            this.selected_troops.forEach((tag: string) => {
                const troop: Troop = this.getTroopByTag(tag)!;
                troop.setMovement(tile_on_mouse);
            });
        }
    }

    public static enqueueMoveTroopsToMouse(): void {
        const tile_on_mouse: Vector | null = RenderLogicManager.tileOnMouse();
    
        if (tile_on_mouse) {
            this.selected_troops.forEach((tag: string) => {
                const troop: Troop = this.getTroopByTag(tag)!;
                troop.enqueueMovement(tile_on_mouse);
            });
        }
    }

    public static troopForEach(troops: string[] = [...this.selected_troops], troop_fun: (troop: string) => void): void {
        troops.forEach(troop => troop_fun(troop));
    }
}
