/**
 * Manages each concrete instance of a country.
 */
import { FileHandler } from "../../../foundation/file-handler.ts";
import { Country } from "./country.entry.ts";

type countryProperty = "name" | "color";
type countryData = Record<countryProperty, string>
type countryConfig = Record<string, countryData>

export class CountryManager {
    private countries: Map<string, Country>;

    private constructor() {
        this.countries = new Map<string, Country>();
    }

    private async load(): Promise<void> {
        const countryData: countryConfig = await FileHandler.readINI('./data/countries/country_config.ini');

        const countryLabels: string[] = await FileHandler.readJSON('./data/countries/countries.json');

        countryLabels.forEach(tag => {
            const name = countryData[tag]['name'];
            const color = countryData[tag]['color'];
            const country = new Country(tag, name, color);

            this.countries.set(tag, country);
        });
    }

    public async create(): Promise<CountryManager> {
        const countryManager = new CountryManager();

        await countryManager.load();

        return countryManager;
    }

    public hasTag(tag: string): boolean {
        return this.countries.has(tag);
    }

    private getCountry(tag: string): Country {
        const country = this.countries.get(tag);

        if (country === undefined) {
            throw new Error("missing tag" + tag);
        }

        return country;
    }

    public addTag(tag: string, name: string, color: string): void {
        if (this.countries.has(tag)) {
            throw new Error ("tag" + tag + "already set");
        }

        const country = new Country(tag, name, color);

        this.countries.set(tag, country);
    }

    public deleteTag(tag: string): void {
        const wasDeleted: boolean = this.countries.delete(tag); // fails if there is no tag

        if (!wasDeleted) {
            throw new Error(`No tag "${tag}" exists`);
        }
    }

    public getName(tag: string): string {
        const country = this.getCountry(tag);

        return country.name;
    }

    public setName(tag: string, newName: string) {
        const country = this.getCountry(tag);

        country.name = newName;
    }

    public getColor(tag: string): string {
        const country = this.getCountry(tag);

        return country.color;
    }

    public setColor(tag: string, newColor: string) {
        const country = this.getCountry(tag);

        country.color = newColor;
    }
}