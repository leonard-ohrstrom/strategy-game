/**
 * Runs code in right order necessary for program to start correctly.
 */
import { TextureManager } from "../../render/texture_manager";
import { TileMapManager } from "../logic/tile_map_manager";
import { startTicker } from "./loop/ticker";
import { RenderManager } from "../../render/render_manager";
import { CountryManager } from "../logic/country_manager";
import { GameCamera } from "../../render/game_camera";
import { vectorMake } from "../../types/type_constructors";
import { InputManager } from "../input/input_manager";

async function buildMap(): Promise<void> {
    await TileMapManager.loadMapFile();
    // zoomToSweden();
    // TileMapManager.makeGrid(32, 32);
    // initTileOwners();
}

function zoomToSweden(): void {
    GameCamera.setPos(vectorMake(195000, 15500));
    GameCamera.zoomOut();
    GameCamera.zoomOut();
}

function initTileOwners(): void {
    console.warn("initTileOwners currently setting owners manually (Sweden and Denmark)")
    // Sweden North
    for (let x = 0; x <= 31; x++) {
        for (let y = 0; y <= 15; y++) {
            TileMapManager.setOwner(x, y, "SWE");
        }
    }
    // Denmark south
    for (let x = 0; x <= 31; x++) {
        for (let y = 16; y <= 31; y++) {
            TileMapManager.setOwner(x, y, "DEN");
        }
    }
}

export async function boot(): Promise<void> {
    console.log("initialising countries")
    await CountryManager.init();
    console.log("initialising textures");
    await TextureManager.init();
    console.log("initialising renders")
    await RenderManager.init();
    console.log("building map");
    await buildMap();
    console.log("initialising inputs")
    await InputManager.init();
    console.log("starting ticker")
    startTicker();
}