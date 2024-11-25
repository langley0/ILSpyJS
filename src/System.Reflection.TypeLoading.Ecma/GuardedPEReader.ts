import assert from "assert";
import { MetadataReader } from "System.Reflection.Metadata";
import { MetadataLoadContext } from "System.Reflection";
import { PEReader } from "System.Reflection.PortableExecutable";

export class GuardedPEReader {
    private readonly _loader: MetadataLoadContext;
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)] // Don't want debugger watch windows triggering AV's if one is still around after disposal.
    private readonly _peReader: PEReader;
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)] // Don't want debugger watch windows triggering AV's if one is still around after disposal.
    private readonly _reader: MetadataReader;

    public constructor(loader: MetadataLoadContext, peReader: PEReader, reader: MetadataReader) {
        assert(loader != undefined);
        assert(peReader != undefined);
        assert(reader != undefined);

        this._loader = loader;
        this._peReader = peReader;
        this._reader = reader;
    }

    public get PEReader(): PEReader { return this._peReader; }
    public get Reader(): MetadataReader { return this._reader; }
}