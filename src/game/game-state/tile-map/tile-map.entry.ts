export class Tile {
    private ownerValue: string | null;
    private controllerValue: string | null;
    private readonly unitIDsValue: number[];
    private readonly terrainValue: string;

    public constructor(terrain: string, controller: string | null, owner: string | null, landUnits: number[]) {
        this.terrainValue = terrain;
        this.ownerValue = owner;
        this.controllerValue = controller;
        this.unitIDsValue = [...landUnits];
    }

    /// ACCESSORS
    public get terrain(): string {
        return this.terrainValue;
    }

    public get owner(): string | null {
        return this.ownerValue;
    }

    public get controller(): string | null {
        return this.controllerValue;
    }

    public get units(): readonly number[] {
        return this.unitIDsValue;
    }

    public set controller(controller: string) {
        this.controllerValue = controller;
    }

    /**
     * transfers ownership and sets controller to new owner
     */
    public transferOwnership(newOwner: string | null) {
        this.ownerValue = newOwner;
        this.controllerValue = newOwner;
    }
}