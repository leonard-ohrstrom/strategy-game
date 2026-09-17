// npx tsx src/map/generator/map_generator_img.ts

import { writeFile } from "atomically";
import { makeRectangle, makeVector } from "../../types/type_constructors";
import type { Rectangle, Vector } from "../../types/types";
import sharp, { type OutputInfo } from "sharp";

type string_colour = string;
type ColourAssociation = [string, string_colour];
type ImageData =
{
    path: string,
    img_dimensions: Vector,
    img_portion: Rectangle,
    terrain_colours: ColourAssociation[]
};
type TerrainMap = string[][];

function associationValue(association: ColourAssociation): string
{
    return association[0];
}

function associationColour(association: ColourAssociation): string
{
    return association[1];
}

function rgbStringToNumbers(colour_string: string_colour): [number, number, number]
{
    const i_opening_parentheses: number = colour_string.indexOf("(");
    const i_1st_comma: number = colour_string.indexOf(",", i_opening_parentheses + 1);
    const i_2nd_comma: number = colour_string.indexOf(",", i_1st_comma + 1);
    const i_closing_parentheses: number = colour_string.indexOf(")", i_2nd_comma + 1);

    const str_r: string = colour_string.slice(i_opening_parentheses + 1, i_1st_comma);
    const str_g: string = colour_string.slice(i_1st_comma + 2, i_2nd_comma);
    const str_b: string = colour_string.slice(i_2nd_comma + 2, i_closing_parentheses);

    const r: number = Number(str_r);
    const g: number = Number(str_g);
    const b: number = Number(str_b);

    return [r, g, b];
}

function rgbNumbersToString(colour_numbers: [number, number, number]): string_colour
{
    const r: number = colour_numbers[0];
    const g: number = colour_numbers[1];
    const b: number = colour_numbers[2];

    return `RGB(${r}, ${g}, ${b})`;
}

function rgbStringsDistance(colour1: string_colour, colour2: string_colour): number
{
    const num_colour1: [number, number, number] = rgbStringToNumbers(colour1);
    const num_colour2: [number, number, number] = rgbStringToNumbers(colour2);

    const r1: number = num_colour1[0];
    const g1: number = num_colour1[1];
    const b1: number = num_colour1[2];

    const r2: number = num_colour2[0];
    const g2: number = num_colour2[1];
    const b2: number = num_colour2[2];

    const r_distance: number = r1 - r2;
    const g_distance: number = g1 - g2;
    const b_distance: number = b1 - b2;

    const rgb_distance: number = Math.sqrt((r_distance ** 2 + g_distance ** 2 + b_distance ** 2));

    return rgb_distance;
}

function getClosestColour(colour: string_colour, colours: string_colour[]): string_colour
{
    let lowest_found_distance: number = 500; // max distance ca 441.7
    let closest_colour: string_colour = colour;

    colours.forEach((colour_compare: string_colour) => {
        const this_distance = rgbStringsDistance(colour, colour_compare);

        if (this_distance < lowest_found_distance)
        {
            lowest_found_distance = this_distance;
            closest_colour = colour_compare;
        }
    });

    return closest_colour;
}

async function getImageBuffer(image_path: string): Promise<[Buffer<ArrayBuffer>, OutputInfo]>
{
    const { data, info } = await sharp(image_path)
    .raw()
    .toBuffer({ resolveWithObject: true });

    return [data, info];
}

function readPixelRgb(image_buffer: [Buffer<ArrayBuffer>, OutputInfo], x: number, y: number): [number, number, number] {
    const img_data: Buffer<ArrayBuffer> = image_buffer[0];
    const img_info: OutputInfo = image_buffer[1];

    const channels = img_info.channels;

    const buf_index = (y * img_info.width + x) * channels;

    const pixel_r: number = img_data[buf_index];
    const pixel_g: number = img_data[buf_index + 1];
    const pixel_b: number = img_data[buf_index + 2];

    return [pixel_r, pixel_g, pixel_b];
}

