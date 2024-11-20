import assert from "assert";
import { Throw, sizeof } from "System";
import { SequenceEqual } from "System.Collections";
import { Blob } from "./Blob";
import { BlobWriterImpl } from "./BlobWriterImpl";

export class BlobWriter {
    // writable slice:
    private readonly _buffer: Uint8Array;
    private readonly _start: number;
    private readonly _end: number;  // exclusive

    // position in buffer relative to the beginning of the array:
    private _position: number;

    public static FromSize(size: number): BlobWriter {
        return BlobWriter.FromBuffer(new Uint8Array(size))
    }

    public static FromBuffer(buffer: Uint8Array): BlobWriter {
        return new BlobWriter(buffer, 0, buffer.length)
    }

    public static FromBlob(blob: Blob): BlobWriter {
        assert(blob.Buffer);
        return new BlobWriter(blob.Buffer, blob.Start, blob.Length)
    }

    public constructor(buffer: Uint8Array, start: number, count: number) {
        assert(buffer != undefined);
        assert(count >= 0);
        assert(count <= buffer.length - start);

        this._buffer = buffer;
        this._start = start;
        this._position = start;
        this._end = start + count;
    }

    public get IsDefault(): boolean {
        return this._buffer.length == 0;
    }

    /// <summary>
    /// Compares the current content of this writer with another one.
    /// </summary>
    public ContentEquals(other: BlobWriter): boolean {
        const myBuffer = this._buffer.slice(this._start, this._start + this.Length);
        const otherBuffer = other._buffer.slice(other._start, other._start + other.Length);
        return this.Length == other.Length && SequenceEqual(myBuffer, otherBuffer);
    }

    public get Offset(): number {
        return this._position - this._start;
    }

    public set Offset(value: number) {
        if (value < 0 || this._start > this._end - value) {
            Throw.ArgumentOutOfRange('Offset');
        }

        this._position = this._start + value;
    }


    public get Length() {
        return this._end - this._start;
    }
    public get RemainingBytes() {
        return this._end - this._position;
    }
    public get Blob(): Blob {
        return new Blob(this._buffer, this._start, this.Length);
    }

    //     //         public ToArray() : Uint8Array {
    //     // {
    //     //     return this.ToArray(0, Offset);
    //     // }

    //     /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the buffer content.</exception>
    //     public ToArray(start?: number, byteCount?: number): Uint8Array {
    //         start = start ?? 0;
    //         byteCount = byteCount ?? this.Offset;

    //         BlobUtilities.ValidateRange(this.Length, start, byteCount, 'byteCount');

    //         return this._buffer.AsSpan(this._start + start, byteCount).ToArray();
    //     }

    //     //         public ImmutableArray < byte > ToImmutableArray()
    //     // {
    //     //     return ToImmutableArray(0, Offset);
    //     // }

    //     /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the buffer content.</exception>
    //     public ToImmutableArray(start: number, byteCount: number): Uint8Array {
    //         BlobUtilities.ValidateRange(this.Length, start, byteCount, 'byteCount');

    //         return new Uint8Array(this._buffer.AsSpan(this._start + start, byteCount));
    //     }

    private Advance(value: number): number {
        assert(value >= 0);

        const position = this._position;
        if (position > this._end - value) {
            Throw.OutOfBounds();
        }

        this._position = position + value;
        return position;
    }

    //     /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    //     public WriteBytes(value: number, byteCount: number) {
    //         if (byteCount < 0) {
    //             Throw.ArgumentOutOfRange('byteCount');
    //         }

    //             const start = this.Advance(byteCount);
    //         this._buffer.AsSpan(start, byteCount).Fill(value);
    //     }

    //     /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is undefined.</exception>
    //     /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    //     public WriteBytes(byte * buffer, int byteCount)
    // {
    //     if (buffer is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     if (byteCount < 0) {
    //         Throw.ArgumentOutOfRange(nameof(byteCount));
    //     }

    //     WriteBytes(new ReadOnlySpan<byte>(buffer, byteCount));
    // }

