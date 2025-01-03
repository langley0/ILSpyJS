import assert from "assert"
import { Throw, sizeof } from "System"
import { MemoryBlock } from "System.Reflection.Internal";
import { MetadataStringDecoder } from "System.Reflection.Metadata";

export class BlobReader {
    public static readonly InvalidCompressedInteger = Number.MAX_SAFE_INTEGER;

    private readonly _block: MemoryBlock;

    // Points right behind the last byte of the block.
    private readonly _endPointer: number;

    private _currentPointer: number;

    private constructor(block: MemoryBlock, start: number, end: number) {
        this._block = block;
        this._currentPointer = start;
        this._endPointer = end;
    }

    /// <summary>
    /// Creates a reader of the specified memory block.
    /// </summary>
    /// <param name="buffer">Pointer to the start of the memory block.</param>
    /// <param name="length">Length in bytes of the memory block.</param>
    /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is undefined and <paramref name="length"/> is greater than zero.</exception>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="length"/> is negative.</exception>
    /// <exception cref="PlatformNotSupportedException">The current platform is not little-endian.</exception>
    public static FromPointer(buffer: Uint8Array, length: number) {
        return this.FromMemoryBlock(MemoryBlock.Create(buffer, length))
    }

    public static FromMemoryBlock(block: MemoryBlock) {
        assert(block.Length >= 0 && (block.Pointer != undefined || block.Length == 0));

        const reader = new BlobReader(block, 0, block.Length);
        return reader;
    }

    // public string GetDebuggerDisplay()
    // {
    //     if (_block.Pointer == undefined)
    //     {
    //         return "<undefined>";
    //     }

    //     int displayedBytes;
    //     string display = _block.GetDebuggerDisplay(out displayedBytes);
    //     if (this.Offset < displayedBytes)
    //     {
    //         display = display.Insert(this.Offset * 3, "*");
    //     }
    //     else if (displayedBytes == _block.Length)
    //     {
    //         display += "*";
    //     }
    //     else
    //     {
    //         display += "*...";
    //     }

    //     return display;
    // }

    // #region Offset, Skipping, Marking, Alignment, Bounds Checking

    // /// <summary>
    // /// Pointer to the byte at the start of the underlying memory block.
    // /// </summary>
    // public byte* StartPointer => _block.Pointer;

    // /// <summary>
    // /// Pointer to the byte at the current position of the reader.
    // /// </summary>
    // public byte* CurrentPointer => _currentPointer;

    // /// <summary>
    // /// The total length of the underlying memory block.
    // /// </summary>
    // public int Length => _block.Length;

    /// <summary>
    /// Gets or sets the offset from start of the blob to the current position.
    /// </summary>
    /// <exception cref="BadImageFormatException">Offset is set outside the bounds of underlying reader.</exception>
    public get Offset(): number {

        return this._currentPointer - 0;
    }

    public set Offset(value: number) {
        if (value > this._block.Length) {
            Throw.OutOfBounds();
        }

        this._currentPointer = value;

    }

    /// <summary>
    /// Bytes remaining from current position to end of underlying memory block.
    /// </summary>
    public get RemainingBytes(): number {
        return this._endPointer - this._currentPointer;
    }

    /// <summary>
    /// Repositions the reader to the start of the underlying memory block.
    /// </summary>
    public Reset() {
        this._currentPointer = 0;
    }

    /// <summary>
    /// Repositions the reader forward by the number of bytes required to satisfy the given alignment.
    /// </summary>
    public Align(alignment: number) {
        if (!this.TryAlign(alignment)) {
            Throw.OutOfBounds();
        }
    }

    public TryAlign(alignment: number): boolean {
        const remainder = this.Offset & (alignment - 1);

        assert((alignment & (alignment - 1)) == 0, "Alignment must be a power of two.");
        assert(remainder >= 0 && remainder < alignment);

        if (remainder != 0) {
            const bytesToSkip = alignment - remainder;
            if (bytesToSkip > this.RemainingBytes) {
                return false;
            }

            this._currentPointer += bytesToSkip;
        }

        return true;
    }