/**
 * **Please ensure points (x +/- samples, y +/- samples) actually exist on image buffer before envoking.**
 */
function medianRgbSurroundingPixel(image_buffer: [Buffer<ArrayBuffer>, OutputInfo], x: number, y: number, samples: number): string_colour {
    const rgbs_near_pixel: Map<string_colour, number> = new Map;
    for (let samp_x = x - samples; samp_x < x + samples; samp_x++) {
        for (let samp_y = y - samples; samp_y < y + samples; samp_y++) {
            const colour_rgb_num: [number, number, number] = readPixelRgb(image_buffer, samp_x, samp_y);
            const colour_rgb_str: string_colour = rgbNumbersToString(colour_rgb_num);

            const colour_count: number = rgbs_near_pixel.get(colour_rgb_str) ?? 0;

            rgbs_near_pixel.set(colour_rgb_str, colour_count + 1);
        }
    }

    let most_common_rgb = "RGB(0, 0, 0)";
    let highest_count = 0;
    rgbs_near_pixel.forEach((count, rgb_str) => {
        if (count > highest_count) {
            highest_count = count;
            most_common_rgb = rgb_str;
        }
    });

    if (highest_count === 0) {
        console.warn(`no colours found for (${x}, ${y}) with ${samples} samples`);
        rgbs_near_pixel.forEach((count, rgb_str) => {
            console.log("rgb:", rgb_str);
        });
    }
    return most_common_rgb;
}

async function generateMapFromImage(image_data: ImageData, pixel_increment: number, samples: number): Promise<TerrainMap>
{
    console.log("generating map");

    const image_portion: Rectangle = image_data.img_portion;
    const image_start: Vector = image_portion.position;
    const image_start_x: number = image_start.x;
    const image_start_y: number = image_start.y;
    const image_end_x: number = image_portion.width + image_start_x;
    const image_end_y: number = image_portion.height + image_start_y;

    const colour_associations: ColourAssociation[] = image_data.terrain_colours;
    const colours: string_colour[] = colour_associations.map((association: ColourAssociation) => {
        return associationColour(association);
    });
    const associations: string[] = colour_associations.map((association: ColourAssociation) => {
        return associationValue(association);
    });

    const path: string = image_data.path;
    const image_buffer = await getImageBuffer(path);

    const map: TerrainMap = [];
    let map_x = 0;
    let map_y = 0;
    for (let img_x = image_start_x + samples; img_x < image_end_x  + samples; img_x += pixel_increment)
    {
        map[map_x] = [];
        for (let img_y = image_start_y + samples; img_y < image_end_y + samples; img_y += pixel_increment)
        {
            const pixel_rgb_str: string = medianRgbSurroundingPixel(image_buffer, img_x, img_y, samples);

            const closest_colour: string = getClosestColour(pixel_rgb_str, colours);
            const closest_colour_index: number = colours.indexOf(closest_colour);
            const closest_colour_terrain: string = associations[closest_colour_index];
            
            map[map_x][map_y] = closest_colour_terrain;
            map_y++;
        }
        // console.log(`${Math.round(((img_x - image_start_x - samples) / (image_end_x - image_start_x - samples)) * 10000) / 100} %`);
        map_y = 0;
        map_x++;
    }

    return map;
}

/**
 * doesn't actually test, you have to read the results yourself :))))
 */
