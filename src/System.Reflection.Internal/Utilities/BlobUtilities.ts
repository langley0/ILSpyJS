import { Throw } from "System";
export class BlobUtilities {
    //     public static void WriteBytes(this byte[] buffer, int start, byte value, int byteCount)
    //     {
    //         assert(buffer.Length > 0);

    //         new Span<byte>(buffer, start, byteCount).Fill(value);
    //     }

    //     public static void WriteDouble(this byte[] buffer, int start, double value)
    //     {
    // #if NET
    //         WriteUInt64(buffer, start, BitConverter.DoubleToUInt64Bits(value));
    // #else
    //         WriteUInt64(buffer, start, *(ulong*)&value);
    // #endif
    //     }

    //     public static void WriteSingle(this byte[] buffer, int start, float value)
    //     {
    // #if NET
    //         WriteUInt32(buffer, start, BitConverter.SingleToUInt32Bits(value));
    // #else
    //         WriteUInt32(buffer, start, *(uint*)&value);
    // #endif
    //     }

    //     public static void WriteByte(this byte[] buffer, int start, byte value)
    //     {
    //         // Perf: The compiler emits a check when pinning the buffer. It's thus not worth doing so.
    //         buffer[start] = value;
    //     }

    //     public static void WriteUInt16(this byte[] buffer, int start, ushort value) =>
    //         Unsafe.WriteUnaligned(ref buffer[start], !BitConverter.IsLittleEndian ? BinaryPrimitives.ReverseEndianness(value) : value);

    //     public static void WriteUInt16BE(this byte[] buffer, int start, ushort value) =>
    //         Unsafe.WriteUnaligned(ref buffer[start], BitConverter.IsLittleEndian ? BinaryPrimitives.ReverseEndianness(value) : value);

    //     public static void WriteUInt32BE(this byte[] buffer, int start, uint value) =>
    //         Unsafe.WriteUnaligned(ref buffer[start], BitConverter.IsLittleEndian ? BinaryPrimitives.ReverseEndianness(value) : value);

    //     public static void WriteUInt32(this byte[] buffer, int start, uint value) =>
    //         Unsafe.WriteUnaligned(ref buffer[start], !BitConverter.IsLittleEndian ? BinaryPrimitives.ReverseEndianness(value) : value);

    //     public static void WriteUInt64(this byte[] buffer, int start, ulong value) =>
    //         Unsafe.WriteUnaligned(ref buffer[start], !BitConverter.IsLittleEndian ? BinaryPrimitives.ReverseEndianness(value) : value);

    //     public const int SizeOfSerializedDecimal = sizeof(byte) + 3 * sizeof;

    //     public static void WriteDecimal(this byte[] buffer, int start, decimal value)
    //     {
    //         boolean isNegative;
    //         byte scale;
    //         uint low, mid, high;
    //         value.GetBits(out isNegative, out scale, out low, out mid, out high);

    //         WriteByte(buffer, start, (byte)(scale | (isNegative ? 0x80 : 0x00)));
    //         WriteUInt32(buffer, start + 1, low);
    //         WriteUInt32(buffer, start + 5, mid);
    //         WriteUInt32(buffer, start + 9, high);
    //     }

    public static readonly SizeOfGuid = 16;

    //     public static void WriteGuid(this byte[] buffer, int start, Guid value)
    //     {
    // #if NET
    //         boolean written = value.TryWriteBytes(buffer.AsSpan(start));
    //         // This function is not public, callers have to ensure that enough space is available.
    //         assert(written);
    // #else
    //         fixed (byte* dst = &buffer[start])
    //         {
    //             byte* src = (byte*)&value;

    //             uint a = *(uint*)(src + 0);
    //             unchecked
    //             {
    //                 dst[0] = (byte)a;
    //                 dst[1] = (byte)(a >> 8);
    //                 dst[2] = (byte)(a >> 16);
    //                 dst[3] = (byte)(a >> 24);

    //                 ushort b = *(ushort*)(src + 4);
    //                 dst[4] = (byte)b;
    //                 dst[5] = (byte)(b >> 8);

    //                 ushort c = *(ushort*)(src + 6);
    //                 dst[6] = (byte)c;
    //                 dst[7] = (byte)(c >> 8);
    //             }

    //             dst[8] = src[8];
    //             dst[9] = src[9];
    //             dst[10] = src[10];
    //             dst[11] = src[11];
    //             dst[12] = src[12];
    //             dst[13] = src[13];
    //             dst[14] = src[14];
    //             dst[15] = src[15];
    //         }
    // #endif
    //     }

    //     public static void WriteUTF8(this byte[] buffer, int start, char* charPtr, int charCount, int byteCount, boolean allowUnpairedSurrogates)
    //     {
    //         assert(byteCount >= charCount);
    //         const char ReplacementCharacter = '\uFFFD';

    //         char* strEnd = charPtr + charCount;
    //         fixed (byte* bufferPtr = &buffer[0])
    //         {
    //             byte* ptr = bufferPtr + start;

