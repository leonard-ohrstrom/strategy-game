import { makeVector, type Vector } from "../types/typesold";

export const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
export const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

let width: number = 0;
let height: number = 0;

export function fitCanvasToBrowser(): void {
    width = window.innerWidth - 3;
    height = window.innerHeight - 3;

    canvas.width = width;
    canvas.height = height;
}

export function setCanvasDimensions(input_width: number, input_height: number): void {
    width = input_width;
    height = input_height;

    canvas.width = width;
    canvas.height = height;
}

export function isCanvasFittedToBrowser(): boolean {
    return ((canvas.width === window.innerWidth - 3) && (canvas.height === window.innerHeight - 3));
}

export function clearCanvas(): void {
    context.reset();
}

export function getCanvasCentre(): Vector {
    return makeVector(Math.round(canvas.width / 2), Math.round(canvas.height / 2));
}

export function getCanvasDimensions(): Vector {
    return makeVector(width, height);
}