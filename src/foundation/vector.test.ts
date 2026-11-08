import { expect, test } from 'vitest'
import { Vector } from './vector';

test('constructor', () => {
    const vector: Vector = new Vector(0, 0);

    expect(vector).toBeInstanceOf(Vector);
});

test('vector equals', () => {
    const vector1: Vector = new Vector(-1, 3);
    const vector2: Vector = new Vector(-1, 3);
    const vector3: Vector = new Vector(3, -1);

    expect(vector1.equals(vector2)).toBe(true);
    expect(vector1.equals(vector3)).toBe(false);
});

test('add', () => {
    const vector1: Vector = new Vector(5, 7);
    const vector2: Vector = new Vector(1, -2);

    const vectorSum: Vector = new Vector(6, 5);

    // correct sum
    expect(vector1.add(vector2).equals(vectorSum)).toBe(true);

    // does not mutate arguments
    expect(vector1.equals(new Vector(5, 7))).toBe(true);
    expect(vector2.equals(new Vector(1, -2))).toBe(true);
});

test('subtract', () => {
    const vector1: Vector = new Vector(3, 6);
    const vector2: Vector = new Vector(-1, 1);

    const vectorDifference: Vector = new Vector (4, 5);

    // correct difference
    expect(vector1.subtract(vector2).equals(vectorDifference)).toBe(true);

    // does not mutate arguments
    expect(vector1.equals(new Vector(3, 6))).toBe(true);
    expect(vector2.equals(new Vector(-1, 1))).toBe(true);
});

test('scale (multiply)', () => {
    const vector1: Vector = new Vector(2, 4);
    const factor1: number = 3;

    const vectorProduct1: Vector = new Vector(6, 12);

    const vector2: Vector = new Vector(-5, 3);
    const factor2: number = -2;

    const vectorProduct2: Vector = new Vector(10, -6);

    // correct scaling
    expect(vector1.scale(factor1).equals(vectorProduct1)).toBe(true);
    expect(vector2.scale(factor2).equals(vectorProduct2)).toBe(true);
    expect(vector1.scale(0).equals(new Vector(0, 0))).toBe(true);

    // does not mutate arguments
    expect(vector1.equals(new Vector(2, 4))).toBe(true);
    expect(vector2.equals(new Vector(-5, 3))).toBe(true);
});

test('copying', () => {
    const vector: Vector = new Vector(5, 1);
    const vectorCopy: Vector = vector.copy();

    // mutate vector
    vector.x = 0;
    vector.y = 0;

    expect(vector.equals(vectorCopy)).toBe(false);
    expect(vectorCopy.equals(new Vector(5, 1))).toBe(true);
});

test('vector to string', () => {
    const vector1: Vector = new Vector(3, 6);
    const vector1String: string = vector1.toString();

    const vector2: Vector = new Vector(-1, -2);
    const vector2String: string = vector2.toString();

    expect(vector1String).toBe("(3, 6)");
    expect(vector2String).toBe("(-1, -2)");
});

test('vector from string', () => {
    const vectorString: string = "(-1, 8)";
    const vector: Vector = new Vector(-1, 8);

    expect(Vector.fromString(vectorString).equals(vector)).toBe(true);
});