import assert from "assert";
import { BlobReader } from "System.Reflection.Metadata";
import { AbstractMemoryBlock, BlobUtilities } from "System.Reflection.Internal";

export class PEMemoryBlock {
    private readonly _block?: AbstractMemoryBlock;
    private readonly _offset: number;
    private readonly _pointer: Uint8Array;

    public constructor(block: AbstractMemoryBlock | undefined, offset: number = 0) {
        assert(block != undefined);
        assert(offset >= 0 && offset <= block.Size);

        this._block = block;
        this._offset = offset;
        this._pointer = block.Pointer.subarray(offset);
    }

    /// <summary>
    /// Pointer to the first byte of the block.
    /// </summary>
    public get Pointer(): Uint8Array | undefined {
        return (this._block != undefined) ? this._pointer : undefined;
    }

    /// <summary>
    /// Length of the block.
    /// </summary>
    public get Length(): number {
        return (this._block?.Size || this._offset) - this._offset;
    }

    /// <summary>
    /// Creates <see cref="BlobReader"/> for a blob spanning a part of the block.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">Specified range is not contained within the block.</exception>
    public GetReader(start?: number, length?: number): BlobReader {
        assert(this.Pointer != undefined);

        start = start ?? 0;
        length = length ?? this.Length;

        BlobUtilities.ValidateRange(this.Length, start, length, 'length');
        return BlobReader.FromPointer(this.Pointer.subarray(start), length);
    }


    /// <summary>
    /// Reads the content of a part of the block into an array.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">Specified range is not contained within the block.</exception>
    public GetContent(start?: number, length?: number): Uint8Array {
        start = start ?? this._offset;
        length = length ?? this.Length;

        BlobUtilities.ValidateRange(this.Length, start, length, 'length');
        return this._block?.GetContentUnchecked(this._offset + start, length) ?? new Uint8Array();
    }
}