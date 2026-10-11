import { vectorCopy, vectorDistance, vectorEquals, vectorFromString, vectorToString } from "../../types/type_constructors";
import type { Vector } from "../../types/types";
import { Tile, TileMapManager } from "./tile_map_manager";

class NodeLink {
    public position: Vector;
    public next: Vector | null = null;

    constructor(position: Vector) {
        this.position = position;
    }
}

export class TroopMovementManager {
    /**
     * Finds path from one tile to another for a given troop. Ensure tile positions are in offset format before invoking.
     * @param troop_tag (string) troop tag
     * @param start (Vector) starting tile in offset format
     * @param target (Vector) target tile in offset format
     * @returns (Vector[]) path from start to end, not including start tile
     */
    public static getPath(troop_tag: string, start: Vector, target: Vector): Vector[] {
        console.log("get path")
        /** Heuristic distance from start to node */
        function g(n: string): number {
            const n_v: Vector = vectorFromString(n);
            return vectorDistance(start, n_v);
        }

        /** Heuristic distance from node to target */
        function h(n: string): number {
            const n_v: Vector = vectorFromString(n);
            return vectorDistance(n_v, target);
        }

        /** Heuristic distance from start to node to target */
        function f(n: string): number {
            return g(n) + h(n);
        }

        const to_search: Set<string> = new Set;
        const processed: Set<string> = new Set;
        const path_history: Map<string, Vector[]> = new Map;

        let found_path: boolean = false;

        to_search.add(vectorToString(start));
        path_history.set(vectorToString(start), []);
        while (to_search.size > 0 && !found_path) {
            let current: string = to_search.values().next().value!;

            to_search.forEach(tile => {
                if (f(tile) < f(current) || f(tile) === f(current) && h(tile) < h(current)) {
                    current = tile;
                }
            });

            processed.add(current);
            to_search.delete(current);

            const current_v: Vector = vectorFromString(current);
            const neighbours: Vector[] = TileMapManager.getNeighbours(current_v, v => TroopMovementManager.validMovement(troop_tag, current_v, v));
            neighbours.forEach(neighbour_v => {
                const neighbour: string = vectorToString(neighbour_v);

                const in_search: boolean = to_search.has(neighbour);
                const in_processed: boolean = processed.has(neighbour);

                if (!in_search && !in_processed) {
                    to_search.add(neighbour);

                    const current_history: Vector[] = path_history.get(current)!;
                    const neighbour_history: Vector[] = current_history.concat([neighbour_v]);
                    path_history.set(neighbour, neighbour_history);
                }

                if (vectorEquals(neighbour_v, target)) {
                    console.log("path found");
                    found_path = true;
                    return;
                }
            });
        }

        return path_history.get(vectorToString(target)) ?? [];
    }

    /**
     * Determines if a given troop is allowed to move from 'position' to 'movement' 
     * ***(ensure 'movement' is neighbour of 'position' before invoking method)***
     * @param troop_tag a troop tag
     * @param position_vec a position
     * @param movement_vec a neighbouring position
     * @returns boolean representing if given troop can move from position to movement
     */
    private static validMovement(troop_tag: string, position_vec: Vector, movement_vec: Vector): boolean {
        const position: Tile = TileMapManager.readTile(position_vec.x, position_vec.y);
        const movement: Tile = TileMapManager.readTile(movement_vec.x, movement_vec.y);

        const land_walk: boolean = position.getTerrain() != "water" && movement.getTerrain() != "water";
        if (!land_walk) {
            return false;
        }

        return true;
    }
}