    //         internal void WriteBytes(ReadOnlySpan < byte > buffer)
    // {
    //             int start = Advance(buffer.Length);
    //     buffer.CopyTo(_buffer.AsSpan(start));
    // }

    //         /// <exception cref="ArgumentNullException"><paramref name="source"/> is undefined.</exception>
    //         public void WriteBytes(BlobBuilder source)
    // {
    //     if (source is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(source));
    //     }

    //     source.WriteContentTo(ref this);
    // }

    //         /// <exception cref="ArgumentNullException"><paramref name="source"/> is undefined.</exception>
    //         /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    //         public int WriteBytes(Stream source, int byteCount)
    // {
    //     if (source is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(source));
    //     }

    //     if (byteCount < 0) {
    //         Throw.ArgumentOutOfRange(nameof(byteCount));
    //     }

    //             int start = Advance(byteCount);
    //             int bytesRead = source.TryReadAll(_buffer, start, byteCount);
    //     _position = start + bytesRead;
    //     return bytesRead;
    // }

    //         /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is undefined.</exception>
    //         public void WriteBytes(ImmutableArray < byte > buffer)
    // {
    //     if (buffer.IsDefault) {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     WriteBytes(buffer.AsSpan());
    // }

    //         /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is undefined.</exception>
    //         /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the <paramref name="buffer"/>.</exception>
    //         public void WriteBytes(ImmutableArray < byte > buffer, int start, int byteCount)
    // {
    //     if (buffer.IsDefault) {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     BlobUtilities.ValidateRange(buffer.Length, start, byteCount, nameof(byteCount));

    //     WriteBytes(buffer.AsSpan(start, byteCount));
    // }

    //         /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is undefined.</exception>
    //         public void WriteBytes(byte[] buffer)
    // {
    //     if (buffer is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     WriteBytes(buffer.AsSpan());
    // }

    //         /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is undefined.</exception>
    //         /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the <paramref name="buffer"/>.</exception>
    //         public void WriteBytes(byte[] buffer, int start, int byteCount)
    // {
    //     if (buffer is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     BlobUtilities.ValidateRange(buffer.Length, start, byteCount, nameof(byteCount));

    //     WriteBytes(buffer.AsSpan(start, byteCount));
    // }

    //         public void PadTo(int offset)
    // {
    //     WriteBytes(0, offset - Offset);
    // }

    //         public void Align(int alignment)
    // {
    //             int offset = Offset;
    //     WriteBytes(0, BitArithmetic.Align(offset, alignment) - offset);
    // }

    //         public void WriteBoolean(bool value)
    // {
    //     WriteByte((byte)(value ? 1 : 0));
    // }

    public WriteByte(value: number) {
        const start = this.Advance(sizeof('byte'));
        this._buffer[start] = value;
    }

    public WriteSByte(value: number) {
        this.WriteByte(value);
    }

    //         public void WriteDouble(double value)
    // {
    //             int start = Advance(sizeof(double));
    //     _buffer.WriteDouble(start, value);
    // }

    //         public void WriteSingle(float value)
    // {
    //             int start = Advance(sizeof(float));
    //     _buffer.WriteSingle(start, value);
    // }

    //         public void WriteInt16(short value)
    // {
    //     WriteUInt16(unchecked((ushort)value));
    // }

    //         public void WriteUInt16(ushort value)
    // {
    //             int start = Advance(sizeof(ushort));
    //     _buffer.WriteUInt16(start, value);
    // }

    public WriteInt16BE(value: number) {
        this.WriteUInt16BE(value);
    }

    public WriteUInt16BE(value: number) {
        const start = this.Advance(sizeof('ushort'));
        Buffer.from(this._buffer).writeUInt16BE(value, start);
    }

    public WriteInt32BE(value: number) {
        this.WriteUInt32BE(value);
    }

    public WriteUInt32BE(value: number) {
        const start = this.Advance(sizeof('uint'));

        Buffer.from(this._buffer).writeUInt32BE(value, start);
    }

    public WriteInt32(value: number) {
        this.WriteUInt32(value);
    }

