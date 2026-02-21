export type Vector = {
    x: number,
    y: number
};

export function make_vector(a : number = 0, b: number = 0): Vector {
    return {
        x: a,
        y: b
    }
}

export type Rectangle = {
    width: number,
    height: number,
    position: Vector
};

export function getRandomInteger(min: number, max: number): number {
    return Math.round(max - Math.random() * (min + 1));
}