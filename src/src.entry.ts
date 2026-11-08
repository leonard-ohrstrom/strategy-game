import { Game } from "./game/game.entry";

export function boot(): void {
    const gameLoop: Game = new Game();
    gameLoop.run();
}

boot();