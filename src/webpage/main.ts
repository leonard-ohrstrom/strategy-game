/**
 * Initial code
 * (npm run dev)
 */
import { boot } from "../game/init/boot"
import { codeTest } from "../game/init/code_test";
import { gameTest } from "../game/init/game_test";
codeTest();
await boot();
gameTest();