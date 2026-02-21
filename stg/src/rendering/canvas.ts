import { makeVector, type Vector } from "../types/types";

export const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
export const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

let width: number = 0;
let height: number = 0;

export function fitCanvasToBrowser() {
    width = window.innerWidth - 3;
    height = window.innerHeight - 3;

    canvas.width = width;
    canvas.height = height;
}

export function setCanvasDimensions(input_width: number, input_height: number) {
    width = input_width;
    height = input_height;

    canvas.width = width;
    canvas.height = height;
}

export function canvasFittedToBrowser() {
    return ((canvas.width === window.innerWidth - 3) && (canvas.height === window.innerHeight - 3));
}

export function clearCanvas() {
    context.reset();
}

export function canvasCenter() {
    return makeVector(Math.round(canvas.width / 2), Math.round(canvas.height / 2));
}

export function getCanvasDimensions(): Vector {
    return makeVector(width, height);
}