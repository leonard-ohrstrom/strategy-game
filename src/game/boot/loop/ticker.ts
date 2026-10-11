/**
 * Continously self-repeating function necessary for creating new frames, sends time
 * elapsed since last tick to GameStateManager every tick.
 */
import { GameUpdateManager } from "./game_update_manager";

let last_tick: number | null = null;
async function ticker(current_time: number) {
    if (!last_tick) { last_tick = current_time }
    const delta_time: number = current_time - last_tick;
    await GameUpdateManager.update(delta_time);
    last_tick = current_time;
    requestAnimationFrame(ticker);
}

export function startTicker(): void {
    requestAnimationFrame(ticker);
}