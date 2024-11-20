import assert from "assert";
// import PointerBuffer from "PointerBuffer";
import { Throw, sizeof } from "System";
import { MetadataStringDecoder } from "System.Reflection.Metadata";

export class MemoryBlock {
    public readonly Pointer: Uint8Array;
    public readonly Length: number;

    public constructor(buffer: Uint8Array, length: number) {
        assert(length >= 0 && (buffer != undefined || length == 0));
        this.Pointer = buffer;
        this.Length = length;
    }

    public static Create(buffer: Uint8Array, length: number): MemoryBlock {
        if (length < 0) {
            Throw.ArgumentOutOfRange('length');
        }

        return new MemoryBlock(buffer, length);
    }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private CheckBounds(offset: number, byteCount: number) {
        if (offset + byteCount > this.Length) {
            Throw.OutOfBounds();
        }
    }

    // public byte[]? ToArray()
    // {
    //     return Pointer == undefined ? undefined : PeekBytes(0, Length);
    // }

    // private string GetDebuggerDisplay()
    // {
    //     if (Pointer == undefined)
    //     {
    //         return "<undefined>";
    //     }

    //     return GetDebuggerDisplay(out _);
    // }

    // public string GetDebuggerDisplay(out int displayedBytes)
    // {
    //     displayedBytes = Math.Min(Length, 64);
    //     string result = BitConverter.ToString(PeekBytes(0, displayedBytes));
    //     if (displayedBytes < Length)
    //     {
    //         result += "-...";
    //     }

    //     return result;
    // }

    // public string GetDebuggerDisplay(int offset)
    // {
    //     if (Pointer == undefined)
    //     {
    //         return "<undefined>";
    //     }

    //     int displayedBytes;
    //     string display = GetDebuggerDisplay(out displayedBytes);
    //     if (offset < displayedBytes)
    //     {
    //         display = display.Insert(offset * 3, "*");
    //     }
    //     else if (displayedBytes == Length)
    //     {
    //         display += "*";
    //     }
    //     else
    //     {
    //         display += "*...";
    //     }

    //     return display;
    // }

    public GetMemoryBlockAt(offset: number, length: number): MemoryBlock {
        this.CheckBounds(offset, length);
        return new MemoryBlock(this.Pointer.subarray(offset), length);
    }

    public PeekByte(offset: number): number {
        this.CheckBounds(offset, sizeof('byte'));
        const value = this.Pointer.at(offset);
        assert(value !== undefined);
        return value;
    }

    // public int PeekInt32(int offset)
    // {
    //     uint result = PeekUInt32(offset);
    //     if (unchecked(result != result))
    //     {
    //         Throw.ValueOverflow();
    //     }

    //     return result;
    // }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public uint PeekUInt32(int offset)
    // {
    //     CheckBounds(offset, sizeof(uint));

    //     uint result = Unsafe.ReadUnaligned<uint>(Pointer + offset);
    //     return BitConverter.IsLittleEndian ? result : BinaryPrimitives.ReverseEndianness(result);
    // }

    // /// <summary>
    // /// Decodes a compressed integer value starting at offset.
    // /// See Metadata Specification section II.23.2: Blobs and signatures.
    // /// </summary>
    // /// <param name="offset">Offset to the start of the compressed data.</param>
    // /// <param name="numberOfBytesRead">Bytes actually read.</param>
    // /// <returns>
    // /// Value between 0 and 0x1fffffff, or <see cref="BlobReader.InvalidCompressedInteger"/> if the value encoding is invalid.
    // /// </returns>
    // public int PeekCompressedInteger(int offset, out int numberOfBytesRead)
    // {
    //     CheckBounds(offset, 0);

    //     byte* ptr = Pointer + offset;
    //     long limit = Length - offset;

    //     if (limit == 0)
    //     {
    //         numberOfBytesRead = 0;
    //         return BlobReader.InvalidCompressedInteger;
    //     }

