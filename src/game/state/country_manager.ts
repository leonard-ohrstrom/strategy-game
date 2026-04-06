/**
 * Manages each concrete instance of a country.
 */
import { loadConfig } from "../../types/file_parser";

type Country = {
    tag: string,
    name: string,
    color: string
}

function makeCountry(tag: string, name: string, color: string): Country {
    return { tag: tag, name: name, color: color }
}

export class CountryManager {
    private static countries: Map<string, Country> = new Map;
    static async init(): Promise<void> {
        const country_config = await loadConfig('country_config.ini')
        const countries_array: Array<string> = await fetch('countries.json')
            .then(response => response.json())
            .then(data => data);
        countries_array.forEach((tag: string) => {
            const name: string = country_config[tag]['name'];
            const colour: string = country_config[tag]['colour'];
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