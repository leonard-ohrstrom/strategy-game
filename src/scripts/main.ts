/**
 * Initial code
 * (npm run dev)
 */

import { codeTest } from "../game/init/code_test";
import { boot } from "../game/init/boot";
import { gameTest } from "../game/init/game_test";

const game_testing: boolean = false;
if (game_testing) {
    gameTest();
} else {
    codeTest();
    await boot();
}