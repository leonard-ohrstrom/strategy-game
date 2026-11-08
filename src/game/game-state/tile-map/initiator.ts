import { Tile } from "./tile-map.entry";
import { FileHandler } from "../../../foundation/file-handler";

type OwnerData = string | null;

function dataToTileGrid(geographyGrid: string[][], politicalGrid: OwnerData[][]): Tile[][] {
    const tileGrid: Tile[][] = [];

    for (let x = 0; x < geographyGrid.length; x++) {
        tileGrid[x] = [];
        for (let y = 0; y < geographyGrid[0].length; y++) {
            const terrain: string = geographyGrid[x][y];
            const owner: string | null = politicalGrid[x][y];

            const tile = new Tile(terrain, owner, owner, []);

            tileGrid[x][y] = tile;
        }
    }

    return tileGrid;
}

export async function loadAndWrite(): Promise<void> {
    const geoData: string[][] = await FileHandler.readJSON("/data/tile-map/1936-geo.json");
    console.log("read geo");
    const polData: OwnerData[][] = await FileHandler.readJSON("/data/tile-map/1936-pol.json");
    console.log("read pol");

    const tileMap: Tile[][] = dataToTileGrid(geoData, polData);

    console.log("writing tile-file");
    FileHandler.writeJSON(tileMap, "1936-tile.json");
    console.log("tile file written")
}