    //             if (byteCount == charCount)
    //             {
    //                 while (charPtr < strEnd)
    //                 {
    //                     assert(*charPtr <= 0x7f);
    //                     *ptr++ = unchecked((byte)*charPtr++);
    //                 }
    //             }
    //             else
    //             {
    //                 while (charPtr < strEnd)
    //                 {
    //                     char c = *charPtr++;

    //                     if (c < 0x80)
    //                     {
    //                         *ptr++ = (byte)c;
    //                         continue;
    //                     }

    //                     if (c < 0x800)
    //                     {
    //                         ptr[0] = (byte)(((c >> 6) & 0x1F) | 0xC0);
    //                         ptr[1] = (byte)((c & 0x3F) | 0x80);
    //                         ptr += 2;
    //                         continue;
    //                     }

    //                     if (IsSurrogateChar(c))
    //                     {
    //                         // surrogate pair
    //                         if (IsHighSurrogateChar(c) && charPtr < strEnd && IsLowSurrogateChar(*charPtr))
    //                         {
    //                             int highSurrogate = c;
    //                             int lowSurrogate = *charPtr++;
    //                             int codepoint = (((highSurrogate - 0xd800) << 10) + lowSurrogate - 0xdc00) + 0x10000;
    //                             ptr[0] = (byte)(((codepoint >> 18) & 0x7) | 0xF0);
    //                             ptr[1] = (byte)(((codepoint >> 12) & 0x3F) | 0x80);
    //                             ptr[2] = (byte)(((codepoint >> 6) & 0x3F) | 0x80);
    //                             ptr[3] = (byte)((codepoint & 0x3F) | 0x80);
    //                             ptr += 4;
    //                             continue;
    //                         }

    //                         // unpaired high/low surrogate
    //                         if (!allowUnpairedSurrogates)
    //                         {
    //                             c = ReplacementCharacter;
    //                         }
    //                     }

    //                     ptr[0] = (byte)(((c >> 12) & 0xF) | 0xE0);
    //                     ptr[1] = (byte)(((c >> 6) & 0x3F) | 0x80);
    //                     ptr[2] = (byte)((c & 0x3F) | 0x80);
    //                     ptr += 3;
    //                 }
    //             }

    //             assert(ptr == bufferPtr + start + byteCount);
    //             assert(charPtr == strEnd);
    //         }
    //     }

    public static GetUTF8ByteCount(str: string): number {
        return Buffer.from(str, "utf-8").length;
    }


    //     public static boolean IsSurrogateChar(int c)
    //     {
    //         return unchecked((c - 0xD800)) <= 0xDFFF - 0xD800;
    //     }

    //     public static boolean IsHighSurrogateChar(int c)
    //     {
    //         return unchecked((c - 0xD800)) <= 0xDBFF - 0xD800;
    //     }

    public static IsLowSurrogateChar(c: number): boolean {
        return (c - 0xDC00) <= (0xDFFF - 0xDC00);
    }

    //     [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static ValidateRange(bufferLength: number, start: number, byteCount: number, byteCountParameterName: string) {
        if (start < 0 || start > bufferLength) {
            Throw.ArgumentOutOfRange('start');
        }

        if (byteCount < 0 || byteCount > bufferLength - start) {
            Throw.ArgumentOutOfRange(byteCountParameterName);
        }
    }

    //     public static int GetUserStringByteLength(int characterCount)
    //     {
    //         return characterCount * 2 + 1;
    //     }

    //     public static byte GetUserStringTrailingByte(string str)
    //     {
    //         // ECMA-335 II.24.2.4:
    //         // This final byte holds the value 1 if and only if any UTF16 character within
    //         // the string has any bit set in its top byte, or its low byte is any of the following:
    //         // 0x01-0x08, 0x0E-0x1F, 0x27, 0x2D, 0x7F.  Otherwise, it holds 0.
    //         // The 1 signifies Unicode characters that require handling beyond that normally provided for 8-bit encoding sets.

    //         foreach (char ch in str)
    //         {
    //             if (ch >= 0x7F)
    //             {
    //                 return 1;
    //             }

    //             switch (ch)
    //             {
    //                 case 0x1:
    //                 case 0x2:
    //                 case 0x3:
    //                 case 0x4:
    //                 case 0x5:
    //                 case 0x6:
    //                 case 0x7:
    //                 case 0x8:
    //                 case 0xE:
    //                 case 0xF:
    //                 case 0x10:
    //                 case 0x11:
    //                 case 0x12:
    //                 case 0x13:
    //                 case 0x14:
    //                 case 0x15:
    //                 case 0x16:
    //                 case 0x17:
    //                 case 0x18:
    //                 case 0x19:
    //                 case 0x1A:
    //                 case 0x1B:
    //                 case 0x1C:
    //                 case 0x1D:
    //                 case 0x1E:
    //                 case 0x1F:
    //                 case 0x27:
    //                 case 0x2D:
    //                     return 1;
    //             }
    //         }

    //         return 0;
    //     }
}