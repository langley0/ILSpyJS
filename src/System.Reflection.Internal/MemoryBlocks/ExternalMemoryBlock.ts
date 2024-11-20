import { AbstractMemoryBlock } from "./AbstractMemoryBlock";

export class ExternalMemoryBlock extends AbstractMemoryBlock {
    // keeps the owner of the memory alive as long as the block is alive:
    private readonly _memoryOwner: Object;
    private readonly _buffer: Uint8Array;
    private readonly _size: number;

    public constructor(memoryOwner: Object, buffer: Uint8Array, size: number) {
        super();

        this._memoryOwner = memoryOwner;
        this._buffer = buffer;
        this._size = size;
    }

    public override get Pointer(): Uint8Array {
        return this._buffer;
    }
    public override get Size(): number {
        return this._size;
    }
}