import { loadConfig } from "../../types/file_parser";

type Battalion = {
    attack: number,
    defence: number,
    speed: number
}

export class DivisionManager {
    private static battalion_config: Record<string, Battalion>

    static async init(): Promise<void> {
        this.battalion_config = await loadConfig('./data/units/battalion_config.ini');
    }
}