    //     byte headerByte = ptr[0];
    //     if ((headerByte & 0x80) == 0)
    //     {
    //         numberOfBytesRead = 1;
    //         return headerByte;
    //     }
    //     else if ((headerByte & 0x40) == 0)
    //     {
    //         if (limit >= 2)
    //         {
    //             numberOfBytesRead = 2;
    //             return ((headerByte & 0x3f) << 8) | ptr[1];
    //         }
    //     }
    //     else if ((headerByte & 0x20) == 0)
    //     {
    //         if (limit >= 4)
    //         {
    //             numberOfBytesRead = 4;
    //             return ((headerByte & 0x1f) << 24) | (ptr[1] << 16) | (ptr[2] << 8) | ptr[3];
    //         }
    //     }

    //     numberOfBytesRead = 0;
    //     return BlobReader.InvalidCompressedInteger;
    // }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public ushort PeekUInt16(int offset)
    // {
    //     CheckBounds(offset, sizeof(ushort));

    //     ushort result = Unsafe.ReadUnaligned<ushort>(Pointer + offset);
    //     return BitConverter.IsLittleEndian ? result : BinaryPrimitives.ReverseEndianness(result);
    // }

    // // When reference has tag bits.
    // public uint PeekTaggedReference(int offset, bool smallRefSize)
    // {
    //     return PeekReferenceUnchecked(offset, smallRefSize);
    // }

    // // Use when searching for a tagged or non-tagged reference.
    // // The result may be an invalid reference and shall only be used to compare with a valid reference.
    // public uint PeekReferenceUnchecked(int offset, bool smallRefSize)
    // {
    //     return smallRefSize ? PeekUInt16(offset) : PeekUInt32(offset);
    // }

    // // When reference has at most 24 bits.
    // public int PeekReference(int offset, bool smallRefSize)
    // {
    //     if (smallRefSize)
    //     {
    //         return PeekUInt16(offset);
    //     }

    //     uint value = PeekUInt32(offset);

    //     if (!TokenTypeIds.IsValidRowId(value))
    //     {
    //         Throw.ReferenceOverflow();
    //     }

    //     return value;
    // }

    // // #String, #Blob heaps
    // public int PeekHeapReference(int offset, bool smallRefSize)
    // {
    //     if (smallRefSize)
    //     {
    //         return PeekUInt16(offset);
    //     }

    //     uint value = PeekUInt32(offset);

    //     if (!HeapHandleType.IsValidHeapOffset(value))
    //     {
    //         Throw.ReferenceOverflow();
    //     }

    //     return value;
    // }

    // public Guid PeekGuid(int offset)
    // {
    //     CheckBounds(offset, sizeof(Guid));

    //     byte* ptr = Pointer + offset;
    //     if (BitConverter.IsLittleEndian)
    //     {
    //         return Unsafe.ReadUnaligned<Guid>(ptr);
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

    // public string PeekUtf16(int offset, int byteCount)
    // {
    //     CheckBounds(offset, byteCount);

    //     byte* ptr = Pointer + offset;
    //     if (BitConverter.IsLittleEndian)
    //     {
    //         // doesn't allocate a new string if byteCount == 0
    //         return new string((char*)ptr, 0, byteCount / sizeof(char));
    //     }
    //     else
    //     {
    //         return Encoding.Unicode.GetString(ptr, byteCount);
    //     }
    // }

    // public string PeekUtf8(int offset, int byteCount)
    // {
    //     CheckBounds(offset, byteCount);
    //     return Encoding.UTF8.GetString(Pointer + offset, byteCount);
    // }

