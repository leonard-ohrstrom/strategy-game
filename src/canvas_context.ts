/**
 * Fetches HTML canvas and context, used by RendererManager to draw frames on
 * website.
 */

import { makeVector } from "./type_constructors";
import type { Vector } from "./types";

export const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
export const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
export function setCanvasDimensions(width: number, height: number): void {
    canvas.width = width; canvas.height = height;
}
export function setCanvasToBrowser(): void {
    setCanvasDimensions(window.innerWidth - 3, window.innerHeight - 3);
}
export function getCanvasCentre(): Vector {
    const centre_width = Math.round(canvas.width/2);
    const centre_height = Math.round(canvas.height/2);
    return makeVector(centre_width, centre_height);
}
export function clearCanvas(): void { context.reset() }