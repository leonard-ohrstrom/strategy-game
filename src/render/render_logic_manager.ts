/**
 * Fetches information from other aspects of game to interpret and send to
 * RenderManager as medium level abstraction instructions of what to draw.
 */
import { RenderManager } from "./render_manager";
import { TextureManager } from "./texture_manager";
import { TileMapManager } from "../game/state/tile_map";
import { makeRectangle, makeVector } from "../types/type_constructors";
import type { Rectangle, Vector } from "../types/types";
import { GameCamera } from "../game/inputs/game_camera";
import { getCanvasCentre } from "./canvas_context";

type RenderOrder = { texture: string, target: Rectangle }
type RenderQueue = [Array<RenderOrder>, Array<RenderOrder>]

export class RenderLogicManager {
    private static render_queue: RenderQueue = [[], []];
    private static resetRenderQueue(): void { this.render_queue = [[], []] }
    static update() {
        RenderManager.clear();
        this.enqueueTiles();
        this.renderQueuedRenders();
        this.resetRenderQueue();
    }
    private static renderQueuedRenders(): void {
        this.render_queue.forEach(render_layer => {
            render_layer.forEach(render_order => RenderManager.render(
                render_order.texture,
                render_order.target
            ))
        });
    }
    private static pushToQueue(order: RenderOrder, layer: number): void {
        this.render_queue[layer].push(order);
    }
    private static enqueueTiles(): void {
        const tile_dimensions: Rectangle = TextureManager.getDimensions("tile");
        const tile_size: Vector = makeVector(tile_dimensions.height, tile_dimensions.width);
        const width = TileMapManager.readWidth();
        const height = TileMapManager.readHeight();
        const camera: Vector = GameCamera.getPos();
        const zoom: number = GameCamera.getZoom();
        const centre: Vector = getCanvasCentre();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const tile_texture = TileMapManager.readTile(x, y).terrain;
                let target_dimensions: Rectangle;
                const start_x = tile_size.x * x;
                const start_y = tile_size.y * y;
                const even_layer = y % 2 === 0;
                if (even_layer) {
                    target_dimensions = makeRectangle(start_x,
                                                      start_y * 0.75,
                                                      start_x + tile_size.x,
                                                      start_y * 0.75 + tile_size.y);
                } else {
                    target_dimensions = makeRectangle(start_x + 0.5 * tile_size.x,
                                                      start_y * 0.75,
                                                      start_x + 1.5 * tile_size.x,
                                                      start_y * 0.75 + tile_size.y);
                }
                // adjust for camera position
                target_dimensions = translateRectangle(target_dimensions, -camera.x, -camera.y);
                // adjust for camera zoom
                target_dimensions = scaleByFocalPoint(target_dimensions, centre, zoom);
                const tile_render: RenderOrder = {texture: tile_texture, target: target_dimensions}
                this.pushToQueue(tile_render, 0);
            }
        }
    }
}
/**
 * Translates (moves) a given rectangle by an x and y amount
 * @param shape a given shape to translate
 * @param x amount to move in x-direction
 * @param y amount to move in y-direction
 * @returns the given shape translated by (x, y)
 */
function translateRectangle(shape: Rectangle, x: number, y: number): Rectangle {
    const x0: number = shape.position.x + x;
    const y0: number = shape.position.y + y;
    const x1: number = x0 + shape.width;
    const y1: number = y0 + shape.height;
    return makeRectangle(x0, y0, x1, y1);
}
/**
 * Scales a Rectangle around a given focal point.
 * @param focal_point Vector describing focal point in absolute position
 * @param shape Rectangle before scaling
 * @param factor how much to scale the given shape by
 * @returns shape scaled by factor around focal point
 */
function scaleByFocalPoint(shape: Rectangle, focal_point: Vector, factor: number): Rectangle {
    let x0: number = shape.position.x;
    let y0: number = shape.position.y;
    let x1: number = x0 + shape.width;
    let y1: number = y0 + shape.height;
    // shift shape such that focal point is on origin (0, 0)
    shape = translateRectangle(shape, -focal_point.x, -focal_point.y);
    // update x:s and y:s to correspond to shifted shape
    x0 = shape.position.x;
    y0 = shape.position.y;
    x1 = x0 + shape.width;
    y1 = y0 + shape.height;
    // scale the shifted shape around origin (0, 0)
    shape = makeRectangle(x0 * factor, y0 * factor, x1 * factor, y1 * factor);
    // shift back such that focal point is on its original coordinates
    shape = translateRectangle(shape, focal_point.x, focal_point.y);
    // return the scaled shape
    return shape;
}