    /// <summary>
    /// Read UTF-8 at the given offset up to the given terminator, undefined terminator, or end-of-block.
    /// </summary>
    /// <param name="offset">Offset in to the block where the UTF-8 bytes start.</param>
    /// <param name="prefix">UTF-8 encoded prefix to prepend to the bytes at the offset before decoding.</param>
    /// <param name="utf8Decoder">The UTF-8 decoder to use that allows user to adjust fallback and/or reuse existing strings without allocating a new one.</param>
    /// <param name="numberOfBytesRead">The number of bytes read, which includes the terminator if we did not hit the end of the block.</param>
    /// <param name="terminator">A character in the ASCII range that marks the end of the string.
    /// If a value other than '\0' is passed we still stop at the undefined terminator if encountered first.</param>
    /// <returns>The decoded string.</returns>
    public PeekUtf8NullTerminated(offset: number, prefix: Uint8Array | undefined, utf8Decoder: MetadataStringDecoder, terminator: number = '\0'.charCodeAt(0)): string {
        assert(terminator <= 0x7F);
        this.CheckBounds(offset, 0);
        const numberOfBytesRead = this.GetUtf8NullTerminatedLength(offset, terminator);
        const value = Buffer.from(this.Pointer.subarray(offset, offset + numberOfBytesRead)).toString("utf8");
        // if last character is terminator, remove it
        if (value.charCodeAt(value.length - 1) == terminator) {
            return value.substring(0, value.length - 1);
        }
        return value;
    }

    /// <summary>
    /// Get number of bytes from offset to given terminator, undefined terminator, or end-of-block (whichever comes first).
    /// Returned length does not include the terminator, but numberOfBytesRead out parameter does.
    /// </summary>
    /// <param name="offset">Offset in to the block where the UTF-8 bytes start.</param>
    /// <param name="terminator">A character in the ASCII range that marks the end of the string.
    /// If a value other than '\0' is passed we still stop at the undefined terminator if encountered first.</param>
    /// <param name="numberOfBytesRead">The number of bytes read, which includes the terminator if we did not hit the end of the block.</param>
    /// <returns>Length (byte count) not including terminator.</returns>
    public GetUtf8NullTerminatedLength(offset: number, terminator: number): number {
        this.CheckBounds(offset, 0);

        assert(terminator <= 0x7f);

        const span = this.Pointer.subarray(offset);
        let length = span.indexOf(terminator);
        length = length >= 0 ? length : span.indexOf(0);

        let numberOfBytesRead: number;
        if (length >= 0) {
            numberOfBytesRead = length + 1; // we also read the terminator
        }
        else {
            numberOfBytesRead = length = span.length;
        }

        return numberOfBytesRead
    }

    // public int Utf8NullTerminatedOffsetOfAsciiChar(int startOffset, char asciiChar)
    // {
    //     CheckBounds(startOffset, 0);

    //     assert(asciiChar != 0 && asciiChar <= 0x7f);

    //     ReadOnlySpan<byte> span = new ReadOnlySpan<byte>(Pointer + startOffset, Length - startOffset);
    //     int i = span.IndexOfAny((byte)asciiChar, (byte)0);
    //     return i >= 0 && span[i] == asciiChar ?
    //         startOffset + i :
    //         -1;
    // }

    // // comparison stops at undefined terminator, terminator parameter, or end-of-block -- whichever comes first.
    // public bool Utf8NullTerminatedEquals(int offset, string text, MetadataStringDecoder utf8Decoder, char terminator, bool ignoreCase)
    // {
    //     FastComparisonResult result = Utf8NullTerminatedFastCompare(offset, text, 0, out _, terminator, ignoreCase);

    //     if (result == FastComparisonResult.Inconclusive)
    //     {
    //         string decoded = PeekUtf8NullTerminated(offset, undefined, utf8Decoder, out _, terminator);
    //         return decoded.Equals(text, ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
    //     }

    //     return result == FastComparisonResult.Equal;
    // }

    // // comparison stops at undefined terminator, terminator parameter, or end-of-block -- whichever comes first.
    // public bool Utf8NullTerminatedStartsWith(int offset, string text, MetadataStringDecoder utf8Decoder, char terminator, bool ignoreCase)
    // {
    //     FastComparisonResult result = Utf8NullTerminatedFastCompare(offset, text, 0, out _, terminator, ignoreCase);

    //     switch (result)
    //     {
    //         case FastComparisonResult.Equal:
    //         case FastComparisonResult.BytesStartWithText:
    //             return true;

