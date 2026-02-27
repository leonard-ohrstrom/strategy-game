// npm run dev

import { GameMap } from "./game/map.ts";
import {} from"./game/ticker.ts"


GameMap.constructGrid(8, 8);
GameMap.addTroopToTile(0, 0);
GameMap.addTroopToTile(2, 6);
GameMap.selectTile(2, 6);