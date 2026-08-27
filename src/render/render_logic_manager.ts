/**
 * Fetches information from other aspects of game to interpret and send to RenderManager as medium level abstraction
 * instructions of what to draw. Warning: here be spaghetti code
 */
import { TextureManager } from "./texture_manager";
import { Tile, TileMapManager } from "../game/state/tile_map";
import { factorRectangle, makeRectangle, makeVector, scaleRectangle, scaleVector, subtractVector, translateRectangle } from "../types/type_constructors";
import type { Rectangle, Vector } from "../types/types";
import { GameCamera } from "./game_camera";
import { CountryManager } from "../game/state/country_manager";
import { mousePositionManager } from "./mouse_position";
import { TroopManager } from "../game/state/division_manager";

export type RenderOrder = { texture: string, target: Rectangle, layer: number, color: string | null, alpha: number }

export class RenderLogicManager {
    private static render_queue: RenderOrder[] = [];
    private static tile_detail: number = 1;

    /**
     * Returns the render queue of a given queue
     **/
    public static getRenderQueue(): RenderOrder[] {
        this.updateTileDetail();
        this.enqueueRenders();
        this.zoomAndOffsetQueuedRenders();
        this.updateRenderOrderTextureLOD();
        return [...this.render_queue];
    }

    private static enqueueRenders(): void {
        this.enqueueTiles();
    }

    public static clearRenderQueue(): void {
        this.render_queue = new Array
    }

    private static updateTileDetail(): void {
        this.tile_detail = getRenderDetail();
    }

    private static zoomAndOffsetQueuedRenders(): void {
        this.render_queue = this.render_queue.map(zoomAndOffsetRender);
    }

    private static updateRenderOrderTextureLOD(): void {
        if (lodTexture()) {
            this.render_queue.forEach((render_order: RenderOrder) => {
                render_order.texture = `lod_${render_order.texture}`;
            });
        }
    }

    private static pushToQueue(render_order: RenderOrder): void {
        this.render_queue.push(render_order);
    }

    /**
     * enqueues render order for tiles, including troop placements, occupation etc.
     */
    private static enqueueTiles(): void {
        const margin: number = 2;

        const start_corner: Vector = this.getStartCornerTile();
        const min_x: number = start_corner.x - margin;
        const min_y: number = start_corner.y - margin;

        let start_x: number = Math.max(0, min_x);
        start_x = Math.floor(start_x / this.tile_detail) * this.tile_detail
        let start_y: number = Math.max(0, min_y);
        start_y = Math.floor(start_y / this.tile_detail) * this.tile_detail

        const map_width: number = TileMapManager.readWidth();
        const map_height: number = TileMapManager.readHeight();

        const end_corner: Vector = this.getEndCornerTile(1);
        const max_x: number = end_corner.x + margin;
        const max_y: number = end_corner.y + margin;

        const end_x: number = Math.min(map_width, max_x + 1);
        const end_y: number = Math.min(map_height, max_y + 1);

        for (let x = start_x; x < end_x; x += this.tile_detail) {
            for (let y = start_y; y < end_y; y += this.tile_detail) {
                const tile: Tile = TileMapManager.readTile(x, y);

                // render terrain
                const terrain_render: RenderOrder = this.getTerrainRender(x, y);
                this.pushToQueue(terrain_render);

                // render owner
                if (tile.getOwner() !== null) {
                    const owner_render: RenderOrder = this.getOwnerRender(x, y);
                    this.pushToQueue(owner_render);
                }

                // render occupation
                if (tile.isOccupied()) {
                    const occupation_render: RenderOrder = this.getOccupationRender(x, y);
                    this.pushToQueue(occupation_render);
                }

                // render soldiers
                if (TroopManager.tileHasTroops(makeVector(x, y))) {
                    const troop_render: RenderOrder = this.getTroopRender(x, y);
                    this.pushToQueue(troop_render);
                }
            }
        }

        // render tile selection
        const tile_selection: Vector | null = this.tileOnMouse();
        if (tile_selection) { 
            const tile_selection_render: RenderOrder = this.getTileSelectionRender(tile_selection.x, tile_selection.y);
            this.pushToQueue(tile_selection_render);
        }
    
        // render selected tile
        const selected_tile: Vector | null = TileMapManager.getSelectedTile();
        if (selected_tile) {
            const selected_tile_render: RenderOrder = this.getSelectedTileRender(selected_tile.x, selected_tile.y);
            this.pushToQueue(selected_tile_render);
        }
    }

