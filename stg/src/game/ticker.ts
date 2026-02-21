import { RenderManager } from "../rendering/render";
import { canvasFittedToBrowser, clearCanvas, fitCanvasToBrowser } from "../rendering/canvas";
import { GameMap } from "./map";
import { GameCamera } from "./camera";
import { ControlManager } from "../inputs/controls";

let old_time = 0;

function ticker(time: number) {
    const delta_time = time - old_time;
    old_time = time;
    RenderManager.clearRenderQueue();
    clearCanvas();
    if (!canvasFittedToBrowser()) {
        fitCanvasToBrowser();
    } else {}
    ControlManager.tickControls();
    GameMap.drawMap(GameCamera.getPosition().x, GameCamera.getPosition().y, GameCamera.getZoom());
    RenderManager.RenderQueue();
    requestAnimationFrame(ticker);
}

requestAnimationFrame(ticker);