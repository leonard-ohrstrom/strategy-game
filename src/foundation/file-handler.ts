import * as ini from "ini";

/**
 * Reading and writing files.
 */
export class FileHandler {
    private constructor() {}

    public static async readINI(publicPath: string): Promise<Record<string, any>> {
        const response = await fetch(publicPath);

        if (!response.ok) {
            throw new Error("Failed to load config of " + publicPath);
        }

        const text = await response.text();
        const config = ini.parse(text);

        return config;
    }

    public static async readJSON(publicPath: string): Promise<any> {
        const response = await fetch(publicPath);

        if (!response.ok) {
            throw new Error("Failed to load config of " + publicPath);
        }

        const data: any = await response.json();

        return data;
    }

    public static writeJSON(data: unknown, filename: string): void {
        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }
}