    private static getTerrainRender(x: number, y: number): RenderOrder {
        const tile: Tile = TileMapManager.readTile(x, y);
        const terrain_texture: string = tile.getTerrain();
        const pos: Vector = makeVector(x, y);
        const terrain_render: RenderOrder = this.renderOnTileGrid(terrain_texture, pos, 4 * y);
        return terrain_render;
    }

    private static getOwnerRender(x: number, y: number): RenderOrder {
        const tile: Tile = TileMapManager.readTile(x, y);
        const owner_tag: string | null = tile.getOwner();
        let owner_colour: string;
        if (owner_tag) {
            owner_colour = CountryManager.readCountry(owner_tag).colour;
        } else {
            console.error("no owner tag on tile", x, y);
            owner_colour = "rgb(0, 0, 0)";
        }
        const pos: Vector = makeVector(x, y);
        const non_offset: Vector = makeVector(0, 0);
        const alpha: number = 0.33;
        const owner_render: RenderOrder = this.renderOnTileGrid("tile_cover", pos, 4 * y + 1, non_offset, owner_colour, alpha);
        return owner_render;
    }

    private static getOccupationRender(x: number, y: number): RenderOrder {
        const tile: Tile = TileMapManager.readTile(x, y);
        const controller: string | null = tile.getController();
        let controller_colour: string | null;
        if (controller) {
            controller_colour = CountryManager.readCountry(controller).colour;
        } else {
            console.error("no controller tag on tile", x, y);
            controller_colour = 'rgb(0, 0, 0)';
        }
        const pos: Vector = makeVector(x, y);
        const non_offset: Vector = makeVector(0, 0);
        const controller_render: RenderOrder = this.renderOnTileGrid("striped_outline", pos, 4 * y + 2, non_offset, controller_colour);
        return controller_render;
    }

    private static getTroopRender(x: number, y: number): RenderOrder {
        const pos: Vector = makeVector(x, y);
        const troop_render: RenderOrder = this.renderOnTileGrid('troop', pos, 4 * y + 3);
        return troop_render;
    }

    private static getTileSelectionRender(x: number, y: number): RenderOrder {
        const pos: Vector = makeVector(x, y);
        const non_offset: Vector = makeVector(0, 0);
        const tile_selection_render: RenderOrder = this.renderOnTileGrid('thin_outline', pos, 4 * y + 4, non_offset, "RGB(255, 255, 0)");
        return tile_selection_render;
    }

    private static getSelectedTileRender(x: number, y: number): RenderOrder {
        let pos: Vector = makeVector(x, y);
        const non_offset: Vector = makeVector(0, 0);
        const selected_tile_render: RenderOrder = this.renderOnTileGrid('outline', pos, 4 * y + 5, non_offset, "RGB(255, 255, 0)");
        return selected_tile_render;
    }

    /**
     * Creates a render order for a texture to be rendered on map tile
     * @param texture A given texture to render
     * @param position Vector representing which tile to render the texture on
     * @param offset optional Vector representing how much to offset the render in (x, y)
     * @returns RenderOrder representing the texture as a tile on a map grid
     */
    private static renderOnTileGrid(texture: string, position: Vector, layer: number, offset = makeVector(0, 0),
                                    color: string | null = null, alpha: number = 1) {
        const tile_dimension: Rectangle = TextureManager.getSpriteDimensions("blank");
        const tile_size: Vector = makeVector(tile_dimension.width, tile_dimension.height);
        return this.renderOnGrid(tile_size, position, texture, offset, layer, color, alpha);
    }