    //         case FastComparisonResult.Unequal:
    //         case FastComparisonResult.TextStartsWithBytes:
    //             return false;

    //         default:
    //             assert(result == FastComparisonResult.Inconclusive);
    //             string decoded = PeekUtf8NullTerminated(offset, undefined, utf8Decoder, out _, terminator);
    //             return decoded.StartsWith(text, ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
    //     }
    // }

    // public enum FastComparisonResult
    // {
    //     Equal,
    //     BytesStartWithText,
    //     TextStartsWithBytes,
    //     Unequal,
    //     Inconclusive
    // }

    // // comparison stops at undefined terminator, terminator parameter, or end-of-block -- whichever comes first.
    // public FastComparisonResult Utf8NullTerminatedFastCompare(int offset, string text, int textStart, out int firstDifferenceIndex, char terminator, bool ignoreCase)
    // {
    //     CheckBounds(offset, 0);

    //     assert(terminator <= 0x7F);

    //     byte* startPointer = Pointer + offset;
    //     byte* endPointer = Pointer + Length;
    //     byte* currentPointer = startPointer;

    //     int ignoreCaseMask = StringUtils.IgnoreCaseMask(ignoreCase);
    //     int currentIndex = textStart;
    //     while (currentIndex < text.Length && currentPointer != endPointer)
    //     {
    //         byte currentByte = *currentPointer;

    //         // note that terminator is not compared case-insensitively even if ignore case is true
    //         if (currentByte == 0 || currentByte == terminator)
    //         {
    //             break;
    //         }

    //         char currentChar = text[currentIndex];
    //         if ((currentByte & 0x80) == 0 && StringUtils.IsEqualAscii(currentChar, currentByte, ignoreCaseMask))
    //         {
    //             currentIndex++;
    //             currentPointer++;
    //         }
    //         else
    //         {
    //             firstDifferenceIndex = currentIndex;

    //             // uncommon non-ascii case --> fall back to slow allocating comparison.
    //             return (currentChar > 0x7F) ? FastComparisonResult.Inconclusive : FastComparisonResult.Unequal;
    //         }
    //     }

    //     firstDifferenceIndex = currentIndex;

    //     bool textTerminated = currentIndex == text.Length;
    //     bool bytesTerminated = currentPointer == endPointer || *currentPointer == 0 || *currentPointer == terminator;

    //     if (textTerminated && bytesTerminated)
    //     {
    //         return FastComparisonResult.Equal;
    //     }

    //     return textTerminated ? FastComparisonResult.BytesStartWithText : FastComparisonResult.TextStartsWithBytes;
    // }

    // // comparison stops at undefined terminator, terminator parameter, or end-of-block -- whichever comes first.
    // public bool Utf8NullTerminatedStringStartsWithAsciiPrefix(int offset, string asciiPrefix)
    // {
    //     // Assumes stringAscii only contains ASCII characters and no nil characters.

    //     CheckBounds(offset, 0);

    //     // Make sure that we won't read beyond the block even if the block doesn't end with 0 byte.
    //     if (asciiPrefix.Length > Length - offset)
    //     {
    //         return false;
    //     }

    //     byte* p = Pointer + offset;

    //     for (int i = 0; i < asciiPrefix.Length; i++)
    //     {
    //         assert(asciiPrefix[i] > 0 && asciiPrefix[i] <= 0x7f);

    //         if (asciiPrefix[i] != *p)
    //         {
    //             return false;
    //         }

    //         p++;
    //     }

    //     return true;
    // }

    // public int CompareUtf8NullTerminatedStringWithAsciiString(int offset, string asciiString)
    // {
    //     // Assumes stringAscii only contains ASCII characters and no nil characters.

    //     CheckBounds(offset, 0);

    //     byte* p = Pointer + offset;
    //     int limit = Length - offset;

    //     for (int i = 0; i < asciiString.Length; i++)
    //     {
    //         assert(asciiString[i] > 0 && asciiString[i] <= 0x7f);

