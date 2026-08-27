import { RenderLogicManager } from "../../render/render_logic_manager";
import { makeVector, VectorEquals, vectorToString } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { TileMapManager } from "./tile_map";

export class TroopManager {
    private static troop_by_tag: Map<string, Troop> = new Map;
    private static troops_on_tile: Map<string, string[]> = new Map;

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
        const old_pos_string: string = vectorToString(troop.pos());

        let old_pos_troops: string[] = this.getTileTroops(troop.pos());

        old_pos_troops = old_pos_troops.filter((tile_troop_tag: string) => {
            tile_troop_tag !== tag;
        });

        this.troops_on_tile.set(old_pos_string, old_pos_troops);

        // add tag to new position on position Map-Array
        const new_pos_string: string = vectorToString(new_pos);

        const new_tile_troops: string[] = this.getTileTroops(new_pos);

        new_tile_troops.push(tag);

        this.troops_on_tile.set(new_pos_string, new_tile_troops);
    }

    public static setTroopToMouse(): void {
        const tile_on_mouse: Vector | null = RenderLogicManager.tileOnMouse();
        const selected_troop: Troop | null = this.getTroopOnSelectedTile();
    
        if (!tile_on_mouse || !selected_troop) {
            return;
        } else {
            selected_troop.setMovement(tile_on_mouse);
        }
    }

    public static enqueueTroopToMouse(): void {
        const tile_on_mouse: Vector | null = RenderLogicManager.tileOnMouse();
        const selected_troop: Troop | null = this.getTroopOnSelectedTile();
    
        if (!tile_on_mouse || !selected_troop) {
            return;
        } else {
            selected_troop.enqueueMovement(tile_on_mouse);
        }
    }

    private static getTroopOnSelectedTile(): Troop | null {
        const selected_tile: Vector | null = TileMapManager.getSelectedTile();

        if (!selected_tile) {
            return null;
        }

        const troops_on_selected_tile: string[] = TroopManager.getTileTroops(selected_tile);
        const selected_troop_tag: string | undefined = troops_on_selected_tile.pop();

        if (!selected_troop_tag) {
            return null;
        }

        const selected_troop: Troop | undefined = this.troop_by_tag.get(selected_troop_tag);
    
        if (!selected_troop) {
            console.error(`no troop with tag ${selected_troop_tag} found in tag Map`);
            return null;
        }

        return selected_troop;
    }

    /**
     * Creates a troop and returns its tag
     * @param position where the troop is to be created
     * @param owner_tag who the troop is to belong to
     * @returns troops unique tag
     */
    public static createTroop(position: Vector, owner_tag: string): string {
        const troop: Troop = new Troop(position, owner_tag);
        const pos_string: string = vectorToString(troop.pos());
        const tag = troop.tag();

        // add to tag Map
        this.troop_by_tag.set(tag, troop);

        // add to position Map-Array
        const tile_troops = this.getTileTroops(position);
        tile_troops.push(tag);
        this.troops_on_tile.set(pos_string, tile_troops);

        return troop.tag();
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

        const pos_string = vectorToString(troop.pos());
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
        const has_troops: boolean = this.getTileTroops(tile_position).length > 0;
        return has_troops;
    }

    /**
     * Gets tags of all troops on a given tile.
     * @param tile_position Vector of a tile position
     * @returns copy of Array of all troop tags on tile position
     */
    private static getTileTroops(tile_position: Vector): string[] {
        const pos_string: string = vectorToString(tile_position);
        const troops: string[] = this.troops_on_tile.get(pos_string) ?? [];
        return [...troops];
    }
}

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
    // Which texture on map when rendered
    private texture: string = "infantry";

    constructor(position: Vector, owner_tag: string) {
        this.position = { ...position };
        this.owner_tag = owner_tag;
    }

    public tag(): string {
        return this.troop_tag;
    }

    public owner(): string {
        return this.owner_tag;
    }

    /**
     * Returns a copy of the troop's position.
     * @returns [Vector] of troop's position on the map
     */
    public pos(): Vector {
        return { ...this.position };
    }

    /**
     * Updates the troop's movement status.
     * @param elapsed_time time elapsed since last update in ms
     */
    public update(elapsed_time: number) {
        const arrived: boolean = this.movement_percentage >= 1;
        const completion_time: number = 1000; // (milliseconds)
        if (this.movement && arrived) {
            // update position in TroopManager
            TroopManager.updateTroopPos(this.troop_tag, this.movement);
            // update internal position
            this.position = this.movement;
            // decrease movement percentage (retain surplus progress)
            this.movement_percentage -= 1;
            // set movement to none
            this.movement = null;
        } else if (this.movement) {
            this.movement_percentage += (elapsed_time / completion_time);
        } else {
            this.movement = this.movement_queue.shift() ?? null;
        }
    }

    /**
     * Sets the troop to a new movement target, cancelling the current and all enqueued movements.
     * @param target_tile Vector of tile position to set
     */
    public setMovement(target_tile: Vector): void {
        const path: Vector[] = TileMapManager.getPath(this.position, target_tile);
    
        this.movement = null;
        this.movement_percentage = 0;
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
            const end_index = this.movement_queue.length--;
            end_point = this.movement_queue[end_index];
        } else {
            end_point = this.movement ?? this.position;
        }

        const path: Vector[] = TileMapManager.getPath(end_point, target_tile);
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

class TagManager {
    private static free_tags: string[] = [];
    private static tag_size: number = 0;

    /**
     * Gives a unique tag
     * @returns string of a unique tag
     */
    public static getTag(): string {
        const available_tags: boolean = this.free_tags.length > 0;
    
        if (available_tags) {
            return this.free_tags.shift()!;
        } else {
            this.tag_size++;
            this.free_tags = this.generateTags(this.tag_size);
            return this.free_tags.shift()!;
        }
    }

    /**
     * Stores a string in the pool of unused tags
     * @param tag a tag (string)
     */
    public static returnTag(tag: string): void {
        this.free_tags.push(tag);
    }

    /**
     * Generates an Array of strings consisting of combinations of letters a-z.
     * @param tag_length How many letters a given tag should consist of
     * @returns an Array of length 26^tag_length, containing all possible letter combinations.
     */
    private static generateTags(tag_length: number): string[] {
        function appendAsciis(strings: string[], start_ascii: number, end_ascii: number): string[] {
            if (start_ascii > end_ascii) {
                return appendAsciis(strings, end_ascii, start_ascii);
            }

            const appended_strings: string[] = [];

            strings.forEach((string: string) => {
                for (let char_ascii = start_ascii; char_ascii <= end_ascii; char_ascii++) {
                    const char: string = String.fromCharCode(char_ascii);
                    appended_strings.push(string.concat(char));
                }
            });

            return appended_strings;
        }

        const a_ascii: number = 97;
        const z_ascii: number = 122;

        let tags: string[] = [""];

        for (tag_length; tag_length > 0; tag_length--) {
            tags = appendAsciis(tags, a_ascii, z_ascii);
        }

        return tags;
    }
}