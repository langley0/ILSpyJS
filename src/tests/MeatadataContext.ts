import * as fs from "fs";
import { MetadataLoadContext } from "System.Reflection";

export function LoadBinary() {
    const buf = fs.readFileSync("samples/test.dll");
    MetadataLoadContext.FromBuffer(Uint8Array.from(buf));
}