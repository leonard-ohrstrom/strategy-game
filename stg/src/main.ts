// npm run dev

console.log("GOLF ECHO ECHO KILO");

import {} from "./rendering/render"
import {} from "./inputs/inputs.ts"
import {} from"./game/ticker.ts"
import { GameMap } from "./game/map.ts";

GameMap.constructGrid(8, 8);
GameMap.addTroopToTile(0, 0);
GameMap.addTroopToTile(2, 6);
GameMap.selectTile(2, 6);