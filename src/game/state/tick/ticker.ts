/**
 * Constantly repeating function necessary for creating new frames, sends time
 * elapsed since last tick to GameStateManager every tick.
 */
import { GameStateManager } from "./game_state_manager";

let last_tick: number | null = null;
function ticker(current_time: number) {
    if (!last_tick) { last_tick = current_time }
    const delta_time = current_time - last_tick;
    GameStateManager.update(delta_time);
    last_tick = current_time;
    requestAnimationFrame(ticker);
}
export function startTicker(): void {
    requestAnimationFrame(ticker);
}