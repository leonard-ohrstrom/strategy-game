/**
 * Fetches information from other aspects of game to interpret and send to
 * RenderManager as medium level abstraction instructions of what to draw.
 */
import { RenderManager } from "./render_manager";
import { TextureManager } from "./texture_manager";
import { Tile, TileMapManager } from "../game/state/tile_map";
import { makeRectangle, makeVector } from "../types/type_constructors";
import type { Rectangle, Vector } from "../types/types";
import { GameCamera } from "./game_camera";
import { getCanvasCentre } from "./canvas_context";
import { CountryManager } from "../game/state/country_manager";

type RenderOrder = { texture: string, target: Rectangle, color: string | null }
type RenderQueue = Array<Array<RenderOrder>>

export class RenderLogicManager {
    private static render_queue: RenderQueue = new Array;
    private static resetRenderQueue(): void { this.render_queue = new Array }

    static update(): void {
        RenderManager.clear();
        this.enqueueRenders();
        this.zoomAndOffsetQueuedRenders();
        this.renderQueuedRenders();
        this.resetRenderQueue();
    }

    private static enqueueRenders(): void {
        this.enqueueTiles();
        this.enqueueTileOwners();
        this.enqueueTroops();
    }

    private static renderQueuedRenders(): void {
        this.render_queue.forEach(render_layer => {
            render_layer.forEach(render_order => RenderManager.render(
                render_order.texture,
                render_order.target,
                render_order.color
            ))
        });
    }

    private static zoomAndOffsetQueuedRenders(): void {
        this.render_queue.forEach(render_layer => {
            render_layer.forEach(render_order =>
                render_order = zoomAndOffsetRender(render_order)
            )
        })
    }

    private static pushToQueue(render_order: RenderOrder, layer: number): void {
        if (this.render_queue[layer] === undefined) {
            this.render_queue[layer] = new Array;
        }
        this.render_queue[layer].push(render_order);
    }

