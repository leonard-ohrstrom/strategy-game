/**
 * Knows what keys are active and not, as well as mouse's position, and can
 * perform appropriate action if any input or mouse position has an effect tied
 * to it.
 */

import { InputActionManager, type InputFn, type InputActionMap } from "./helpers/input_action_manager";
import { MachineInputManager } from "./helpers/machine_input_manager";

export class InputManager {
    public static init(): void {
        InputActionManager.init();
        MachineInputManager.init();
    }

    public static update(delta_time: number): void {
        this.updateInputActions(delta_time);
        MachineInputManager.newFrame();
    }

    /// helper for method updateKeyActions
    private static ifActionDoKey(keys: string[], actionMap: InputActionMap, delta_time: number) {
        keys.forEach(key => {
            const key_action: InputFn | undefined = actionMap.get(key);
            if (key_action) key_action(delta_time);
        });
    }

    private static updateInputActions(delta_time: number): void {
        this.ifActionDoKey(MachineInputManager.getActiveKeys(), InputActionManager.getActionMap("normal"), delta_time);
        this.ifActionDoKey(MachineInputManager.getFrameKeys(), InputActionManager.getActionMap("frame"), delta_time);
        InputActionManager.updateMouse(MachineInputManager.mousePos());
    }
}