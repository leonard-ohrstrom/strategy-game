/// methods do not mutate original vector
export class Vector {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public add(addend: Vector): Vector {
        return new Vector(this.x + addend.x, this.y + addend.y);
    }

    public subtract(this: Vector, subtrahend: Vector): Vector {
        return new Vector(this.x - subtrahend.x, this.y - subtrahend.y);
    }

    public scale(factor: number): Vector {
        return new Vector(this.x * factor, this.y * factor);
    }

    public equals(comparitor: Vector): boolean {
    return this.x === comparitor.x && this.y === comparitor.y;
    }

    public copy(this: Vector): Vector {
        return new Vector(this.x, this.y);
    }

    public distance(comparitor: Vector): number {
        const delta_x: number = this.x - comparitor.x;
        const delta_y: number = this.y - comparitor.y;
        return Math.sqrt(delta_x ** 2 + delta_y ** 2);
    }

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }
    
    public static fromString(vector_string: string): Vector {
        const i_opening_parentheses: number = vector_string.indexOf("(");
        const i_comma: number = vector_string.indexOf(",", i_opening_parentheses + 1);
        const i_closing_parentheses: number = vector_string.indexOf(")", i_comma + 1);
    
        const str_x: string = vector_string.slice(i_opening_parentheses + 1, i_comma);
        const str_y: string = vector_string.slice(i_comma + 2, i_closing_parentheses);
    
        const x: number = Number(str_x);
        const y: number = Number(str_y);
    
        return new Vector(x, y);
    }
}