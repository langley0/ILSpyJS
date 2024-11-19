import { Stream } from "System.IO";
import { AbstractMemoryBlock } from "./AbstractMemoryBlock";
import { MemoryBlockProvider } from "./MemoryBlockProvider";
import { ExternalMemoryBlock } from "./ExternalMemoryBlock";
import { StreamConstraints } from "./StreamConstraints";
import { ReadOnlyUnmanagedMemoryStream } from "../Utilities/ReadOnlyUnmanagedMemoryStream";


export class ExternalMemoryBlockProvider extends MemoryBlockProvider {
    private _memory: Uint8Array;
    private _size: number;

    public constructor(memory: Uint8Array, size: number) {
        super();
        this._memory = memory;
        this._size = size;
    }

    public override get Size(): number {
        return this._size;

    }

    protected override GetMemoryBlockImpl(start: number, size: number): AbstractMemoryBlock {
        const memory = Buffer.from(this._memory, start);
        return new ExternalMemoryBlock(this, memory, size);
    }

    public override GetStream(): [Stream, StreamConstraints] {
        const constraints = new StreamConstraints(undefined, 0, this._size);
        return [new ReadOnlyUnmanagedMemoryStream(this._memory, this._size), constraints]
    }

    // protected override void Dispose(bool disposing)
    // {
    //     Debug.Assert(disposing);

    //     // we don't own the memory, just null out the pointer.
    //     _memory = null;
    //     _size = 0;
    // }

    public get Pointer(): Uint8Array {
        return this._memory;

    }
}