async function tests(): Promise<void>
{
    console.log("rgb string to numbers:", rgbStringToNumbers("rgb(255, 128, 0)"));
    console.log("rgb string to numbers:", rgbStringToNumbers("rgb(0, 0, 0)"));
    console.log("rgb string to numbers:", rgbStringToNumbers("rgb(255, 255, 255)"));

    console.log("rgb distance:", rgbStringsDistance("rgb(0, 0, 0)", "rgb(255, 255, 255)"));
    console.log("rgb distance:", rgbStringsDistance("rgb(100, 100, 100)", "rgb(100, 100, 100)"));
    console.log("rgb distance:", rgbStringsDistance("rgb(10, 20, 30)", "rgb(20, 20, 30)"));

    const colours = [
    "rgb(255, 0, 0)",
    "rgb(0, 255, 0)",
    "rgb(0, 0, 255)",
    ];

    console.log("get closest colour:", getClosestColour("rgb(250, 10, 10)", colours));
    console.log("get closest colour:", getClosestColour("rgb(10, 240, 10)", colours));
    console.log("get closest colour:", getClosestColour("rgb(10, 10, 240)", colours));

    const image_buffer: [Buffer<ArrayBuffer>, OutputInfo] = await getImageBuffer("public/mapgen/test.png");

    console.log("read pixel rgb:", readPixelRgb(image_buffer, 1, 1), "should be: [255, 0, 0]");
    console.log("read pixel rgb:", readPixelRgb(image_buffer, 9, 1), "should be: [0, 255, 0]");
    console.log("read pixel rgb:", readPixelRgb(image_buffer, 1, 9), "should be: [0, 0, 255]");
    console.log("read pixel rgb:", readPixelRgb(image_buffer, 5, 5), "should be: [0, 0, 0]");
    console.log("read pixel rgb:", readPixelRgb(image_buffer, 9, 9), "should be: [255, 255, 255]");

    console.log("median rgb:", medianRgbSurroundingPixel(image_buffer, 5, 5, 5), "should be: RGB(255, 0, 0)");
    console.log("median rgb:", medianRgbSurroundingPixel(image_buffer, 5, 5, 4), "should be: RGB(0, 0, 255)");
    console.log("median rgb:", medianRgbSurroundingPixel(image_buffer, 5, 5, 0), "should be: RGB(0, 0, 0)");
    console.log("median rgb:", medianRgbSurroundingPixel(image_buffer, 5, 5, 1), "should be: RGB(0, 0, 0)");
}

const plain_association: ColourAssociation = ["plain", "RGB(255, 129, 66)"];
const forest_association: ColourAssociation = ["forest", "RGB(89, 199, 85)"];
const hill_association: ColourAssociation = ["hill", "RGB(248, 255, 153)"];
const mountain_association: ColourAssociation = ["mountain", "RGB(157, 192, 208)"];
const marsh_association: ColourAssociation = ["marsh", "RGB(76, 96, 35)"];
const jungle_association: ColourAssociation = ["jungle", "RGB(127, 191, 0)"];
const desert_association: ColourAssociation = ["desert", "RGB(255, 63, 0)"];
const snow_association: ColourAssociation = ["snow", "RGB(255, 255, 255)"];
const city_association: ColourAssociation = ["forest", "RGB(255, 129, 66)"]; // TODO
const water_association: ColourAssociation = ["water", "RGB(40, 83, 176)"];
const lake_association: ColourAssociation = ["water", "RGB(58, 91, 255)"]; // TODO

const terrain_associations: ColourAssociation[] = 
[
    plain_association,
    forest_association,
    hill_association,
    mountain_association,
    marsh_association,
    jungle_association,
    desert_association,
    snow_association,
    city_association,
    water_association,
    lake_association
];

