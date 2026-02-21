export type Vector = {
    x: number,
    y: number
};

export function makeVector(a : number = 0, b: number = 0): Vector {
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
    const delta = max - min;
    return Math.round(min + delta * Math.random());
}