    /**
     * Creates a render order for a texture as a tile in a grid
     * @param tile_dimension Vector representing tile width and height of grid tiles
     * @param position Vector representing which tile on the grid is to be rendered (x, y)
     * @param texture A given texture to render
     * @param offset optional Vector representing how much to offset the render in (x, y)
     * @returns RenderOrder representing the texture as a tile in the given grid
     */
    private static renderOnGrid(tile_dimension: Vector, position: Vector, texture: string, offset: Vector,
                                layer: number, color: string | null = null, alpha: number): RenderOrder {
        const grid_pos_x = position.x;
        const grid_pos_y = position.y;
        const start_x = tile_dimension.x * grid_pos_x + offset.x;
        const start_y = tile_dimension.y * grid_pos_y + offset.y;

        const texture_dimensions: Rectangle = TextureManager.getSpriteDimensions(texture);
        const texture_width: number = texture_dimensions.width;
        const texture_height: number = texture_dimensions.height;
        const texture_height_to_width: number = texture_height / texture_width;
        const scaled_height: number = tile_dimension.x * texture_height_to_width;

        let target_dimensions: Rectangle;
        const even_layer = grid_pos_y % (2 * this.tile_detail) === 0;

        if (even_layer) {
            target_dimensions = makeRectangle(start_x,
                                              start_y * 0.75 - scaled_height,
                                              start_x + tile_dimension.x * this.tile_detail,
                                              start_y * 0.75 + (this.tile_detail - 1) * scaled_height
                                            );
        } else {
            target_dimensions = makeRectangle(start_x + 0.5 * tile_dimension.x * this.tile_detail,
                                              start_y * 0.75 - scaled_height,
                                              start_x + 1.5 * tile_dimension.x * this.tile_detail,
                                              start_y * 0.75 + (this.tile_detail - 1) * scaled_height
                                            );
        }

        const tile_render: RenderOrder = {
            texture: texture,
            target: target_dimensions,
            layer: layer,
            color: color,
            alpha: alpha
        }

        return tile_render;
    }

    /**
     * Calculates what tile the mouse is currently over,
     * @param mouse_pos a mouse position on the canvas
     * @returns a Vector representing what grid tile the given mouse position corresponds to,
     * accounting for camera (does not ensure position actually exists on the map)
     */
    public static tileOnMouse(): Vector | null {
        const mouse_pos: Vector = mousePositionManager.mousePos();
        return this.tileOnPixel(mouse_pos);
    }

    /**
     * Calculates what tile is on a given pixel on the screen, accounting for camera.
     * valid range.
     * @param pixel a pixel's position on the display represented as a Vector
     * @returns Vector representing the grid position of the tile which covers the given pixel
     */
    private static tileOnPixel(pixel: Vector): Vector | null {
        // get base tile dimensions
        let tile_dimension: Rectangle = this.getTerrainRender(0, 0).target;
        // zoom and offset base tile dimensions
        tile_dimension = zoomAndOffsetRectangle(tile_dimension);
        // offset pixel by subtracting tile dimension position from it
        pixel = subtractVector(pixel, tile_dimension.position);
        // get grid_y dividing pixel.y with tile dimensions height times 0.5
        const grid_y: number = Math.floor(pixel.y / (tile_dimension.height * 0.75));
        // iff odd grid_y, offset pixel.x by - 0.5 * tile_dimension width
        if (grid_y % 2 === 1) {
            pixel.x -= tile_dimension.width * 0.5;
        }
        // get grid_x dividing pixel.x with tile dimensions width
        const grid_x: number = Math.floor(pixel.x / tile_dimension.width);
        // calculated position is vector of (grid_x, grid_y)
        let grid_position: Vector = makeVector(grid_x, grid_y);
        // multiply by detail
        grid_position = scaleVector(grid_position, getRenderDetail());
        // if valid position, return vector of grid_x, grid_y
        if (TileMapManager.positionExists(grid_position)) {
            return grid_position;
        } else { // else return null
            return null;
        }
    }