    //         if (i > limit)
    //         {
    //             // Heap value is shorter.
    //             return -1;
    //         }

    //         if (*p != asciiString[i])
    //         {
    //             // If we hit the end of the heap value (*p == 0)
    //             // the heap value is shorter than the string, so we return negative value.
    //             return *p - asciiString[i];
    //         }

    //         p++;
    //     }

    //     // Either the heap value name matches exactly the given string or
    //     // it is longer so it is considered "greater".
    //     return (*p == 0) ? 0 : +1;
    // }

    // public byte[] PeekBytes(int offset, int byteCount)
    // {
    //     CheckBounds(offset, byteCount);
    //     return new ReadOnlySpan<byte>(Pointer + offset, byteCount).ToArray();
    // }

    // public int IndexOf(byte b, int start)
    // {
    //     CheckBounds(start, 0);
    //     return IndexOfUnchecked(b, start);
    // }

    // public int IndexOfUnchecked(byte b, int start)
    // {
    //     int i = new ReadOnlySpan<byte>(Pointer + start, Length - start).IndexOf(b);
    //     return i >= 0 ?
    //         i + start :
    //         -1;
    // }

    // // same as Array.BinarySearch, but without using IComparer
    // public int BinarySearch(string[] asciiKeys, int offset)
    // {
    //     var low = 0;
    //     var high = asciiKeys.Length - 1;

    //     while (low <= high)
    //     {
    //         var middle = low + ((high - low) >> 1);
    //         var midValue = asciiKeys[middle];

    //         int comparison = CompareUtf8NullTerminatedStringWithAsciiString(offset, midValue);
    //         if (comparison == 0)
    //         {
    //             return middle;
    //         }

    //         if (comparison < 0)
    //         {
    //             high = middle - 1;
    //         }
    //         else
    //         {
    //             low = middle + 1;
    //         }
    //     }

    //     return ~low;
    // }

    // /// <summary>
    // /// In a table that specifies children via a list field (e.g. TypeDef.FieldList, TypeDef.MethodList),
    // /// searches for the parent given a reference to a child.
    // /// </summary>
    // /// <returns>Returns row number [0..RowCount).</returns>
    // public int BinarySearchForSlot(
    //     int rowCount,
    //     int rowSize,
    //     int referenceListOffset,
    //     uint referenceValue,
    //     bool isReferenceSmall)
    // {
    //     int startRowNumber = 0;
    //     int endRowNumber = rowCount - 1;
    //     uint startValue = PeekReferenceUnchecked(startRowNumber * rowSize + referenceListOffset, isReferenceSmall);
    //     uint endValue = PeekReferenceUnchecked(endRowNumber * rowSize + referenceListOffset, isReferenceSmall);
    //     if (endRowNumber == 1)
    //     {
    //         if (referenceValue >= endValue)
    //         {
    //             return endRowNumber;
    //         }

    //         return startRowNumber;
    //     }

    //     while (endRowNumber - startRowNumber > 1)
    //     {
    //         if (referenceValue <= startValue)
    //         {
    //             return referenceValue == startValue ? startRowNumber : startRowNumber - 1;
    //         }

    //         if (referenceValue >= endValue)
    //         {
    //             return referenceValue == endValue ? endRowNumber : endRowNumber + 1;
    //         }

    //         int midRowNumber = (startRowNumber + endRowNumber) / 2;
    //         uint midReferenceValue = PeekReferenceUnchecked(midRowNumber * rowSize + referenceListOffset, isReferenceSmall);
    //         if (referenceValue > midReferenceValue)
    //         {
    //             startRowNumber = midRowNumber;
    //             startValue = midReferenceValue;
    //         }
    //         else if (referenceValue < midReferenceValue)
    //         {
    //             endRowNumber = midRowNumber;
    //             endValue = midReferenceValue;
    //         }
    //         else
    //         {
    //             return midRowNumber;
    //         }
    //     }

    //     return startRowNumber;
    // }

