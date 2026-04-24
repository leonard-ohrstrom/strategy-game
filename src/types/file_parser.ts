/**
 * Allows reading INI-files as config.
 */
import * as ini from "ini";

export async function loadConfig(path: string): Promise<any> {
    const response = await fetch(path);
    if (!response.ok) {throw new Error("Failed to load config")}
    const text = await response.text();
    const config = ini.parse(text);
    return config;
}

export async function readJSON(relative_path: string): Promise<any> {
    const json_content: any = await fetch(relative_path)
    .then(response => response.json())
    .then(data => data);
    return json_content;
}