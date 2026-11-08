import { GameState } from "../game-state/game-state.entry";
import { CombatUpdater } from "./combat-update";
import { DiplomacyUpdater } from "./diplomacy-update";
import { MilitaryUpdater } from "./military-update";
import { TileUpdater } from "./tile-update";

export class GameUpdate {
    private timeSinceTick: number;

    private diplomacyUpdater: DiplomacyUpdater;
    private militaryUpdater: MilitaryUpdater;
    private combatUpdater: CombatUpdater;
    private tileUpdater: TileUpdater;

    public constructor() {
        this.timeSinceTick = 0;

        this.diplomacyUpdater = new DiplomacyUpdater();
        this.militaryUpdater = new MilitaryUpdater();
        this.combatUpdater = new CombatUpdater();
        this.tileUpdater = new TileUpdater();
    }

    public update(gameState: GameState, deltaTime: number) {
        const isPaused: boolean = gameState.paused;
        const hasTimeIntervalPassed = () => deltaTime >= gameState.getUpdateInterval();

        if (!isPaused && hasTimeIntervalPassed()) {
            this.tick(gameState);
            this.timeSinceTick = 0;
        } else if (!isPaused) {
            this.timeSinceTick += deltaTime;
        }
    }

    public tick(gameState: GameState) {
        this.diplomacyUpdater.tick(gameState);
        this.militaryUpdater.tick(gameState);
        this.combatUpdater.tick(gameState);
        this.tileUpdater.tick(gameState);
    }
}