const sweden_association: ColourAssociation = ["SWE", "RGB(36, 132, 247)"];
const norway_association: ColourAssociation = ["NOR", "RGB(111, 71, 71)"];
const denmark_association: ColourAssociation = ["DEN", "RGB(153, 116, 93)"];
const finland_association: ColourAssociation = ["FIN", "RGB(205, 212, 228)"];
const estonia_association: ColourAssociation = ["EST", "RGB(50, 135, 175)"];
const latvia_association: ColourAssociation = ["LTV", "RGB(75, 77, 186)"];
const lithuania_association: ColourAssociation = ["LTH", "RGB(219, 219, 119)"];
const germany_association: ColourAssociation = ["GER", "RGB(102, 96, 87)"];
const poland_association: ColourAssociation = ["POL", "RGB(214, 102, 139)"];
const czechoslovakia_association: ColourAssociation = ["CZE", "RGB(54, 167, 156)"];
const austria_association: ColourAssociation = ["AUT", "RGB(194, 198, 215)"];
const hungary_association: ColourAssociation = ["HUN", "RGB(249, 126, 98)"];
const romania_association: ColourAssociation = ["ROM", "RGB(215, 196, 72)"];
const yugoslavia_association: ColourAssociation = ["YUG", "RGB(72, 73, 126)"];
const bulgaria_association: ColourAssociation = ["BUL", "RGB(51, 155, 0)"];
const albania_association: ColourAssociation = ["ALB", "RGB(149, 45, 102)"];
const greece_association: ColourAssociation = ["GRE", "RGB(93, 181, 227)"];
const netherlands_association: ColourAssociation = ["NTH", "RGB(203, 138, 74)"];
const belgium_association: ColourAssociation = ["BEL", "RGB(193, 171, 8)"];
const luxembourg_association: ColourAssociation = ["LUX", "RGB(65, 175, 179)"];
const switzerland_association: ColourAssociation = ["SWI", "RGB(224, 5, 5)"];
const france_association: ColourAssociation = ["FRA", "RGB(57, 113, 228)"];
const italy_association: ColourAssociation = ["ITA", "RGB(67, 127, 63)"];
const britain_association: ColourAssociation = ["ENG", "RGB(242, 58, 73)"];
const ireland_association: ColourAssociation = ["IRE", "RGB(80, 159, 90)"];
const spain_association: ColourAssociation = ["SPA", "RGB(242, 205, 94)"];
const portugal_association: ColourAssociation = ["POR", "RGB(39, 116, 70)"];
const soviet_association: ColourAssociation = ["SOV", "RGB(130, 0, 0)"];
const turkey_association: ColourAssociation = ["TUR", "RGB(171, 190, 152)"];
const ethiopia_association: ColourAssociation = ["ETH", "RGB(99, 0, 181)"];
const saudi_arabia_association: ColourAssociation = ["SAU", "RGB(33, 99, 57)"];
const iran_association: ColourAssociation = ["IRN", "RGB(108, 204, 167)"];
const afghanistan_association: ColourAssociation = ["AFG", "RGB(64, 160, 167)"];
const australia_association: ColourAssociation = ["AUS", "RGB(57, 143, 97)"];
const new_zealand_association: ColourAssociation = ["NZE", "RGB(56, 56, 181)"];
const canada_association: ColourAssociation = ["CAN", "RGB(104, 39, 45)"];
const america_association: ColourAssociation = ["USA", "RGB(20, 133, 237)"];
const mexico_association: ColourAssociation = ["MEX", "RGB(104, 152, 83)"];
const cuba_association: ColourAssociation = ["CUB", "RGB(140, 65, 166)"];
const haiti_association: ColourAssociation = ["HAI", "RGB(174, 113, 113)"];
const dominican_republic_association: ColourAssociation = ["DCA", "RGB(152, 130, 191)"];
const guatemala_association: ColourAssociation = ["GUA", "RGB(72, 49, 112)"];
const el_salvador_association: ColourAssociation = ["SAL", "RGB(108, 101, 119)"];
const honduras_association: ColourAssociation = ["HON", "RGB(128, 145, 65)"];
const nicaragua_association: ColourAssociation = ["NIC", "RGB(146, 179, 191)"];
const costa_rica_association: ColourAssociation = ["COS", "RGB(152, 128, 43)"];
const panama_association: ColourAssociation = ["PAN", "RGB(114, 98, 142)"];
const colombia_association: ColourAssociation = ["COL", "RGB(222, 187, 91)"];
const venezuela_association: ColourAssociation = ["VEN", "RGB(255, 229, 181)"];
const ecuador_association: ColourAssociation = ["ECU", "RGB(249, 146, 98)"];
const peru_association: ColourAssociation = ["PER", "RGB(196, 189, 204)"];
const brazil_association: ColourAssociation = ["BRA", "RGB(76, 145, 63)"];
const bolivia_association: ColourAssociation = ["BOL", "RGB(204, 166, 108)"];
const paraguay_association: ColourAssociation = ["PAR", "RGB(60, 150, 150)"];
const chile_association: ColourAssociation = ["CHL", "RGB(155, 101, 107)"];
const argentina_association: ColourAssociation = ["ARG", "RGB(145, 157, 236)"];
const uruguay_association: ColourAssociation = ["URG", "RGB(141, 206, 128)"];
const japan_association: ColourAssociation = ["JAP", "RGB(255, 201, 178)"];
const manchuria_association: ColourAssociation = ["MAN", "RGB(255, 120, 71)"];
const mengjiang_association: ColourAssociation = ["MGJ", "RGB(185, 255, 152)"];
const tannu_tuva_association: ColourAssociation = ["TUV", "RGB(188, 58, 130)"];
const mongolia_association: ColourAssociation = ["MON", "RGB(108, 140, 42)"];
const sinkiang_association: ColourAssociation = ["SIN", "RGB(226, 226, 104)"];
const china_association: ColourAssociation = ["CHI", "RGB(40, 40, 140)"];
const tibet_association: ColourAssociation = ["TIB", "RGB(80, 100, 45)"];
const nepal_association: ColourAssociation = ["NEP", "RGB(181, 208, 255)"];
const bhutan_association: ColourAssociation = ["BHU", "RGB(226, 157, 72)"];
const thailand_association: ColourAssociation = ["TAI", "RGB(56, 47, 47)"];
const none_association: ColourAssociation = ["", "RGB(0, 0, 0)"];

