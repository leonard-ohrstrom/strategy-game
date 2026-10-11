/**
 * Initial code
 * (npm run dev)
 */

import { codeTest } from "../game/boot/code_test";
import { boot } from "../game/boot/boot";
import { gameTest } from "../game/boot/game_test";

const game_testing: boolean = false;
if (game_testing) {
    gameTest();
} else {
    codeTest();
    await boot();
}