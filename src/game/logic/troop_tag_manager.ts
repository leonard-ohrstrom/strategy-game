export class TagManager {
    private static free_tags: string[] = [];
    private static tag_size: number = 0;

    /**
     * Gives a unique tag
     * @returns string of a unique tag
     */
    public static getTag(): string {
        const available_tags: boolean = this.free_tags.length > 0;
    
        if (available_tags) {
            return this.free_tags.shift()!;
        } else {
            this.tag_size++;
            this.free_tags = this.generateTags(this.tag_size);
            return this.free_tags.shift()!;
        }
    }

    /**
     * Stores a string in the pool of unused tags
     * @param tag a tag (string)
     */
    public static returnTag(tag: string): void {
        this.free_tags.push(tag);
    }

    /**
     * Generates an Array of strings consisting of combinations of letters a-z.
     * @param tag_length How many letters a given tag should consist of
     * @returns an Array of length 26^tag_length, containing all possible letter combinations.
     */
    private static generateTags(tag_length: number): string[] {
        function appendAsciis(strings: string[], start_ascii: number, end_ascii: number): string[] {
            if (start_ascii > end_ascii) {
                return appendAsciis(strings, end_ascii, start_ascii);
            }

            const appended_strings: string[] = [];

            strings.forEach((string: string) => {
                for (let char_ascii = start_ascii; char_ascii <= end_ascii; char_ascii++) {
                    const char: string = String.fromCharCode(char_ascii);
                    appended_strings.push(string.concat(char));
                }
            });

            return appended_strings;
        }

        const a_ascii: number = 97;
        const z_ascii: number = 122;

        let tags: string[] = [""];

        for (tag_length; tag_length > 0; tag_length--) {
            tags = appendAsciis(tags, a_ascii, z_ascii);
        }

        return tags;
    }
}