const tag_associations: ColourAssociation[] = 
[
    sweden_association,
    norway_association,
    denmark_association,
    finland_association,
    estonia_association,
    latvia_association,
    lithuania_association,
    germany_association,
    poland_association,
    czechoslovakia_association,
    austria_association,
    hungary_association,
    romania_association,
    yugoslavia_association,
    bulgaria_association,
    albania_association,
    greece_association,
    netherlands_association,
    belgium_association,
    luxembourg_association,
    switzerland_association,
    france_association,
    italy_association,
    britain_association,
    ireland_association,
    spain_association,
    portugal_association,
    soviet_association,
    turkey_association,
    ethiopia_association,
    saudi_arabia_association,
    iran_association,
    afghanistan_association,
    australia_association,
    new_zealand_association,
    canada_association,
    america_association,
    mexico_association,
    cuba_association,
    haiti_association,
    dominican_republic_association,
    guatemala_association,
    el_salvador_association,
    honduras_association,
    nicaragua_association,
    costa_rica_association,
    panama_association,
    colombia_association,
    venezuela_association,
    ecuador_association,
    peru_association,
    brazil_association,
    bolivia_association,
    paraguay_association,
    chile_association,
    argentina_association,
    uruguay_association,
    japan_association,
    manchuria_association,
    mengjiang_association,
    tannu_tuva_association,
    mongolia_association,
    sinkiang_association,
    china_association,
    tibet_association,
    nepal_association,
    bhutan_association,
    thailand_association,
    none_association
];

async function writeJSON(data: any, relative_path: string): Promise<void> {
	data = JSON.stringify(data, null, 2);
	await writeFile(relative_path, data, "utf-8");
}

const geo_map_image_data: ImageData =
{
    path: "public/mapgen/hoi4_geo.png",
    img_dimensions: makeVector(5631, 2047),
    img_portion: makeRectangle(0, 0, 5631, 2047),
    terrain_colours: terrain_associations
};

const geo_map = await generateMapFromImage(geo_map_image_data, 4, 2);
await writeJSON(geo_map, 'src/map/output/map_geo.json');
console.log("geography map succesfully generated and written");

const pol_map_image_data: ImageData =
{
    path: "public/mapgen/hoi4_pol.png",
    img_dimensions: makeVector(5631, 2047),
    img_portion: makeRectangle(0, 0, 5631, 2047),
    terrain_colours: tag_associations
};

const pol_map = await generateMapFromImage(pol_map_image_data, 4, 2);
await writeJSON(pol_map, 'src/map/output/map_pol.json');
console.log("political map succesfully generated and written");