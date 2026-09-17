import { TroopManager } from "../game/state/troop_manager";
import { Tile, TileMapManager } from "../game/state/tile_map";
import { makeVector } from "../types/type_constructors";
import type { Vector } from "../types/types";

function getElement(id: string): HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement;
}
const apply_button: HTMLInputElement = getElement("god_apply_button");
apply_button.onclick = applyGodMenu;

function applyGodMenu() {
    const tile_x: number = Number(getElement("god_tile_x").value);
    const tile_y: number = Number(getElement("god_tile_y").value);
    const action: string = getElement("god_action").value;
    const input: string = getElement("god_input").value;
    switch(action) {
        case "terrain":
            TileMapManager.setTerrain(tile_x, tile_y, input);
            break;
        case "troop_add":
            TroopManager.createTroop(makeVector(tile_x, tile_y), input);
            break;
        case "troop_remove":
            TroopManager.deleteTroop(input);
            break;
        case "owner":
            TileMapManager.setOwner(tile_x, tile_y, input);
            break;
        case "read_tile":
            const tile: Tile = TileMapManager.readTile(tile_x, tile_y);
            console.log(tile);
            break;
        case "read_tile_troops":
            const troops: string[] = TroopManager.getTroopsOnTile(makeVector(tile_x, tile_y));
            console.log(troops);
            break;
        default:
            console.error("invalid God Menu action:", action);
            break;
    }
    getElement("god_tile_x").value = "";
    getElement("god_tile_y").value = "";
    getElement("god_input").value = "";
}

export function godMenuSelectTile(tile_pos: Vector): void {
    getElement("god_tile_x").value = tile_pos.x.toString();
    getElement("god_tile_y").value = tile_pos.y.toString();
}