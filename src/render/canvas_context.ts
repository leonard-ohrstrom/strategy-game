/**
 * Fetches HTML canvas and context, used by RendererManager to draw frames on
 * website.
 */
import { makeVector } from "../types/type_constructors";
import type { Vector } from "../types/types";

export const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
export const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

let canvas_width: number = 0;
let canvas_height: number = 0;

export function setCanvasDimensions(width: number, height: number): void {
    canvas.width = width;
    canvas.height = height;
    canvas_width = width;
    canvas_height = height;
}

export function setCanvasToBrowser(): void {
    setCanvasDimensions(window.innerWidth - 3, window.innerHeight - 3);
}

export function getCanvasCentre(): Vector {
    const centre_width = Math.round(canvas_width/2);
    const centre_height = Math.round(canvas_height/2);
    return makeVector(centre_width, centre_height);
}

export function getCanvasDimensions(): Vector {
    return makeVector(canvas_width, canvas_height);
}

export function clearCanvas(): void {
    context.reset()
}