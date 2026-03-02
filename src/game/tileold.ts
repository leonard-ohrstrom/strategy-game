export class Tile {
    private terrain: string;
    private texture: string = "";
    private troops: number = 0;
    private selected: boolean = false;

    constructor(terrain: string) {
        this.terrain = terrain;
    }

    isSelected(): boolean {
        return this.selected;
    }

    getTerrain(): string {
        return this.terrain;
    }

    selectTile(): void {
        this.selected = !this.selected; // flip boolean, ie select/unselect
    }

    getTroopCount(): number {
        return this.troops;
    }

    private changeTroopCount(amount: number) {
        this.troops += amount;
    }

    addTroops(amount: number) {
        if (amount >= 0) {
            this.changeTroopCount(amount);
        } else {
            console.log("ERROR: addTroops argument less than 0")
        }
    }

    removeTroops(amount: number) {
        if (amount >= 0 && this.troops - amount >= 0) {
                this.changeTroopCount(-amount);
        } else if (amount >= 0) {
            console.log("ERROR: removeTroops troops - amount less than 0")
        } else {
            console.log("ERROR: removeTroops argument less than 0")
        }
    }

    getTerrainTexture(): string {
        const terrain = this.terrain;
        switch(terrain) {
            case "plain": {
                this.texture = "./textures/hexagon_camo_pattern1.png";
                break;
            }
            case "forest": {
                this.texture = "./textures/hexagon_camo_pattern2.png";
                break;
            }
            case "water": {
                this.texture = "./textures/hexagon_camo_pattern3.png";
                break;
            }
            case "mountain": {
                this.texture = "./textures/hexagon_camo_pattern4.png";
                break;
            }
            default: {
                this.texture = "./textures/hexagon.png";
            }
        }
        return this.texture;
    }
}