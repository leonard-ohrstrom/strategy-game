/**
 * Fetches information from other aspects of game to interpret and send to RenderManager as medium level abstraction
 * instructions of what to draw. Warning: here be spaghetti code
 */
import { TextureManager } from "./texture_manager";
import { Tile, TileMapManager } from "../game/logic/tile_map_manager";
import { rectangleMake, vectorMake, rectangleScale, vectorScale, vectorSubtract, rectangleTranslate } from "../types/type_constructors";
import type { Rectangle, Vector } from "../types/types";
import { GameCamera } from "./game_camera";
import { CountryManager } from "../game/logic/country_manager";
import { mousePositionManager } from "./mouse_position";
import { TroopManager } from "../game/logic/troop_manager";
import { MapModeManager } from "./map_mode_manager";
import { addRgbValue } from "../types/rgb";

export type RenderOrder = { texture: string, target: Rectangle, layer: number, color: string | null, alpha: number, blend: string }
type TileRender_Func = (x: number, y: number) => RenderOrder | null

export class RenderLogicManager {
    private static render_queue: RenderOrder[] = [];
    private static tile_detail: number = 1;

    /**
     * Returns the render queue of a given queue.
     **/
    public static getRenderQueue(): RenderOrder[] {
        this.enqueueRenders();
        return this.render_queue;
    }

