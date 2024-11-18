export class Encoding {
    static UTF8: Encoding = new Encoding("utf-8");
    static ASCII: Encoding = new Encoding("ascii");
    static Unicode: Encoding = new Encoding("utf-16le");

    private _name: "utf-8" | "ascii" | "utf-16le";
    constructor(name: "utf-8" | "ascii" | "utf-16le") {
        this._name = name;
    }

    public GetString(buffer: number[], offset: number | undefined = undefined, length: number | undefined = undefined): string {
        if (offset === undefined && length === undefined) {
            offset = 0;
            length = buffer.length;
        }
        else if (offset !== undefined && length === undefined) {
            length = offset;
            offset = 0;
        }
        else if (offset === undefined && length !== undefined) {
            throw new Error("offset cannot be undefined when length is defined");
        }

        // bytep[] -> string using target encoding
        if (this._name == "utf-8") {
            return Buffer.from(buffer).toString("utf-8", offset, offset! + length!);
        } else if (this._name == "ascii") {
            return Buffer.from(buffer).toString("ascii", offset, offset! + length!);
        } else if (this._name == "utf-16le") {
            return Buffer.from(buffer).toString("utf-16le", offset, offset! + length!);
        } else {
            throw new Error(`Encoding not supported: ${this._name}`);
        }
    }
}