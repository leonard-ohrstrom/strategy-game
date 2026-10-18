/**
 * Allows reading INI-files as config.
 */
import * as ini from "ini";

export async function loadConfig(path: string): Promise<any> {
    try {
        const response = await fetch(path);
        if (!response.ok) {throw new Error("Failed to load config")}
        const text = await response.text();
        const config = ini.parse(text);
        return config;
    } catch(error) {
        console.error(`failed reading path: ${path}`);
    }
}

export async function readJSON(relative_path: string): Promise<any> {
    try {
        const json_content: any = await fetch(relative_path)
        .then(response => response.json())
        .then(data => data);
        return json_content;
    } catch (error) {
        console.error(`failed reading path: ${relative_path}`);
    }
}

export function downloadJSON(data: unknown, filename: string): void {
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
