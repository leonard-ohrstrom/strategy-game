/// methods do not mutate original rectangle
export class Rectangle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    public constructor(x: number, y: number, width: number, height: number) {
        if (width < 0 || height < 0) {
            throw new Error("rectangle cannot have negative dimensions");
        }

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Scales a given rectangle around the origin (0, 0).
     * @param factor a non-negative number
     * @returns rectangle scaled by factor around origin
     */
    public scale(factor: number): Rectangle {
        if (factor < 0) throw new Error ("factor less than 0");

        const scaledX: number = this.x * factor;
        const scaledY: number = this.y * factor;
        const scaledWidth: number = this.width * factor;
        const scaledHeight: number = this.height * factor;

        return new Rectangle(scaledX, scaledY, scaledWidth, scaledHeight);
    }

    /**
     * Scales width and height of a rectangle by a given factor.
     * @param factor a non-negative number
     * @returns rectangle scaled by factor around start corner
     */
    public factor(factor: number): Rectangle {
        if (factor < 0) throw new Error("factor less than 0");

        const scaledWidth: number = this.width * factor;
        const scaledHeight: number = this.height * factor;

        return new Rectangle(this.x, this.y, scaledWidth, scaledHeight);
    }

    /**
     * Translates (moves) a given rectangle by a vector.
     * @param displacement vector to move rectangle by
     * @returns rectangle translated by displacement
     */
    public translate(displacementX: number, displacementY: number): Rectangle {
        const translatedX = this.x + displacementX;
        const translatedY = this.y + displacementY;

        return new Rectangle(translatedX, translatedY, this.width, this.height);
    }
}