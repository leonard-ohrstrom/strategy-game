/**
 * Handles map construction (data, not rendering) upon game initialisation. In
 * future will also involve placing troops, assigning borders, and possibly
 * more.
 */

import { TileMap } from "./tile_map";

TileMap.makeGrid(8, 8);