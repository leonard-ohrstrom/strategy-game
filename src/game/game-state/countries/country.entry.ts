export class Country {
    private tagValue: string;
    private nameValue: string;
    private colorValue: string; // HEX

    public constructor(tag: string, name: string, color: string) {
        this.tagValue = tag;
        this.nameValue = name;
        this.colorValue = color;
    }

    // ACCESSORS
    public get tag(): string {
        return this.tagValue;
    }

    public get name(): string {
        return this.nameValue;
    }

    public get color(): string {
        return this.colorValue;
    }

    public set name(name: string) {
        this.nameValue = name;
    }

    public set color(color: string) {
        this.colorValue = color;
    }
}