    /**
     * Calculates and returns the grid position of the tile that can be seen on screen (accounting
     * for camera) in the upper left corner.
     * @returns Vector representing the position of the most upper left corner tile visible
     */
    private static getStartCornerTile(): Vector {
        const canvas_size: Vector = getScreenDimensions();
        const canvas_x: number = canvas_size.x;
        const canvas_y: number = canvas_size.y;
        const canvas_rectangle: Rectangle = makeRectangle(0, 0, canvas_x, canvas_y);
        const screen_bounds: Rectangle = antiZoomAndOffsetRectangle(canvas_rectangle);

        const screen_start_x: number = screen_bounds.position.x;
        const screen_start_y: number = screen_bounds.position.y;
    
        const tile_dimensions: Rectangle = TextureManager.getSpriteDimensions("blank");
        const tile_width: number = tile_dimensions.width;
        const tile_height: number = tile_dimensions.height * 0.75; // 0.75 because of grid layout

        const tile_x: number = Math.floor(screen_start_x / tile_width);
        const tile_y: number = Math.floor(screen_start_y / tile_height);

        return makeVector(tile_x, tile_y);
    }

    /**
     * Calculates and returns the grid position of the tile that can be seen on screen (accounting
     * for camera) in the lower right corner.
     * @returns Vector representing the position of the most bottom right corner tile visible
     */
    private static getEndCornerTile(margin: number): Vector {
        const canvas_size: Vector = getScreenDimensions();
        const canvas_x: number = canvas_size.x;
        const canvas_y: number = canvas_size.y;
        const canvas_rectangle: Rectangle = makeRectangle(0, 0, canvas_x, canvas_y);
        const screen_bounds: Rectangle = antiZoomAndOffsetRectangle(canvas_rectangle);

        const screen_end_x: number = screen_bounds.position.x + screen_bounds.width;
        const screen_end_y: number = screen_bounds.position.y + screen_bounds.height;
    
        const tile_dimensions: Rectangle = TextureManager.getSpriteDimensions("blank");
        factorRectangle(tile_dimensions, margin);
        const tile_width: number = tile_dimensions.width;
        const tile_height: number = tile_dimensions.height * 0.75; // 0.75 because of grid layout

        const tile_x: number = Math.ceil(screen_end_x / tile_width);
        const tile_y: number = Math.ceil(screen_end_y / tile_height);

        return makeVector(tile_x, tile_y);
    }
}

/**
 * Zooms and offsets a given render order to account for camera.
 * @param render_order a render order
 * @returns a render order moved and scaled in regards to camera position and zoom
 */
function zoomAndOffsetRender(render_order: RenderOrder): RenderOrder {
    render_order.target = zoomAndOffsetRectangle(render_order.target);
    return render_order;
}

/**
 * Scales and moves a given rectangle to account for camera.
 * @param rectangle a Rectangle
 * @returns a Rectangle moved and scaled in regards to camera position and zoom
 */
function zoomAndOffsetRectangle(rectangle: Rectangle): Rectangle {
    function offset(rect: Rectangle): Rectangle {
        const camera: Vector = GameCamera.getPos();
        rect = translateRectangle(rect, -camera.x, -camera.y);
        return rect;
    }

    function zoom(rect: Rectangle): Rectangle {
        const screen_centre: Vector = getScreenCentre();
        const zoom: number = GameCamera.getZoom();
        rect = scaleByFocalPoint(rect, screen_centre, zoom);
        return rect;
    }

    const offset_rectangle: Rectangle = offset(rectangle);
    const zoomed_rectangle: Rectangle = zoom(offset_rectangle);
    return zoomed_rectangle;
}

