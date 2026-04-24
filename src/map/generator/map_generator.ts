// npx tsx src/map/generator/map_generator.ts

import { writeFile } from "atomically";
import { readFile } from "node:fs/promises";

type IsOnWaterResponse = {
  isWater: boolean,
  feature: string,
  lat: number,
  lon: number,
  reqMs: number
}

type TileTask = {
	promise: () => Promise<string>,
	x: number,
	y: number,
	lat: number,
	lnt: number
}

async function writeJSON(data: any, relative_path: string): Promise<void> {
	data = JSON.stringify(data, null, 2);
	await writeFile(relative_path, data, "utf-8");
}

async function latLntToTerrain(lat: number, lnt: number): Promise<string> {
	const url: string = `https://is-on-water.balbona.me/api/v1/get/${lat}/${lnt}/`
	const response: Response = await fetch(url);
	const data: IsOnWaterResponse = await response.json();
	const is_water: boolean = data.isWater;
	if (response && is_water) {
		return "water"
	} else if (response) {
		return "plain"
	} else {
		return "tile"
	}
}

// Note: You have to manually delete content of generated_map if not continuing same degree increment
async function makeTerrainMap(degree_increment: number, ignore_file: boolean = false, start_lnt: number = -180, end_lnt: number = 180): Promise<Array<Array<string>>> {
	if (start_lnt === -180 && end_lnt === 180) {
		ignore_file = true
	}

	let grid_map: Array<Array<string>>;
	if (!ignore_file) {
		console.log("reading previous map file...")
		const grid_map_file: string = await readFile('src/map/output/generated_map.json', 'utf-8');
		console.log("previous map file read!")

		console.log("prasing map file...")
		try {
			grid_map = JSON.parse(grid_map_file);
			console.log("map file parsed!")
		} catch (error) {
			console.error("failed parsing map file. Exiting process. If you wish to skip reading 'map_generation.ts', use ");
			process.exit();
		}
	} else {
		console.log("skipped reading map file, grid map set to empty array.")
		grid_map = new Array;
	}

	const chunk_size: number = 30;

	const tasks: Array<TileTask> = new Array;

	// collect task definitions
	const completed_lnt_distance: number = start_lnt - (-180);
	let grid_x: number = Math.round(completed_lnt_distance / degree_increment);

  	for (let lnt = start_lnt; lnt < end_lnt; lnt += degree_increment) {
		grid_map[grid_x] = new Array;

		let grid_y: number = 0;
		for (let lat = 75; lat >= -55; lat -= (degree_increment * 0.75)) {
			const odd_tile: boolean = grid_y % 2 === 1
			let nested_terrain: () => Promise<string>;

			if (odd_tile) {
				nested_terrain = () => latLntToTerrain(lat, lnt + 0.5 * degree_increment);
			} else {
				nested_terrain = () => latLntToTerrain(lat, lnt);
			}

			tasks.push({
				promise: nested_terrain,
				x: grid_x,
				y: grid_y,
				lat: lat,
				lnt: lnt
			});

			grid_y++;
		}
		grid_x++;
  	}

	// process tasks in chunks
	for (let i = 0; i < tasks.length; i+= chunk_size) {
		try {
			const chunk: Array<TileTask> = tasks.slice(i, i + chunk_size);
			const results: Array<string> = await Promise.all(chunk.map(task => task.promise()));

			for (let j = 0; j < chunk.length; j++) {
				try {
					const tile = chunk[j];
					const terrain = results[j];
					console.log(Math.round(((tile.lnt + 180) / 360) * 10000) / 100, '%', "|||", tile.x, tile.y, "|||", tile.lat, tile.lnt, "|||", terrain);
					grid_map[tile.x][tile.y] = terrain;
				} catch (error) {
					console.error("ERROR AT J-LEVEL", 'i:', i, 'j:', j);
					j--;
				}
			}
			// write JSON
			await writeJSON(grid_map, 'src/map/output/generated_map.json');
		} catch (error) {
			console.error("ERROR AT I-LEVEL", 'i:', i);
			i--;
		}
	}
	console.log("terrain grid generation complete")
	return grid_map;
}

const generated_map: Array<Array<string>> = await makeTerrainMap(0.25, false, 165);
await writeJSON(generated_map, 'src/map/output/map.json');