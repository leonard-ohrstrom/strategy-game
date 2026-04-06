import { TileMapManager } from "../game/state/tile_map";

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
        case "troops":
            const amount = Number(input);
            TileMapManager.setTroops(tile_x, tile_y, amount);
            break;
        case "owner":
            TileMapManager.setOwner(tile_x, tile_y, input);
            break;
        case "read":
            const tile = TileMapManager.readTile(tile_x, tile_y);
            console.log(tile);
            break;
        default:
            console.error("invalid God Menu action:", action);
            break;
    }
    getElement("god_tile_x").value = "";
    getElement("god_tile_y").value = "";
    getElement("god_input").value = "";
}