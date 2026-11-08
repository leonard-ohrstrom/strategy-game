import { expect, test, vi, beforeEach, afterEach } from 'vitest'
import { Game } from './.game';

//////////////
/// Vitest ///
//////////////

// mock requestAnimationFrame

beforeEach(() => {
    vi.stubGlobal(
        "requestAnimationFrame",
        (callback: FrameRequestCallback) =>
            setTimeout(() => callback(performance.now()), 16)
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

/////////////
/// TESTS ///
/////////////

test('construct game loop', () => {
    const gameLoop: Game = new Game();
    expect(gameLoop).toBeInstanceOf(Game);
});

test('run gameloop (no crash)', () => {
    const gameLoop: Game = new Game();
    gameLoop.run();
});