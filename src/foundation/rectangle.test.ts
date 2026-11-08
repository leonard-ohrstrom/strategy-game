import { expect, test } from 'vitest'
import { Rectangle } from './rectangle';

test('constructor', () => {
    const rect: Rectangle = new Rectangle(0, 0, 0, 0);

    expect(rect).toBeInstanceOf(Rectangle);

    // width less than zero
    let wasError: boolean = false;
    try {
        new Rectangle(0, 0, -1, 0);
    } catch (error) {
        wasError = true;
    }

    expect(wasError).toBe(true);

    // height less than zero
    wasError = false;
    try {
        new Rectangle(0, 0, -1, 0);
    } catch (error) {
        wasError = true;
    }

    expect(wasError).toBe(true);
});

test('scale', () => {
    const rect: Rectangle = new Rectangle(-5, -3, 15, 2);
    const sRect: Rectangle = rect.scale(2);

    // scaled correctly
    expect(sRect.x).toBe(-10);
    expect(sRect.y).toBe(-6);
    expect(sRect.width).toBe(30);
    expect(sRect.height).toBe(4);

    // no mutation
    expect(rect.x).toBe(-5);
    expect(rect.y).toBe(-3);
    expect(rect.width).toBe(15);
    expect(rect.height).toBe(2);

    // does not accept negative factor
    let wasError: boolean = false;
    try { // edge case: factor = 0 (should be accepted)
        rect.scale(0);
    } catch (error) {
        wasError = true;
    }

    expect(wasError).toBe(false);

    wasError = false;
    try {
        rect.scale(-1);
    } catch (error) {
        wasError = true;
    }

    expect(wasError).toBe(true);
});

test('factor', () => {
    const rect: Rectangle = new Rectangle(1, 2, 3, 4);
    const fRect: Rectangle = rect.factor(3);

    // factored correctly
    expect(fRect.x).toBe(1);
    expect(fRect.y).toBe(2);
    expect(fRect.width).toBe(9);
    expect(fRect.height).toBe(12);

    // no mutation
    expect(rect.x).toBe(1);
    expect(rect.y).toBe(2);
    expect(rect.width).toBe(3);
    expect(rect.height).toBe(4);

    // does not accept negative factor
    let wasError: boolean = false;
    try { // edge case: factor = 0 (should be accepted)
        rect.factor(0);
    } catch (error) {
        wasError = true;
    }

    expect(wasError).toBe(false);

    wasError = false;
    try {
        rect.factor(-1);
    } catch (error) {
        wasError = true;
    }

    expect(wasError).toBe(true);
});

test('translate', () => {
    const rect: Rectangle = new Rectangle(0, 0, 2, 2);
    const tRect: Rectangle = rect.translate(-1, 2);

    // translated correctly
    expect(tRect.x).toBe(-1);
    expect(tRect.y).toBe(2);
    expect(tRect.width).toBe(2);
    expect(tRect.height).toBe(2);

    // no mutation
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(2);
    expect(rect.height).toBe(2);
});