    public GetMemoryBlockAt(offset: number, length: number): MemoryBlock {
        this.CheckBounds(offset, length);
        return new MemoryBlock(this._block.Pointer.subarray(this._currentPointer + offset), length);
    }

    // #endregion

    // #region Bounds Checking

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private CheckBounds(offset: number, byteCount: number) {
        // should be =>   _currentPointer  + offset + byteCount <= this._endPointer
        if (offset + byteCount > this._endPointer - this._currentPointer) {
            Throw.OutOfBounds();
        }
    }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // private void CheckBounds(int byteCount)
    // {
    //     if (unchecked((uint)byteCount) > (_endPointer - _currentPointer))
    //     {
    //         Throw.OutOfBounds();
    //     }
    // }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private GetCurrentPointerAndAdvance(length: number): Uint8Array {
        const ptr = this._currentPointer;
        if (length > this._endPointer - ptr) {
            Throw.OutOfBounds();
        }

        this._currentPointer = ptr + length;
        return this._block.Pointer.subarray(ptr, ptr + length);
    }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private GetCurrentPointerAndAdvance1(): number {
        const ptr = this._currentPointer;
        if (ptr == this._endPointer) {
            Throw.OutOfBounds();
        }

        this._currentPointer += 1;
        return this._block.Pointer[ptr];
    }

    // #endregion

    // #region Read Methods

    // public bool ReadBoolean()
    // {
    //     // It's not clear from the ECMA spec what exactly is the encoding of Boolean.
    //     // Some metadata writers encode "true" as 0xff, others as 1. So we treat all non-zero values as "true".
    //     //
    //     // We propose to clarify and relax the current wording in the spec as follows:
    //     //
    //     // Chapter II.16.2 "Field init metadata"
    //     //   ... bool '(' true | false ')' Boolean value stored in a single byte, 0 represents false, any non-zero value represents true ...
    //     //
    //     // Chapter 23.3 "Custom attributes"
    //     //   ... A bool is a single byte with value 0 representing false and any non-zero value representing true ...
    //     return ReadByte() != 0;
    // }

    public ReadSByte(): number {
        return this.GetCurrentPointerAndAdvance1();
    }

    public ReadByte(): number {
        return this.GetCurrentPointerAndAdvance1();
    }

    // public ReadChar(): number
    // {
    //     unchecked
    //     {
    //         byte* ptr = GetCurrentPointerAndAdvance(sizeof(char));
    //         return (char)(ptr[0] + (ptr[1] << 8));
    //     }
    // }

    public ReadInt16(): number {
        const ptr = this.GetCurrentPointerAndAdvance(sizeof('short'));
        return (ptr[0] + (ptr[1] << 8));
    }

    public ReadUInt16(): number {
        const ptr = this.GetCurrentPointerAndAdvance(sizeof('ushort'));
        return (ptr[0] + (ptr[1] << 8));
    }

    public ReadInt32(): number {
        const ptr = this.GetCurrentPointerAndAdvance(sizeof('int'));
        return (ptr[0] + (ptr[1] << 8) + (ptr[2] << 16) + (ptr[3] << 24));

    }

    public ReadUInt32(): number {
        const ptr = this.GetCurrentPointerAndAdvance(sizeof('uint'));
        return (ptr[0] + (ptr[1] << 8) + (ptr[2] << 16) + (ptr[3] << 24));
    }

    public ReadInt64(): number {
        const ptr = this.GetCurrentPointerAndAdvance(sizeof('long'));
        const lo = (ptr[0] + (ptr[1] << 8) + (ptr[2] << 16) + (ptr[3] << 24));
        const hi = (ptr[4] + (ptr[5] << 8) + (ptr[6] << 16) + (ptr[7] << 24));
        return (lo + Number(BigInt(hi) * BigInt(0x100000000)));
    }

    public ReadUInt64(): number {
        return this.ReadInt64();
    }


    public Read64BitFlags(): bigint {
        const ptr = this.GetCurrentPointerAndAdvance(sizeof('long'));
        const lo = (ptr[0] + (ptr[1] << 8) + (ptr[2] << 16) + (ptr[3] << 24));
        const hi = (ptr[4] + (ptr[5] << 8) + (ptr[6] << 16) + (ptr[7] << 24));
        return BigInt(lo) + (BigInt(hi) * BigInt(0x100000000));
    }

    // public float ReadSingle()
    // {
    //     int val = ReadInt32();
    //     return *(float*)&val;
    // }

    // public double ReadDouble()
    // {
    //     long val = ReadInt64();
    //     return *(double*)&val;
    // }

    // public Guid ReadGuid()
    // {
    //     const int size = 16;
    //     byte* ptr = GetCurrentPointerAndAdvance(size);
    //     if (BitConverter.IsLittleEndian)
    //     {
    //         return *(Guid*)ptr;
    //     }
    //     else
    //     {
    //         unchecked
    //         {
    //             return new Guid(
    //                 (ptr[0] | (ptr[1] << 8) | (ptr[2] << 16) | (ptr[3] << 24)),
    //                 (short)(ptr[4] | (ptr[5] << 8)),
    //                 (short)(ptr[6] | (ptr[7] << 8)),
    //                 ptr[8], ptr[9], ptr[10], ptr[11], ptr[12], ptr[13], ptr[14], ptr[15]);
    //         }
    //     }
    // }

    // /// <summary>
    // /// Reads <see cref="decimal"/> number.
    // /// </summary>
    // /// <remarks>
    // /// Decimal number is encoded in 13 bytes as follows:
    // /// - byte 0: highest bit indicates sign (1 for negative, 0 for non-negative); the remaining 7 bits encode scale
    // /// - bytes 1..12: 96-bit unsigned integer in little endian encoding.
    // /// </remarks>
    // /// <exception cref="BadImageFormatException">The data at the current position was not a valid <see cref="decimal"/> number.</exception>
    // public decimal ReadDecimal()
    // {
    //     byte* ptr = GetCurrentPointerAndAdvance(13);

    //     byte scale = (byte)(*ptr & 0x7f);
    //     if (scale > 28)
    //     {
    //         throw new BadImageFormatException(SR.ValueTooLarge);
    //     }

    //     unchecked
    //     {
    //         return new decimal(
    //             (ptr[1] | (ptr[2] << 8) | (ptr[3] << 16) | (ptr[4] << 24)),
    //             (ptr[5] | (ptr[6] << 8) | (ptr[7] << 16) | (ptr[8] << 24)),
    //             (ptr[9] | (ptr[10] << 8) | (ptr[11] << 16) | (ptr[12] << 24)),
    //             isNegative: (*ptr & 0x80) != 0,
    //             scale: scale);
    //     }
    // }

    // public DateTime ReadDateTime()
    // {
    //     return new DateTime(ReadInt64());
    // }

    // public SignatureHeader ReadSignatureHeader()
    // {
    //     return new SignatureHeader(ReadByte());
    // }

    // /// <summary>
    // /// Finds specified byte in the blob following the current position.
    // /// </summary>
    // /// <returns>
    // /// Index relative to the current position, or -1 if the byte is not found in the blob following the current position.
    // /// </returns>
    // /// <remarks>
    // /// Doesn't change the current position.
    // /// </remarks>
    // public int IndexOf(byte value)
    // {
    //     int start = Offset;
    //     int absoluteIndex = _block.IndexOfUnchecked(value, start);
    //     return (absoluteIndex >= 0) ? absoluteIndex - start : -1;
    // }

    // /// <summary>
    // /// Reads UTF-8 encoded string starting at the current position.
    // /// </summary>
    // /// <param name="byteCount">The number of bytes to read.</param>
    // /// <returns>The string.</returns>
    // /// <exception cref="BadImageFormatException"><paramref name="byteCount"/> bytes not available.</exception>
    // public string ReadUTF8(int byteCount)
    // {
    //     string s = _block.PeekUtf8(this.Offset, byteCount);
    //     _currentPointer += byteCount;
    //     return s;
    // }

    // /// <summary>
    // /// Reads UTF-16 (little-endian) encoded string starting at the current position.
    // /// </summary>
    // /// <param name="byteCount">The number of bytes to read.</param>
    // /// <returns>The string.</returns>
    // /// <exception cref="BadImageFormatException"><paramref name="byteCount"/> bytes not available.</exception>
    // public string ReadUTF16(int byteCount)
    // {
    //     string s = _block.PeekUtf16(this.Offset, byteCount);
    //     _currentPointer += byteCount;
    //     return s;
    // }

    /// <summary>
    /// Reads bytes starting at the current position.
    /// </summary>
    /// <param name="byteCount">The number of bytes to read.</param>
    /// <returns>The byte array.</returns>
    /// <exception cref="BadImageFormatException"><paramref name="byteCount"/> bytes not available.</exception>
    public ReadBytes(byteCount: number): Uint8Array {
        // byte[] bytes = _block.PeekBytes(this.Offset, byteCount);
        // _currentPointer += byteCount;
        // return bytes;
        throw new Error("Not implemented");
    }

    // /// <summary>
    // /// Reads bytes starting at the current position in to the given buffer at the given offset;
    // /// </summary>
    // /// <param name="byteCount">The number of bytes to read.</param>
    // /// <param name="buffer">The destination buffer the bytes read will be written.</param>
    // /// <param name="bufferOffset">The offset in the destination buffer where the bytes read will be written.</param>
    // /// <exception cref="BadImageFormatException"><paramref name="byteCount"/> bytes not available.</exception>
    // public void ReadBytes(int byteCount, byte[] buffer, int bufferOffset)
    // {
    //     Marshal.Copy((IntPtr)GetCurrentPointerAndAdvance(byteCount), buffer, bufferOffset, byteCount);
    // }

    public ReadUtf8NullTerminated(): string {
        const terminator = 0;
        const bytesRead = this._block.GetUtf8NullTerminatedLength(this.Offset, terminator);
        const value = this._block.PeekUtf8NullTerminated(this.Offset, undefined, MetadataStringDecoder.DefaultUTF8, terminator);
        this._currentPointer += bytesRead;
        return value;
    }

    // private int ReadCompressedIntegerOrInvalid()
    // {
    //     int bytesRead;
    //     int value = _block.PeekCompressedInteger(this.Offset, out bytesRead);
    //     _currentPointer += bytesRead;
    //     return value;
    // }

    // /// <summary>
    // /// Reads an unsigned compressed integer value.
    // /// See Metadata Specification section II.23.2: Blobs and signatures.
    // /// </summary>
    // /// <param name="value">The value of the compressed integer that was read.</param>
    // /// <returns>true if the value was read successfully. false if the data at the current position was not a valid compressed integer.</returns>
    // public bool TryReadCompressedInteger(out int value)
    // {
    //     value = ReadCompressedIntegerOrInvalid();
    //     return value != InvalidCompressedInteger;
    // }

    // /// <summary>
    // /// Reads an unsigned compressed integer value.
    // /// See Metadata Specification section II.23.2: Blobs and signatures.
    // /// </summary>
    // /// <returns>The value of the compressed integer that was read.</returns>
    // /// <exception cref="BadImageFormatException">The data at the current position was not a valid compressed integer.</exception>
    // public int ReadCompressedInteger()
    // {
    //     int value;
    //     if (!TryReadCompressedInteger(out value))
    //     {
    //         Throw.InvalidCompressedInteger();
    //     }
    //     return value;
    // }

    // /// <summary>
    // /// Reads a signed compressed integer value.
    // /// See Metadata Specification section II.23.2: Blobs and signatures.
    // /// </summary>
    // /// <param name="value">The value of the compressed integer that was read.</param>
    // /// <returns>true if the value was read successfully. false if the data at the current position was not a valid compressed integer.</returns>
    // public bool TryReadCompressedSignedInteger(out int value)
    // {
    //     int bytesRead;
    //     value = _block.PeekCompressedInteger(this.Offset, out bytesRead);

    //     if (value == InvalidCompressedInteger)
    //     {
    //         return false;
    //     }

    //     bool signExtend = (value & 0x1) != 0;
    //     value >>= 1;

    //     if (signExtend)
    //     {
    //         switch (bytesRead)
    //         {
    //             case 1:
    //                 value |= unchecked(0xffffffc0);
    //                 break;
    //             case 2:
    //                 value |= unchecked(0xffffe000);
    //                 break;
    //             default:
    //                 assert(bytesRead == 4);
    //                 value |= unchecked(0xf0000000);
    //                 break;
    //         }
    //     }

    //     _currentPointer += bytesRead;
    //     return true;
    // }

    // /// <summary>
    // /// Reads a signed compressed integer value.
    // /// See Metadata Specification section II.23.2: Blobs and signatures.
    // /// </summary>
    // /// <returns>The value of the compressed integer that was read.</returns>
    // /// <exception cref="BadImageFormatException">The data at the current position was not a valid compressed integer.</exception>
    // public int ReadCompressedSignedInteger()
    // {
    //     int value;
    //     if (!TryReadCompressedSignedInteger(out value))
    //     {
    //         Throw.InvalidCompressedInteger();
    //     }
    //     return value;
    // }

    // /// <summary>
    // /// Reads type code encoded in a serialized custom attribute value.
    // /// </summary>
    // /// <returns><see cref="SerializationTypeCode.Invalid"/> if the encoding is invalid.</returns>
    // public SerializationTypeCode ReadSerializationTypeCode()
    // {
    //     int value = ReadCompressedIntegerOrInvalid();
    //     if (value > byte.MaxValue)
    //     {
    //         return SerializationTypeCode.Invalid;
    //     }

    //     return unchecked((SerializationTypeCode)value);
    // }

    // /// <summary>
    // /// Reads type code encoded in a signature.
    // /// </summary>
    // /// <returns><see cref="SignatureTypeCode.Invalid"/> if the encoding is invalid.</returns>
    // public SignatureTypeCode ReadSignatureTypeCode()
    // {
    //     int value = ReadCompressedIntegerOrInvalid();

    //     switch (value)
    //     {
    //         case CorElementType.ELEMENT_TYPE_CLASS:
    //         case CorElementType.ELEMENT_TYPE_VALUETYPE:
    //             return SignatureTypeCode.TypeHandle;

    //         default:
    //             if (value > byte.MaxValue)
    //             {
    //                 return SignatureTypeCode.Invalid;
    //             }

    //             return unchecked((SignatureTypeCode)value);
    //     }
    // }

    // /// <summary>
    // /// Reads a string encoded as a compressed integer containing its length followed by
    // /// its contents in UTF-8. Null strings are encoded as a single 0xFF byte.
    // /// </summary>
    // /// <remarks>Defined as a 'SerString' in the ECMA CLI specification.</remarks>
    // /// <returns>String value or undefined.</returns>
    // /// <exception cref="BadImageFormatException">If the encoding is invalid.</exception>
    // public string? ReadSerializedString()
    // {
    //     int length;
    //     if (TryReadCompressedInteger(out length))
    //     {
    //         return ReadUTF8(length);
    //     }

    //     if (ReadByte() != 0xFF)
    //     {
    //         Throw.InvalidSerializedString();
    //     }

    //     return undefined;
    // }

    // /// <summary>
    // /// Reads a type handle encoded in a signature as TypeDefOrRefOrSpecEncoded (see ECMA-335 II.23.2.8).
    // /// </summary>
    // /// <returns>The handle or nil if the encoding is invalid.</returns>
    // public EntityHandle ReadTypeHandle()
    // {
    //     uint value = (uint)ReadCompressedIntegerOrInvalid();
    //     uint tokenType = CorEncodeTokenArray[(value & 0x3)];

    //     if (value == InvalidCompressedInteger || tokenType == 0)
    //     {
    //         return default(EntityHandle);
    //     }

    //     return new EntityHandle(tokenType | (value >> 2));
    // }

    // private static ReadOnlySpan<uint> CorEncodeTokenArray => [TokenTypeIds.TypeDef, TokenTypeIds.TypeRef, TokenTypeIds.TypeSpec, 0];

    // /// <summary>
    // /// Reads a #Blob heap handle encoded as a compressed integer.
    // /// </summary>
    // /// <remarks>
    // /// Blobs that contain references to other blobs are used in Portable PDB format, for example <see cref="Document.Name"/>.
    // /// </remarks>
    // public BlobHandle ReadBlobHandle()
    // {
    //     return BlobHandle.FromOffset(ReadCompressedInteger());
    // }

    // /// <summary>
    // /// Reads a constant value (see ECMA-335 Partition II section 22.9) from the current position.
    // /// </summary>
    // /// <exception cref="BadImageFormatException">Error while reading from the blob.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="typeCode"/> is not a valid <see cref="ConstantTypeCode"/>.</exception>
    // /// <returns>
    // /// Boxed constant value. To avoid allocating the object use Read* methods directly.
    // /// Constants of type <see cref="ConstantTypeCode.String"/> are encoded as UTF16 strings, use <see cref="ReadUTF16"/> to read them.
    // /// </returns>
    // public object? ReadConstant(ConstantTypeCode typeCode)
    // {
    //     // Partition II section 22.9:
    //     //
    //     // Type shall be exactly one of: ELEMENT_TYPE_BOOLEAN, ELEMENT_TYPE_CHAR, ELEMENT_TYPE_I1,
    //     // ELEMENT_TYPE_U1, ELEMENT_TYPE_I2, ELEMENT_TYPE_U2, ELEMENT_TYPE_I4, ELEMENT_TYPE_U4,
    //     // ELEMENT_TYPE_I8, ELEMENT_TYPE_U8, ELEMENT_TYPE_R4, ELEMENT_TYPE_R8, or ELEMENT_TYPE_STRING;
    //     // or ELEMENT_TYPE_CLASS with a Value of zero  (23.1.16)

    //     switch (typeCode)
    //     {
    //         case ConstantTypeCode.Boolean:
    //             return ReadBoolean();

    //         case ConstantTypeCode.Char:
    //             return ReadChar();

    //         case ConstantTypeCode.SByte:
    //             return ReadSByte();

    //         case ConstantTypeCode.Int16:
    //             return ReadInt16();

    //         case ConstantTypeCode.Int32:
    //             return ReadInt32();

    //         case ConstantTypeCode.Int64:
    //             return ReadInt64();

    //         case ConstantTypeCode.Byte:
    //             return ReadByte();

    //         case ConstantTypeCode.UInt16:
    //             return ReadUInt16();

    //         case ConstantTypeCode.UInt32:
    //             return ReadUInt32();

    //         case ConstantTypeCode.UInt64:
    //             return ReadUInt64();

    //         case ConstantTypeCode.Single:
    //             return ReadSingle();

    //         case ConstantTypeCode.Double:
    //             return ReadDouble();

    //         case ConstantTypeCode.String:
    //             return ReadUTF16(RemainingBytes);

    //         case ConstantTypeCode.NullReference:
    //             // Partition II section 22.9:
    //             // The encoding of Type for the nullref value is ELEMENT_TYPE_CLASS with a Value of a 4-byte zero.
    //             // Unlike uses of ELEMENT_TYPE_CLASS in signatures, this one is not followed by a type token.
    //             if (ReadUInt32() != 0)
    //             {
    //                 throw new BadImageFormatException(SR.InvalidConstantValue);
    //             }

    //             return undefined;

    //         default:
    //             throw new ArgumentOutOfRangeException(nameof(typeCode));
    //     }
    // }

    // #endregion
}