    public WriteUInt32(value: number) {
        const start = this.Advance(sizeof('uint'));
        Buffer.from(this._buffer).writeUInt32LE(value, start);
    }

    //         public void WriteInt64(long value)
    // {
    //     WriteUInt64(unchecked((ulong)value));
    // }

    //         public void WriteUInt64(ulong value)
    // {
    //             int start = Advance(sizeof(ulong));
    //     _buffer.WriteUInt64(start, value);
    // }

    //         public void WriteDecimal(decimal value)
    // {
    //             int start = Advance(BlobUtilities.SizeOfSerializedDecimal);
    //     _buffer.WriteDecimal(start, value);
    // }

    //         public void WriteGuid(Guid value)
    // {
    //             int start = Advance(BlobUtilities.SizeOfGuid);
    //     _buffer.WriteGuid(start, value);
    // }

    //         public void WriteDateTime(DateTime value)
    // {
    //     WriteInt64(value.Ticks);
    // }

    //         /// <summary>
    //         /// Writes a reference to a heap (heap offset) or a table (row number).
    //         /// </summary>
    //         /// <param name="reference">Heap offset or table row number.</param>
    //         /// <param name="isSmall">True to encode the reference as 16-bit integer, false to encode as 32-bit integer.</param>
    //         public void WriteReference(int reference, bool isSmall)
    // {
    //     // This code is a very hot path, hence we don't check if the reference actually fits 2B.

    //     if (isSmall) {
    //         assert(unchecked((ushort)reference) == reference);
    //         WriteUInt16((ushort)reference);
    //     }
    //     else {
    //         WriteInt32(reference);
    //     }
    // }

    //         /// <summary>
    //         /// Writes UTF-16 (little-endian) encoded string at the current position.
    //         /// </summary>
    //         /// <exception cref="ArgumentNullException"><paramref name="value"/> is undefined.</exception>
    //         public void WriteUTF16(char[] value)
    // {
    //     if (value is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     WriteUTF16(value.AsSpan());
    // }

    //         /// <summary>
    //         /// Writes UTF-16 (little-endian) encoded string at the current position.
    //         /// </summary>
    //         /// <exception cref="ArgumentNullException"><paramref name="value"/> is undefined.</exception>
    //         public void WriteUTF16(string value)
    // {
    //     if (value is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     WriteUTF16(value.AsSpan());
    // }

    //         private void WriteUTF16(ReadOnlySpan < char > value)
    // {
    //     if (BitConverter.IsLittleEndian) {
    //         WriteBytes(MemoryMarshal.AsBytes(value));
    //     }
    //     else {
    //         foreach(char c in value)
    //         {
    //             WriteUInt16(c);
    //         }
    //     }
    // }

    //         /// <summary>
    //         /// Writes string in SerString format (see ECMA-335-II 23.3 Custom attributes).
    //         /// </summary>
    //         /// <remarks>
    //         /// The string is UTF-8 encoded and prefixed by the its size in bytes.
    //         /// Null string is represented as a single byte 0xFF.
    //         /// </remarks>
    //         /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    //         public void WriteSerializedString(string ? str)
    // {
    //     if (str == undefined) {
    //         WriteByte(0xff);
    //         return;
    //     }

    //     WriteUTF8(str, 0, str.Length, allowUnpairedSurrogates: true, prependSize: true);
    // }

    //         /// <summary>
    //         /// Writes string in User String (#US) heap format (see ECMA-335-II 24.2.4 #US and #Blob heaps):
    //         /// </summary>
    //         /// <remarks>
    //         /// The string is UTF-16 encoded and prefixed by the its size in bytes.
    //         ///
    //         /// This final byte holds the value 1 if and only if any UTF-16 character within the string has any bit set in its top byte,
    //         /// or its low byte is any of the following: 0x01-0x08, 0x0E-0x1F, 0x27, 0x2D, 0x7F. Otherwise, it holds 0.
    //         /// The 1 signifies Unicode characters that require handling beyond that normally provided for 8-bit encoding sets.
    //         /// </remarks>
    //         /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    //         public void WriteUserString(string value)
    // {
    //     if (value is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     WriteCompressedInteger(BlobUtilities.GetUserStringByteLength(value.Length));
    //     WriteUTF16(value);
    //     WriteByte(BlobUtilities.GetUserStringTrailingByte(value));
    // }