function zoomAndOffsetVector(vector: Vector): Vector {
    const vector_rectangle: Rectangle = makeRectangle(vector.x, vector.y, vector.x + 1, vector.y + 1);
    const zoom_offset_vector_rectangle: Rectangle = zoomAndOffsetRectangle(vector_rectangle);
    const zoom_offset_vector: Vector = zoom_offset_vector_rectangle.position;
    return zoom_offset_vector;
}

/**
 * Undoes scaling and moving of a given rectangle to account for camera.
 * @param rectangle a Rectangle
 * @returns a Rectangle oppositely scaled and zoomed, such that if zoomed and offset it would regain
 * its initial values.
 */
function antiZoomAndOffsetRectangle(rectangle: Rectangle): Rectangle {
    function unoffset(rect: Rectangle): Rectangle {
        const camera: Vector = GameCamera.getPos();
        rect = translateRectangle(rect, camera.x, camera.y);
        return rect;
    }

    function unzoom(rect: Rectangle): Rectangle {
        const screen_centre: Vector = getScreenCentre();
        const zoom: number = 1 / GameCamera.getZoom();
        rect = scaleByFocalPoint(rect, screen_centre, zoom);
        return rect;
    }

    const unzoomed_rectangle = unzoom(rectangle);
    const unoffset_rectangle = unoffset(unzoomed_rectangle);
    return unoffset_rectangle;
}

/**
 * Scales a Rectangle around a given focal point.
 * @param focal_point a Vector describing focal point
 * @param rectangle a Rectangle to be scaled
 * @param factor how much to scale the given shape around the focal point by
 * @returns the given rectangle scaled by the factor around the focal point
 */
function scaleByFocalPoint(rectangle: Rectangle, focal_point: Vector, factor: number): Rectangle {
    // shift shape such that focal point is on origin (0, 0)
    let scaled_rectangle: Rectangle = translateRectangle(rectangle, -focal_point.x, -focal_point.y);
    // scale the shifted shape, effectively around origin (0, 0)
    scaled_rectangle = scaleRectangle(scaled_rectangle, factor);
    // shift back such that focal point is on its original coordinates
    scaled_rectangle = translateRectangle(scaled_rectangle, focal_point.x, focal_point.y);
    // return the scaled shapes
    return scaled_rectangle;
}

function getRenderDetail(): number {
    const fidelity: string = "medium";
    const zoom: number = GameCamera.getZoomLevel();
    switch (fidelity) {
        case "low":
            if (zoom <= 4) {
                return 1;
            } else if (zoom === 5) {
                return 2;
            } else if (zoom === 6) {
                return 3;
            } else if (zoom === 7) {
                return 5;
            } else {
                return 6;
            }
        case "medium":
            if (zoom <= 5) {
                return 1;
            } else if (zoom === 6) {
                return 2;
            } else if (zoom === 7) {
                return 4;
            } else {
                return 5;
            }
        case "high":
            if (zoom <= 6) {
                return 1;
            } else if (zoom === 7) {
                return 2;
            } else {
                return 3;
            }
        default:
            console.warn("getRenderDetail no case for fidelity:", fidelity)
            return 10;
    }
}

function lodTexture(): boolean {
    const zoom: number = GameCamera.getZoom();
    const detail: number = getRenderDetail();
    return zoom < 0.125 || detail !== 1;
}

function getScreenCentre(): Vector {
    const screen_dimensions: Vector = getScreenDimensions();
    const x_centre: number = Math.round(screen_dimensions.x / 2);
    const y_centre: number = Math.round(screen_dimensions.y / 2);
    return makeVector(x_centre, y_centre);
}

function getScreenDimensions(): Vector {
    return makeVector(window.innerWidth, window.innerHeight);
}