    private static enqueueRenders(): void {
        this.clearRenderQueue();
        this.updateTileDetail();
        this.enqueueTiles();
        this.zoomAndOffsetQueuedRenders();
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

    private static pushToQueue(render_order: RenderOrder | RenderOrder[]): void {
        if (Array.isArray(render_order)) {
            render_order.forEach((render_order: RenderOrder) => {
                this.render_queue.push(render_order);
            });
        } else {
            this.render_queue.push(render_order);
        }
    }

    /**
     * enqueues render order for tiles, including troop placements, occupation etc.
     */
    private static enqueueTiles(): void {
        const margin: number = 2;

        const start_point: Vector = this.getStartRenderPoint(margin);
        const end_point: Vector = this.getEndRenderPoint(margin);

        const start_x: number = start_point.x;
        const start_y: number = start_point.y;
        const end_x: number = end_point.x;
        const end_y: number = end_point.y;
        const map_mode: string = MapModeManager.getMapMode();
        
        const incrementation: number = this.tile_detail;
        let owner_renders: RenderOrder[] = [];
        let terrain_detail_renders: RenderOrder[] = [];

        if (map_mode === "political") {
            owner_renders = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderOwnerIf(x, y));
        } else if (map_mode === "tactical") {
            owner_renders = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderOwnerSemiIf(x, y));
            terrain_detail_renders = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderTerrainDetailIf(x, y));
        } else if (map_mode === "terrain") {
            terrain_detail_renders = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderTerrainDetailIf(x, y));
        }
        const terrain_base_renders: RenderOrder[] = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.getTerrainBaseRender(x, y));
        const occupation_renders: RenderOrder[] = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderOccupationIf(x, y));
        const troop_renders: RenderOrder[] = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderTroopIf(x, y));
        const troop_selections_renders: RenderOrder[] = this.renderGridFunc(start_x, start_y, end_x, end_y, incrementation, (x, y) => this.renderTroopSelectionIf(x, y));

        this.pushToQueue(owner_renders);
        this.pushToQueue(terrain_base_renders);
        this.pushToQueue(terrain_detail_renders);
        this.pushToQueue(occupation_renders);
        this.pushToQueue(troop_renders);
        this.pushToQueue(troop_selections_renders);
        this.renderTileSelectionHover();
        this.renderTileSelection();
    }

    private static getStartRenderPoint(margin: number): Vector {
        const start_corner: Vector = this.getStartCornerTile();
        const min_x: number = start_corner.x - margin;
        const min_y: number = start_corner.y - margin;
        let start_x: number = Math.max(0, min_x);
        let start_y: number = Math.max(0, min_y);
        start_x = Math.floor(start_x / this.tile_detail) * this.tile_detail;
        start_y = Math.floor(start_y / this.tile_detail) * this.tile_detail;

        return vectorMake(start_x, start_y);
    }

    private static getEndRenderPoint(margin: number): Vector {
        const map_width: number = TileMapManager.readWidth();
        const map_height: number = TileMapManager.readHeight();
        const end_corner: Vector = this.getEndCornerTile();
        const max_x: number = end_corner.x + margin;
        const max_y: number = end_corner.y + margin;
        const end_x: number = Math.min(map_width, max_x + 1);
        const end_y: number = Math.min(map_height, max_y + 1);

        return vectorMake(end_x, end_y);
    }

    private static renderOwnerIf(x: number, y: number): RenderOrder | null {
        const tile: Tile = TileMapManager.readTile(x, y);
        if (tile.getOwner()) {
            return this.getOwnerRender(x, y);
        } else {
            return null;
        }
    }

    private static renderTerrainDetailIf(x: number, y: number): RenderOrder | null {
        const tile: Tile = TileMapManager.readTile(x, y);
        const tile_terrain: string = tile.getTerrain();
        const tile_has_detail: boolean = TextureManager.terrainHasDetail(tile_terrain);
        if (tile_has_detail) {
            return this.getTerrainDetailRender(x, y);
        } else {
            return null;
        }
    }

    private static renderOwnerSemiIf(x: number, y: number): RenderOrder | null {
        const tile: Tile = TileMapManager.readTile(x, y);
        if (tile.getOwner()) {
            return this.getOwnerRenderSemi(x, y);
        } else {
            return null;
        }
    }

    private static renderOccupationIf(x: number, y: number): RenderOrder | null {
        const tile: Tile = TileMapManager.readTile(x, y);
        if (tile.isOccupied()) {
            return this.getOccupationRender(x, y);
        } else {
            return null;
        }
    }

    private static renderTroopIf(x: number, y: number): RenderOrder | null {
        const tile_has_troops: boolean = TroopManager.tileHasTroops(vectorMake(x, y));
        if (tile_has_troops) {
            return this.getTroopRender(x, y);
        } else {
            return null;
        }
    }

    private static renderTroopSelectionIf(x: number, y: number): RenderOrder | null {
        const troops_on_tile: string[] = TroopManager.getTroopsOnTile(vectorMake(x, y));
        const tile_has_selected_troop: boolean = troops_on_tile.some((tag) => {
            return TroopManager.getSelectedTroops().includes(tag);
        });
        if (tile_has_selected_troop) {
            return this.getSelectedTroopRender(x, y);
        } else {
            return null;
        }
    }

    private static renderTileSelectionHover(): void {
        const tile_selection: Vector | null = this.tileOnMouse();
        if (tile_selection) {
            const tile_selection_render: RenderOrder = this.getTileSelectionRender(tile_selection.x, tile_selection.y);
            this.pushToQueue(tile_selection_render);
        }
    }

    private static renderTileSelection(): void {
        const selected_tile: Vector | null = TileMapManager.getSelectedTile();
        if (selected_tile) {
            const selected_tile_render: RenderOrder = this.getSelectedTileRender(selected_tile.x, selected_tile.y);
            this.pushToQueue(selected_tile_render);
        }
    }

    /**
     * Creates render orders for grid from point(start_x, start_y) **up to** *(but not including!)* point(end_x, end_y)
     */
    private static renderGridFunc(start_x: number, start_y: number, end_x: number, end_y: number, incrementation: number, render_function: TileRender_Func): RenderOrder[] {
        const render_orders: RenderOrder[] = [];
        for (let x = start_x; x < end_x; x += incrementation) {
            for (let y = start_y; y < end_y; y += incrementation) {
                const render_order: RenderOrder | null = render_function(x, y);
                if (render_order) {
                    render_orders.push(render_order);
                }
            }
        }
        return render_orders;
    }

    private static getTerrainBaseRender(x: number, y: number): RenderOrder {
        const tile: Tile = TileMapManager.readTile(x, y);
        const terrain_label: string = tile.getTerrain();
        const base_texture: string = TextureManager.getTerrainBase(terrain_label);
        const pos: Vector = vectorMake(x, y);
        const terrain_render: RenderOrder = this.renderOnTileGrid(base_texture, pos, 7 * y);
        return terrain_render;
    }

    private static getTerrainDetailRender(x: number, y: number): RenderOrder {
        const tile: Tile = TileMapManager.readTile(x, y);
        const terrain_label: string = tile.getTerrain();
        const detail_texture: string = TextureManager.getTerrainDetail(terrain_label);
        const pos: Vector = vectorMake(x, y);
        let depth: number;
        if (terrain_label === "mountain") {
            depth = 7 * y + 1;
        } else {
            depth = 7 * y + 4;
        }
        const terrain_render: RenderOrder = this.renderOnTileGrid(detail_texture, pos, depth);
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
        const pos: Vector = vectorMake(x, y);
        const non_offset: Vector = vectorMake(0, 0);
        const alpha: number = 1.0;
        const owner_render: RenderOrder = this.renderOnTileGrid("hexagon_blank", pos, 7 * y + 2, non_offset, owner_colour, alpha);
        return owner_render;
    }

    private static getOwnerRenderSemi(x: number, y: number): RenderOrder {
        const tile: Tile = TileMapManager.readTile(x, y);
        const owner_tag: string | null = tile.getOwner();
        let owner_colour: string;
        if (owner_tag) {
            owner_colour = CountryManager.readCountry(owner_tag).colour;
        } else {
            console.error("no owner tag on tile", x, y);
            owner_colour = "rgb(0, 0, 0)";
        }
        const pos: Vector = vectorMake(x, y);
        const non_offset: Vector = vectorMake(0, 0);
        let alpha: number;
        if (this.tile_detail !== 1 || TileMapManager.isBorder(pos)) {
            owner_colour = addRgbValue(owner_colour, "RGB(-33, -33, -33)");
            alpha = 0.7;
        } else {
            alpha = 0.5;
        }
        let blend: string = "normal";
        const owner_render: RenderOrder = this.renderOnTileGrid("hexagon_blank", pos, 7 * y + 2, non_offset, owner_colour, alpha, blend);
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
        const pos: Vector = vectorMake(x, y);
        const non_offset: Vector = vectorMake(0, 0);
        const controller_render: RenderOrder = this.renderOnTileGrid("hexagon_striped", pos, 7 * y + 3, non_offset, controller_colour);
        return controller_render;
    }

    private static getTroopRender(x: number, y: number): RenderOrder {
        const pos: Vector = vectorMake(x, y);
        const troop_render: RenderOrder = this.renderOnTileGrid('troop', pos, 7 * y + 5);
        return troop_render;
    }

    private static getSelectedTroopRender(x: number, y: number): RenderOrder {
        const pos: Vector = vectorMake(x, y);
        const troop_render: RenderOrder = this.renderOnTileGrid('selection_troop', pos, 7 * y + 5);
        return troop_render;
    }

    private static getTileSelectionRender(x: number, y: number): RenderOrder {
        const pos: Vector = vectorMake(x, y);
        const non_offset: Vector = vectorMake(0, 0);
        const tile_selection_render: RenderOrder = this.renderOnTileGrid('selection_outline', pos, 7 * y + 6, non_offset, "RGB(255, 255, 0)");
        return tile_selection_render;
    }

    private static getSelectedTileRender(x: number, y: number): RenderOrder {
        let pos: Vector = vectorMake(x, y);
        const non_offset: Vector = vectorMake(0, 0);
        const selected_tile_render: RenderOrder = this.renderOnTileGrid('selection_outline_thick', pos, 7 * y + 6, non_offset, "RGB(255, 255, 0)");
        return selected_tile_render;
    }

    /**
     * Creates a render order for a texture to be rendered on map tile
     * @param texture A given texture to render
     * @param position Vector representing which tile to render the texture on
     * @param offset optional Vector representing how much to offset the render in (x, y)
     * @returns RenderOrder representing the texture as a tile on a map grid
     */
    private static renderOnTileGrid(texture: string, position: Vector, layer: number, offset = vectorMake(0, 0),
                                    color: string | null = null, alpha: number = 1, blend: string = "normal") {
        const tile_dimension: Rectangle = TextureManager.getSpriteDimensions("hexagon_blank");
        const tile_size: Vector = vectorMake(tile_dimension.width, tile_dimension.height);
        return this.renderOnGrid(tile_size, position, texture, offset, layer, color, alpha, blend);
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
                                layer: number, color: string | null, alpha: number, blend: string): RenderOrder {
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
            target_dimensions = rectangleMake(
                start_x,
                start_y * 0.75 - scaled_height,
                start_x + tile_dimension.x * this.tile_detail,
                start_y * 0.75 + (this.tile_detail - 1) * scaled_height
            );
        } else {
            target_dimensions = rectangleMake(
                start_x + 0.5 * tile_dimension.x * this.tile_detail,
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
            alpha: alpha,
            blend: blend
        };

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
        let tile_dimension: Rectangle = this.getTerrainBaseRender(0, 0).target;
        // zoom and offset base tile dimensions
        tile_dimension = zoomAndOffsetRectangle(tile_dimension);
        // offset pixel by subtracting tile dimension position from it
        pixel = vectorSubtract(pixel, tile_dimension.position);
        // get grid_y dividing pixel.y with tile dimensions height times 0.5
        const grid_y: number = Math.floor(pixel.y / (tile_dimension.height * 0.75));
        // iff odd grid_y, offset pixel.x by - 0.5 * tile_dimension width
        if (grid_y % 2 === 1) {
            pixel.x -= tile_dimension.width * 0.5;
        }
        // get grid_x dividing pixel.x with tile dimensions width
        const grid_x: number = Math.floor(pixel.x / tile_dimension.width);
        // calculated position is vector of (grid_x, grid_y)
        let grid_position: Vector = vectorMake(grid_x, grid_y);
        // multiply by detail
        grid_position = vectorScale(grid_position, getRenderDetail());
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
        const canvas_rectangle: Rectangle = rectangleMake(0, 0, canvas_x, canvas_y);
        const screen_bounds: Rectangle = antiZoomAndOffsetRectangle(canvas_rectangle);

        const screen_start_x: number = screen_bounds.position.x;
        const screen_start_y: number = screen_bounds.position.y;
    
        const tile_dimensions: Rectangle = TextureManager.getSpriteDimensions("hexagon_blank");
        const tile_width: number = tile_dimensions.width;
        const tile_height: number = tile_dimensions.height * 0.75; // 0.75 because of grid layout

        const tile_x: number = Math.floor(screen_start_x / tile_width);
        const tile_y: number = Math.floor(screen_start_y / tile_height);

        return vectorMake(tile_x, tile_y);
    }

    /**
     * Calculates and returns the grid position of the tile that can be seen on screen (accounting
     * for camera) in the lower right corner.
     * @returns Vector representing the position of the most bottom right corner tile visible
     */
    private static getEndCornerTile(): Vector {
        const canvas_size: Vector = getScreenDimensions();
        const canvas_x: number = canvas_size.x;
        const canvas_y: number = canvas_size.y;
        const canvas_rectangle: Rectangle = rectangleMake(0, 0, canvas_x, canvas_y);
        const screen_bounds: Rectangle = antiZoomAndOffsetRectangle(canvas_rectangle);

        const screen_end_x: number = screen_bounds.position.x + screen_bounds.width;
        const screen_end_y: number = screen_bounds.position.y + screen_bounds.height;
    
        const tile_dimensions: Rectangle = TextureManager.getSpriteDimensions("hexagon_blank");
        const tile_width: number = tile_dimensions.width;
        const tile_height: number = tile_dimensions.height * 0.75; // 0.75 because of grid layout

        const tile_x: number = Math.ceil(screen_end_x / tile_width);
        const tile_y: number = Math.ceil(screen_end_y / tile_height);

        return vectorMake(tile_x, tile_y);
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
        rect = rectangleTranslate(rect, -camera.x, -camera.y);
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

/**
 * Undoes scaling and moving of a given rectangle to account for camera.
 * @param rectangle a Rectangle
 * @returns a Rectangle oppositely scaled and zoomed, such that if zoomed and offset it would regain
 * its initial values.
 */
function antiZoomAndOffsetRectangle(rectangle: Rectangle): Rectangle {
    function unoffset(rect: Rectangle): Rectangle {
        const camera: Vector = GameCamera.getPos();
        rect = rectangleTranslate(rect, camera.x, camera.y);
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
    let scaled_rectangle: Rectangle = rectangleTranslate(rectangle, -focal_point.x, -focal_point.y);
    // scale the shifted shape, effectively around origin (0, 0)
    scaled_rectangle = rectangleScale(scaled_rectangle, factor);
    // shift back such that focal point is on its original coordinates
    scaled_rectangle = rectangleTranslate(scaled_rectangle, focal_point.x, focal_point.y);
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

function getScreenCentre(): Vector {
    const screen_dimensions: Vector = getScreenDimensions();
    const x_centre: number = Math.round(screen_dimensions.x / 2);
    const y_centre: number = Math.round(screen_dimensions.y / 2);
    return vectorMake(x_centre, y_centre);
}

function getScreenDimensions(): Vector {
    return vectorMake(window.innerWidth, window.innerHeight);
}