    //         /// <summary>
    //         /// Writes UTF-8 encoded string at the current position.
    //         /// </summary>
    //         /// <exception cref="ArgumentNullException"><paramref name="value"/> is undefined.</exception>
    //         public void WriteUTF8(string value, bool allowUnpairedSurrogates)
    // {
    //     if (value is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     WriteUTF8(value, 0, value.Length, allowUnpairedSurrogates, prependSize: false);
    // }

    //         private unsafe void WriteUTF8(string str, int start, int length, bool allowUnpairedSurrogates, bool prependSize)
    // {
    //     fixed(char * strPtr = str)
    //     {
    //         char * charPtr = strPtr + start;
    //                 int byteCount = BlobUtilities.GetUTF8ByteCount(charPtr, length);

    //         if (prependSize) {
    //             WriteCompressedInteger(byteCount);
    //         }

    //                 int startOffset = Advance(byteCount);
    //         _buffer.WriteUTF8(startOffset, charPtr, length, byteCount, allowUnpairedSurrogates);
    //     }
    // }

    //         /// <summary>
    //         /// Implements compressed signed integer encoding as defined by ECMA-335-II chapter 23.2: Blobs and signatures.
    //         /// </summary>
    //         /// <remarks>
    //         /// If the value lies between -64 (0xFFFFFFC0) and 63 (0x3F), inclusive, encode as a one-byte integer:
    //         /// bit 7 clear, value bits 5 through 0 held in bits 6 through 1, sign bit (value bit 31) in bit 0.
    //         ///
    //         /// If the value lies between -8192 (0xFFFFE000) and 8191 (0x1FFF), inclusive, encode as a two-byte integer:
    //         /// 15 set, bit 14 clear, value bits 12 through 0 held in bits 13 through 1, sign bit(value bit 31) in bit 0.
    //         ///
    //         /// If the value lies between -268435456 (0xF000000) and 268435455 (0x0FFFFFFF), inclusive, encode as a four-byte integer:
    //         /// 31 set, 30 set, bit 29 clear, value bits 27 through 0 held in bits 28 through 1, sign bit(value bit 31) in bit 0.
    //         /// </remarks>
    //         /// <exception cref="ArgumentOutOfRangeException"><paramref name="value"/> can't be represented as a compressed signed integer.</exception>
    //         public void WriteCompressedSignedInteger(int value)
    // {
    //     BlobWriterImpl.WriteCompressedSignedInteger(ref this, value);
    // }

    /// <summary>
    /// Implements compressed unsigned integer encoding as defined by ECMA-335-II chapter 23.2: Blobs and signatures.
    /// </summary>
    /// <remarks>
    /// If the value lies between 0 (0x00) and 127 (0x7F), inclusive,
    /// encode as a one-byte integer (bit 7 is clear, value held in bits 6 through 0).
    ///
    /// If the value lies between 28 (0x80) and 214 - 1 (0x3FFF), inclusive,
    /// encode as a 2-byte integer with bit 15 set, bit 14 clear(value held in bits 13 through 0).
    ///
    /// Otherwise, encode as a 4-byte integer, with bit 31 set, bit 30 set, bit 29 clear (value held in bits 28 through 0).
    /// </remarks>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="value"/> can't be represented as a compressed unsigned integer.</exception>
    public WriteCompressedInteger(value: number) {
        BlobWriterImpl.WriteCompressedInteger(this, value);
    }

    //         /// <summary>
    //         /// Writes a constant value (see ECMA-335 Partition II section 22.9) at the current position.
    //         /// </summary>
    //         /// <exception cref="ArgumentException"><paramref name="value"/> is not of a constant type.</exception>
    //         public void WriteConstant(object ? value)
    // {
    //     BlobWriterImpl.WriteConstant(ref this, value);
    // }

    public Clear() {
        this._position = this._start;
    }
}