    // /// <summary>
    // /// In a table ordered by a column containing entity references searches for a row with the specified reference.
    // /// </summary>
    // /// <returns>Returns row number [0..RowCount) or -1 if not found.</returns>
    // public int BinarySearchReference(
    //     int rowCount,
    //     int rowSize,
    //     int referenceOffset,
    //     uint referenceValue,
    //     bool isReferenceSmall)
    // {
    //     int startRowNumber = 0;
    //     int endRowNumber = rowCount - 1;
    //     while (startRowNumber <= endRowNumber)
    //     {
    //         int midRowNumber = (startRowNumber + endRowNumber) / 2;
    //         uint midReferenceValue = PeekReferenceUnchecked(midRowNumber * rowSize + referenceOffset, isReferenceSmall);
    //         if (referenceValue > midReferenceValue)
    //         {
    //             startRowNumber = midRowNumber + 1;
    //         }
    //         else if (referenceValue < midReferenceValue)
    //         {
    //             endRowNumber = midRowNumber - 1;
    //         }
    //         else
    //         {
    //             return midRowNumber;
    //         }
    //     }

    //     return -1;
    // }

    // // Row number [0, ptrTable.Length) or -1 if not found.
    // public int BinarySearchReference(
    //     int[] ptrTable,
    //     int rowSize,
    //     int referenceOffset,
    //     uint referenceValue,
    //     bool isReferenceSmall)
    // {
    //     int startRowNumber = 0;
    //     int endRowNumber = ptrTable.Length - 1;
    //     while (startRowNumber <= endRowNumber)
    //     {
    //         int midRowNumber = (startRowNumber + endRowNumber) / 2;
    //         uint midReferenceValue = PeekReferenceUnchecked((ptrTable[midRowNumber] - 1) * rowSize + referenceOffset, isReferenceSmall);
    //         if (referenceValue > midReferenceValue)
    //         {
    //             startRowNumber = midRowNumber + 1;
    //         }
    //         else if (referenceValue < midReferenceValue)
    //         {
    //             endRowNumber = midRowNumber - 1;
    //         }
    //         else
    //         {
    //             return midRowNumber;
    //         }
    //     }

    //     return -1;
    // }

    // /// <summary>
    // /// Calculates a range of rows that have specified value in the specified column in a table that is sorted by that column.
    // /// </summary>
    // public void BinarySearchReferenceRange(
    //     int rowCount,
    //     int rowSize,
    //     int referenceOffset,
    //     uint referenceValue,
    //     bool isReferenceSmall,
    //     out int startRowNumber, // [0, rowCount) or -1
    //     out int endRowNumber)   // [0, rowCount) or -1
    // {
    //     int foundRowNumber = BinarySearchReference(
    //         rowCount,
    //         rowSize,
    //         referenceOffset,
    //         referenceValue,
    //         isReferenceSmall
    //     );

    //     if (foundRowNumber == -1)
    //     {
    //         startRowNumber = -1;
    //         endRowNumber = -1;
    //         return;
    //     }

    //     startRowNumber = foundRowNumber;
    //     while (startRowNumber > 0 &&
    //            PeekReferenceUnchecked((startRowNumber - 1) * rowSize + referenceOffset, isReferenceSmall) == referenceValue)
    //     {
    //         startRowNumber--;
    //     }

    //     endRowNumber = foundRowNumber;
    //     while (endRowNumber + 1 < rowCount &&
    //            PeekReferenceUnchecked((endRowNumber + 1) * rowSize + referenceOffset, isReferenceSmall) == referenceValue)
    //     {
    //         endRowNumber++;
    //     }
    // }

    // /// <summary>
    // /// Calculates a range of rows that have specified value in the specified column in a table that is sorted by that column.
    // /// </summary>
    // public void BinarySearchReferenceRange(
    //     int[] ptrTable,
    //     int rowSize,
    //     int referenceOffset,
    //     uint referenceValue,
    //     bool isReferenceSmall,
    //     out int startRowNumber, // [0, ptrTable.Length) or -1
    //     out int endRowNumber)   // [0, ptrTable.Length) or -1
    // {
    //     int foundRowNumber = BinarySearchReference(
    //         ptrTable,
    //         rowSize,
    //         referenceOffset,
    //         referenceValue,
    //         isReferenceSmall
    //     );

