// a country_tag consists of precisely three letters A-Z
export type CountryTag = string;

type Country = {
    name: string
    tag: CountryTag;
}

const sweden: Country = {
    name: "Sweden",
    tag: "SWE"
}

export function make_country(input_tag: CountryTag): Country {
    return {
        name: input_tag,
        tag: input_tag
    };
}

export function is_country_tag(input_tag: CountryTag) {

}