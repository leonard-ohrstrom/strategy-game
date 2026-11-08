import { Game } from "./game/.game";

export function boot(): void {
    const gameLoop: Game = new Game();
    gameLoop.run();
}

boot();