
import { describe, it, expect, vi, afterEach } from "vitest";
import { FileHandler } from "./file-handler";

///
/// TESTS WRITTEN BY CHATGPT
///

type MockBlob = {
    parts: BlobPart[];
    options: BlobPropertyBag;
};

describe("FileHandler", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe("readINI()", () => {
        it("should fetch and parse an INI file", async () => {
            const iniContent = "[player]\nname = Player1\nlevel = 10";

            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                text: async () => iniContent
            });

            vi.stubGlobal("fetch", fetchMock);

            const result = await FileHandler.readINI("config.ini");

            expect(fetchMock).toHaveBeenCalledWith("config.ini");
            expect(result).toEqual({
                player: {
                    name: "Player1",
                    level: "10"
                }
            });
        });

        it("should throw when the request fails", async () => {
            vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
                ok: false
            }));

            await expect(
                FileHandler.readINI("config.ini")
            ).rejects.toThrow("Failed to load config of config.ini");
        });
    });

    describe("readJSON()", () => {
        it("should fetch and parse a JSON file", async () => {
            const jsonData = { name: "Test", version: 1 };

            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => jsonData
            });

            vi.stubGlobal("fetch", fetchMock);

            const result = await FileHandler.readJSON("test.json");

            expect(fetchMock).toHaveBeenCalledWith("test.json");
            expect(result).toEqual(jsonData);
        });

        it("should propagate fetch errors", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockRejectedValue(new Error("Network error"))
            );

            await expect(
                FileHandler.readJSON("test.json")
            ).rejects.toThrow("Network error");
        });
    });

    describe("writeJSON()", () => {
        it("should create and download a formatted JSON file", () => {
            const data = { name: "Test", version: 1 };

            const click = vi.fn();
            const appendChild = vi.fn();
            const remove = vi.fn();
            const blobMock = vi.fn();

            const link = {
                href: "",
                download: "",
                click,
                remove
            };

            const createElement = vi.fn().mockReturnValue(link);
            const createObjectURL = vi.fn().mockReturnValue("blob:test");
            const revokeObjectURL = vi.fn();

            vi.stubGlobal("document", {
                createElement,
                body: { appendChild }
            });

            vi.stubGlobal("URL", {
                createObjectURL,
                revokeObjectURL
            });

            vi.stubGlobal("Blob", class {
                parts: BlobPart[];
                options: BlobPropertyBag;

                constructor(parts: BlobPart[], options: BlobPropertyBag) {
                    this.parts = parts;
                    this.options = options;
                    blobMock(this);
                }
            });

            FileHandler.writeJSON(data, "test.json");

            expect(createElement).toHaveBeenCalledWith("a");
            expect(appendChild).toHaveBeenCalledWith(link);

            expect(link.href).toBe("blob:test");
            expect(link.download).toBe("test.json");

            expect(click).toHaveBeenCalledOnce();
            expect(remove).toHaveBeenCalledOnce();

            expect(createObjectURL).toHaveBeenCalledOnce();
            expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");

            const blob = blobMock.mock.calls[0][0] as MockBlob;

            expect(blob.parts).toEqual([
                JSON.stringify(data, null, 2)
            ]);
            expect(blob.options).toEqual({
                type: "application/json"
            });
        });
    });
});
