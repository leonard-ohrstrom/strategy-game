export function addRgbValue(rgb: string, add_rgb: string): string  {
    const rgb_num: [number, number, number] = rgbStringToNumbers(rgb);
    const add_rgb_num: [number, number, number] = rgbStringToNumbers(add_rgb);

    const r: number = ValueInRange(0, 255, rgb_num[0] + add_rgb_num[0]);
    const g: number = ValueInRange(0, 255, rgb_num[1] + add_rgb_num[1]);
    const b: number = ValueInRange(0, 255, rgb_num[2] + add_rgb_num[2]);

    return rgbNumbersToString([r, g, b]);
}

export function rgbStringToNumbers(colour_string: string): [number, number, number]
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

export function rgbNumbersToString(colour_numbers: [number, number, number]): string
{
    const r: number = colour_numbers[0];
    const g: number = colour_numbers[1];
    const b: number = colour_numbers[2];

    return `RGB(${r}, ${g}, ${b})`;
}

function ValueInRange(min: number, max: number, val: number) {
    return Math.min(Math.max(min, val), max);
}