    // enqueues render order for tiles (terrain)
    private static enqueueTiles(): void {
        const width = TileMapManager.readWidth();
        const height = TileMapManager.readHeight();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const tile: Tile = TileMapManager.readTile(x, y);
                const tile_texture = tile.getTerrain();
                const pos: Vector = makeVector(x, y);
                const tile_render: RenderOrder = this.renderOnTileGrid(tile_texture, pos);
                this.pushToQueue(tile_render, 0);
            }
        }
    }

    // enqueues render order for tile owner color outline on corresponding tiles
    private static enqueueTileOwners(): void {
        const width = TileMapManager.readWidth();
        const height = TileMapManager.readHeight();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const tile: Tile = TileMapManager.readTile(x, y);
                const owner_tag: string | null = tile.getOwner();
                const occupied: boolean = tile.isOccupied();
                const controller_tag: string | null = tile.getController();
                if (owner_tag) {
                    const owner = CountryManager.readCountry(owner_tag);
                    const color: string = owner.color;
                    const texture: string = 'hexagon_outline';
                    const pos: Vector = makeVector(x, y);
                    const offset: Vector = makeVector(0, 0);
                    const outline_render: RenderOrder = this.renderOnTileGrid(texture, pos, offset,
                                                                              color);
                    this.pushToQueue(outline_render, 1)
                }
                if (occupied && controller_tag) {
                    const occupant = CountryManager.readCountry(controller_tag);
                    const color: string = occupant.color;
                    const texture: string = 'hexagon_outline_striped';
                    const pos: Vector = makeVector(x, y);
                    const offset: Vector = makeVector(0, 0);
                    const outline_render: RenderOrder = this.renderOnTileGrid(texture, pos, offset,
                                                                              color);
                    this.pushToQueue(outline_render, 2)
                } else if (occupied && !controller_tag) {
                    console.warn("tile:", tile, "at:", x, y, "occupied by null:", controller_tag);
                }
            }
        }
    }

    // enqueues render order for troops above corresponding tiles
    private static enqueueTroops(): void {
        const width = TileMapManager.readWidth();
        const height = TileMapManager.readHeight();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const tile: Tile = TileMapManager.readTile(x, y);
                const has_troops: boolean = tile.getTroops() !== 0;
                if (has_troops) {
                    const pos: Vector = makeVector(x, y);
                    const texture: string = "troop";
                    const offset: Vector = makeVector(0, 0);
                    const tile_render: RenderOrder = this.renderOnTileGrid(texture, pos, offset);
                    this.pushToQueue(tile_render, 3);
                }
            }
        }
    }

    /**
     * Creates a render order for a texture to be rendered on map tile
     * @param texture A given texture to render
     * @param position Vector representing which tile to render the texture on
     * @param offset optional Vector representing how much to offset the render in (x, y)
     * @returns RenderOrder representing the texture as a tile on a map grid
     */
    private static renderOnTileGrid(texture: string, position: Vector, offset = makeVector(0, 0),
                                    color: string | null = null) { 
        const tile_dimension: Rectangle = TextureManager.getDimensions("tile");
        const tile_size: Vector = makeVector(tile_dimension.width, tile_dimension.height);
        return this.renderOnGrid(tile_size, position, texture, offset, color);
    }

    /**
     * Creates a render order for a texture as a tile in a grid
     * @param tile_dimension Vector representing tile width and height of grid tiles
     * @param position Vector representing which tile on the grid is to be rendered (x, y)
     * @param texture A given texture to render
     * @param offset optional Vector representing how much to offset the render in (x, y)
     * @returns RenderOrder representing the texture as a tile in the given grid
     */
    private static renderOnGrid(tile_dimension: Vector, position: Vector, texture: string,
                                offset = makeVector(0, 0), color: string | null = null): RenderOrder {
        const grid_pos_x = position.x;
        const grid_pos_y = position.y;
        const start_x = tile_dimension.x * grid_pos_x + offset.x;
        const start_y = tile_dimension.y * grid_pos_y + offset.y;

        const texture_dimensions: Rectangle = TextureManager.getDimensions(texture);
        const texture_width: number = texture_dimensions.width;
        const texture_height: number = texture_dimensions.height;
        const texture_height_to_width: number = texture_height / texture_width;
        const scaled_height: number = tile_dimension.x * texture_height_to_width;

        let target_dimensions: Rectangle;
        const even_layer = grid_pos_y % 2 === 0;

        if (even_layer) {
            target_dimensions = makeRectangle(start_x,
                                             start_y * 0.75 - scaled_height,
                                             start_x + tile_dimension.x,
                                             start_y * 0.75);
        } else {
            target_dimensions = makeRectangle(start_x + 0.5 * tile_dimension.x,
                                             start_y * 0.75 - scaled_height,
                                             start_x + 1.5 * tile_dimension.x,
                                             start_y * 0.75);
        }

        const tile_render: RenderOrder = { texture: texture, target: target_dimensions, color: color }
        return tile_render;
    }
}

/**
 * Zooms and offsets a given render order to account for camera.
 * @param render_order a render order
 * @returns a render order moved and scaled in regards to camera position and zoom
 */
function zoomAndOffsetRender(render_order: RenderOrder): RenderOrder {
    function offset(render_order: RenderOrder): RenderOrder {
        const camera: Vector = GameCamera.getPos();
        render_order.target = translateRectangle(render_order.target, -camera.x, -camera.y);
        return render_order;
    }

    function zoom(render_order: RenderOrder) {
        const centre: Vector = getCanvasCentre();
        const zoom: number = GameCamera.getZoom();
        render_order.target = scaleByFocalPoint(render_order.target, centre, zoom);
        return render_order;
    }

    render_order = offset(render_order);
    render_order = zoom(render_order);
    return render_order;
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
    // update x and y to correspond to shifted shape
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