    //     if (foundRowNumber == -1)
    //     {
    //         startRowNumber = -1;
    //         endRowNumber = -1;
    //         return;
    //     }

    //     startRowNumber = foundRowNumber;
    //     while (startRowNumber > 0 &&
    //            PeekReferenceUnchecked((ptrTable[startRowNumber - 1] - 1) * rowSize + referenceOffset, isReferenceSmall) == referenceValue)
    //     {
    //         startRowNumber--;
    //     }

    //     endRowNumber = foundRowNumber;
    //     while (endRowNumber + 1 < ptrTable.Length &&
    //            PeekReferenceUnchecked((ptrTable[endRowNumber + 1] - 1) * rowSize + referenceOffset, isReferenceSmall) == referenceValue)
    //     {
    //         endRowNumber++;
    //     }
    // }

    // // Always RowNumber....
    // public int LinearSearchReference(
    //     int rowSize,
    //     int referenceOffset,
    //     uint referenceValue,
    //     bool isReferenceSmall)
    // {
    //     int currOffset = referenceOffset;
    //     int totalSize = this.Length;
    //     while (currOffset < totalSize)
    //     {
    //         uint currReference = PeekReferenceUnchecked(currOffset, isReferenceSmall);
    //         if (currReference == referenceValue)
    //         {
    //             return currOffset / rowSize;
    //         }

    //         currOffset += rowSize;
    //     }

    //     return -1;
    // }

    // public bool IsOrderedByReferenceAscending(
    //     int rowSize,
    //     int referenceOffset,
    //     bool isReferenceSmall)
    // {
    //     int offset = referenceOffset;
    //     int totalSize = this.Length;

    //     uint previous = 0;
    //     while (offset < totalSize)
    //     {
    //         uint current = PeekReferenceUnchecked(offset, isReferenceSmall);
    //         if (current < previous)
    //         {
    //             return false;
    //         }

    //         previous = current;
    //         offset += rowSize;
    //     }

    //     return true;
    // }

    // public int[] BuildPtrTable(
    //     int numberOfRows,
    //     int rowSize,
    //     int referenceOffset,
    //     bool isReferenceSmall)
    // {
    //     int[] ptrTable = new int[numberOfRows];
    //     uint[] unsortedReferences = new uint[numberOfRows];

    //     for (int i = 0; i < ptrTable.Length; i++)
    //     {
    //         ptrTable[i] = i + 1;
    //     }

    //     ReadColumn(unsortedReferences, rowSize, referenceOffset, isReferenceSmall);
    //     Array.Sort(ptrTable, (int a, int b) => { return unsortedReferences[a - 1].CompareTo(unsortedReferences[b - 1]); });
    //     return ptrTable;
    // }

    // private void ReadColumn(
    //     uint[] result,
    //     int rowSize,
    //     int referenceOffset,
    //     bool isReferenceSmall)
    // {
    //     int offset = referenceOffset;
    //     int totalSize = this.Length;

    //     int i = 0;
    //     while (offset < totalSize)
    //     {
    //         result[i] = PeekReferenceUnchecked(offset, isReferenceSmall);
    //         offset += rowSize;
    //         i++;
    //     }

    //     assert(i == result.Length);
    // }

    // public bool PeekHeapValueOffsetAndSize(int index, out int offset, out int size)
    // {
    //     int bytesRead;
    //     int numberOfBytes = PeekCompressedInteger(index, out bytesRead);
    //     if (numberOfBytes == BlobReader.InvalidCompressedInteger)
    //     {
    //         offset = 0;
    //         size = 0;
    //         return false;
    //     }

    //     offset = index + bytesRead;
    //     size = numberOfBytes;
    //     return true;
    // }
}