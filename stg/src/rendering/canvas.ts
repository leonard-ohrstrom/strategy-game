export const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
export const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

export function fit_canvas_to_browser() {
    canvas.width = window.innerWidth - 3;
    canvas.height = window.innerHeight - 3;

    console.log(canvas);
    console.log("innerWidth:", window.innerWidth)
    console.log("innerHeight:", window.innerHeight)
}

export function set_canvas_dimensions(input_width: number, input_height: number) {
    canvas.width = input_width;
    canvas.height = input_height;

    console.log(canvas);
    console.log("manual width:", canvas.width)
    console.log("manual width:", canvas.height)
}