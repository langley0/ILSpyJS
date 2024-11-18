import assert from "assert";
import { Throw, sizeof } from "System";
import {
    Stream,
    BinaryReader,
    SeekOrigin,
} from "System.IO";
import { Encoding } from "System.Text";


export class PEBinaryReader {
    _startOffset: number;
    _maxOffset: number;
    _reader: BinaryReader;

    constructor(stream: Stream, size: number) {
        this._startOffset = stream.Position;
        this._maxOffset = this._startOffset + size;
        this._reader = new BinaryReader(stream, Encoding.UTF8);
    }

    public get CurrentOffset(): number {
        return this._reader.BaseStream.Position - this._startOffset;
    }

    public Seek(offset: number) {
        this.CheckBounds(this._startOffset, offset);
        this._reader.BaseStream.Seek(BigInt(offset), SeekOrigin.Begin);
    }

    public ReadBytes(count: number): number[] {
        this.CheckBounds(this._reader.BaseStream.Position, count);
        return this._reader.ReadBytes(count);
    }

    public ReadByte(): number {
        this.CheckBounds(sizeof('byte'));
        return this._reader.ReadByte();
    }

    public ReadInt16(): number {
        this.CheckBounds(sizeof('short'));
        return this._reader.ReadInt16();
    }

    public ReadUInt16(): number {
        this.CheckBounds(sizeof('ushort'));
        return this._reader.ReadUInt16();
    }

    public ReadInt32(): number {
        this.CheckBounds(sizeof('int'));
        return this._reader.ReadInt32();
    }

    public ReadUInt32(): number {
        this.CheckBounds(sizeof('uint'));
        return this._reader.ReadUInt32();
    }

    public ReadUInt64(): bigint {
        this.CheckBounds(sizeof('ulong'));
        return this._reader.ReadUInt64();
    }

    /// <summary>
    /// Reads a fixed-length byte block as a null-padded UTF-8 encoded string.
    /// The padding is not included in the returned string.
    ///
    /// Note that it is legal for UTF-8 strings to contain NUL; if NUL occurs
    /// between non-NUL codepoints, it is not considered to be padding and
    /// is included in the result.
    /// </summary>
    public ReadNullPaddedUTF8(byteCount: number): string {
        const bytes: number[] = this.ReadBytes(byteCount);
        let nonPaddedLength = 0;
        for (let i = bytes.length; i > 0; --i) {
            if (bytes[i - 1] != 0) {
                nonPaddedLength = i;
                break;
            }
        }
        return Encoding.UTF8.GetString(bytes, 0, nonPaddedLength);
    }


    private CheckBounds(startPosition: number, count?: number) {
        if (count === undefined) {
            count = startPosition;
            startPosition = 0;
        }

        assert(startPosition >= 0 && this._maxOffset >= 0);

        // Add cannot overflow because the worst case is (ulong)long.MaxValue + uint.MaxValue < ulong.MaxValue.
        // Negative count is handled by overflow to greater than maximum size = int.MaxValue.
        if (startPosition + count > this._maxOffset) {
            Throw.ImageTooSmall();
        }
    }
}