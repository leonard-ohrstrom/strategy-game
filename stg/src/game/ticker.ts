import { RenderManager } from "../rendering/render";
import { isCanvasFittedToBrowser, clearCanvas, fitCanvasToBrowser } from "../rendering/canvas";
import { GameMap } from "./map";
import { GameCamera } from "./camera";
import { ControlManager } from "../inputs/controls";

let old_time = 0;

// ts needs to be fixed

// loop
function ticker(time: number) {
    const delta_time = time - old_time;
    old_time = time;
    tick(delta_time);
    requestAnimationFrame(ticker);
}

// what is done each tick
function tick(delta_time: number) {
    delta_time;
    RenderManager.clearRenderQueue();
    clearCanvas();
    if (!isCanvasFittedToBrowser()) {
        fitCanvasToBrowser();
    } else {}
    ControlManager.tickControls();
    GameMap.drawMap(GameCamera.getPosition().x, GameCamera.getPosition().y, GameCamera.getZoom());
    RenderManager.RenderQueue();
    const map_centre =GameMap.map_centre;
    RenderManager.drawLine(0, 0, map_centre.x, map_centre.y);
    RenderManager.drawCircle(map_centre.x, map_centre.y)
}

requestAnimationFrame(ticker);