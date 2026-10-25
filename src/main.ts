import { codeTest } from "./tests/code_test";
import { boot } from "./game/boot/boot";
import { gameTest } from "./tests/game_test";

const game_testing: boolean = false;

if (game_testing) {
    gameTest();
} else {
    codeTest();
    boot();
}