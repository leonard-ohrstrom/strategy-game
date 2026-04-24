/**
 * Manages each concrete instance of a country.
 */
import { loadConfig } from "../../types/file_parser";

type Country = {
    tag: string,
    name: string,
    colour: string
}

function makeCountry(tag: string, name: string, color: string): Country {
    return { tag: tag, name: name, colour: color }
}

export class CountryManager {
    private static countries: Map<string, Country> = new Map;
    private static country_config: Record<string, Country>;

    static async init(): Promise<void> {
        this.country_config = await loadConfig('./data/countries/country_config.ini');
        const countries_array: Array<string> = await fetch('./data/countries/countries.json')
            .then(response => response.json())
            .then(data => data);
        countries_array.forEach((tag: string) => {
            const name: string = this.country_config[tag]['name'];
            const colour: string = this.country_config[tag]['colour'];
            const country: Country = makeCountry(tag, name, colour);
            this.countries.set(tag, country);
        });
    }

    public static country_exists(country_tag: string): boolean {
        return this.countries.has(country_tag);
    }

    public static readCountry(tag: string): Country {
        if (this.country_exists(tag)) {
            return this.countries.get(tag)!;
        } else {
            console.warn("read country could not find tag:", tag)
            return makeCountry(tag, tag, "black");
        }
    }
}