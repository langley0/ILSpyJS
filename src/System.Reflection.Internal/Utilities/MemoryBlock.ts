import assert from "assert";
// import PointerBuffer from "PointerBuffer";
import { Throw, sizeof, BitConverter, Guid } from "System";
import { MetadataStringDecoder, BlobReader } from "System.Reflection.Metadata";
import { HeapHandleType, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

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

    public PeekInt32(offset: number): number {
        const result = this.PeekUInt32(offset);
        return result;
    }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public PeekUInt32(offset: number): number {
        this.CheckBounds(offset, sizeof('uint'));
        const b1 = this.Pointer[offset];
        const b2 = this.Pointer[offset + 1];
        const b3 = this.Pointer[offset + 2];
        const b4 = this.Pointer[offset + 3];

        return BitConverter.IsLittleEndian ? (b1 + (b2 << 8) + (b3 << 16) + (b4 << 24)) : ((b1 << 24) + (b2 << 16) + (b3 << 8) + b4);
    }

    /// <summary>
    /// Decodes a compressed integer value starting at offset.
    /// See Metadata Specification section II.23.2: Blobs and signatures.
    /// </summary>
    /// <param name="offset">Offset to the start of the compressed data.</param>
    /// <param name="numberOfBytesRead">Bytes actually read.</param>
    /// <returns>
    /// Value between 0 and 0x1fffffff, or <see cref="BlobReader.InvalidCompressedInteger"/> if the value encoding is invalid.
    /// </returns>
    public PeekCompressedInteger(offset: number): { value: number, numberOfBytesRead: number } {
        this.CheckBounds(offset, 0);

        const ptr = this.Pointer.subarray(offset);
        const limit = this.Length - offset;

        if (limit == 0) {
            return { value: BlobReader.InvalidCompressedInteger, numberOfBytesRead: 0 };
        }

        const headerByte = ptr[0];
        if ((headerByte & 0x80) == 0) {
            return { value: headerByte, numberOfBytesRead: 1 };
        }
        else if ((headerByte & 0x40) == 0) {
            if (limit >= 2) {
                return { value: ((headerByte & 0x3f) << 8) | ptr[1], numberOfBytesRead: 2 };

            }
        }
        else if ((headerByte & 0x20) == 0) {
            if (limit >= 4) {
                return { value: ((headerByte & 0x1f) << 24) | (ptr[1] << 16) | (ptr[2] << 8) | ptr[3], numberOfBytesRead: 4 };
            }
        }

        return { value: BlobReader.InvalidCompressedInteger, numberOfBytesRead: 0 };
    }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public PeekUInt16(offset: number): number {
        this.CheckBounds(offset, sizeof('ushort'));
        const b1 = this.Pointer[offset];
        const b2 = this.Pointer[offset + 1];
        return BitConverter.IsLittleEndian ? (b1 + (b2 << 8)) : ((b1 << 8) + b2);
    }

    // When reference has tag bits.
    public PeekTaggedReference(offset: number, smallRefSize: boolean): number {
        return this.PeekReferenceUnchecked(offset, smallRefSize);
    }

    // Use when searching for a tagged or non-tagged reference.
    // The result may be an invalid reference and shall only be used to compare with a valid reference.
    public PeekReferenceUnchecked(offset: number, smallRefSize: boolean): number {
        return smallRefSize ? this.PeekUInt16(offset) : this.PeekUInt32(offset);
    }

    // When reference has at most 24 bits.
    public PeekReference(offset: number, smallRefSize: boolean): number {
        if (smallRefSize) {
            return this.PeekUInt16(offset);
        }

        const value = this.PeekUInt32(offset);

        if (!TokenTypeIds.IsValidRowId(value)) {
            Throw.ReferenceOverflow();
        }

        return value;
    }

    // #String, #Blob heaps
    public PeekHeapReference(offset: number, smallRefSize: boolean): number {
        if (smallRefSize) {
            return this.PeekUInt16(offset);
        }

        const value = this.PeekUInt32(offset);

        if (!HeapHandleType.IsValidHeapOffset(value)) {
            Throw.ReferenceOverflow();
        }

        return value;
    }

    public PeekGuid(offset: number): Guid {
        this.CheckBounds(offset, sizeof('Guid'));

        const ptr = this.Pointer.subarray(offset);
        if (BitConverter.IsLittleEndian) {

            return new Guid(ptr.slice(0, 16));
        }
        else {
            return new Guid(
                Uint8Array.from([
                    ptr[3], ptr[2], ptr[1], ptr[0], // reverse int32
                    ptr[5], ptr[4], // reverse int16
                    ptr[7], ptr[6], // reverse int16
                    ptr[8], ptr[9], ptr[10], ptr[11], ptr[12], ptr[13], ptr[14], ptr[15]])); // leave as is

        }
    }

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

    public CompareUtf8NullTerminatedStringWithAsciiString(offset: number, asciiString: string): number {
        // Assumes stringAscii only contains ASCII characters and no nil characters.

        this.CheckBounds(offset, 0);

        let p = offset;
        const limit = this.Length - offset;

        for (let i = 0; i < asciiString.length; i++) {
            assert(asciiString.charCodeAt(i) > 0 && asciiString.charCodeAt(i) <= 0x7f);

            if (i > limit) {
                // Heap value is shorter.
                return -1;
            }

            if (this.Pointer[p] != asciiString.charCodeAt(i)) {
                // If we hit the end of the heap value (*p == 0)
                // the heap value is shorter than the string, so we return negative value.
                return this.Pointer[p] - asciiString.charCodeAt(i);
            }

            p++;
        }

        // Either the heap value name matches exactly the given string or
        // it is longer so it is considered "greater".
        return (this.Pointer[p] == 0) ? 0 : +1;
    }

    public PeekBytes(offset: number, byteCount: number): Uint8Array {
        this.CheckBounds(offset, byteCount);
        return this.Pointer.subarray(offset, offset + byteCount);
    }

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

    // same as Array.BinarySearch, but without using IComparer
    public BinarySearch(asciiKeys: string[], offset: number): number {
        var low = 0;
        var high = asciiKeys.length - 1;

        while (low <= high) {
            var middle = low + ((high - low) >> 1);
            var midValue = asciiKeys[middle];

            const comparison = this.CompareUtf8NullTerminatedStringWithAsciiString(offset, midValue);
            if (comparison == 0) {
                return middle;
            }

            if (comparison < 0) {
                high = middle - 1;
            }
            else {
                low = middle + 1;
            }
        }

        return ~low;
    }

    /// <summary>
    /// In a table that specifies children via a list field (e.g. TypeDef.FieldList, TypeDef.MethodList),
    /// searches for the parent given a reference to a child.
    /// </summary>
    /// <returns>Returns row number [0..RowCount).</returns>
    public BinarySearchForSlot(
        rowCount: number,
        rowSize: number,
        referenceListOffset: number,
        referenceValue: number,
        isReferenceSmall: boolean,
    ): number {
        let startRowNumber = 0;
        let endRowNumber = rowCount - 1;
        let startValue = this.PeekReferenceUnchecked(startRowNumber * rowSize + referenceListOffset, isReferenceSmall);
        let endValue = this.PeekReferenceUnchecked(endRowNumber * rowSize + referenceListOffset, isReferenceSmall);
        if (endRowNumber == 1) {
            if (referenceValue >= endValue) {
                return endRowNumber;
            }

            return startRowNumber;
        }

        while (endRowNumber - startRowNumber > 1) {
            if (referenceValue <= startValue) {
                return referenceValue == startValue ? startRowNumber : startRowNumber - 1;
            }

            if (referenceValue >= endValue) {
                return referenceValue == endValue ? endRowNumber : endRowNumber + 1;
            }

            const midRowNumber = (startRowNumber + endRowNumber) / 2;
            const midReferenceValue = this.PeekReferenceUnchecked(midRowNumber * rowSize + referenceListOffset, isReferenceSmall);
            if (referenceValue > midReferenceValue) {
                startRowNumber = midRowNumber;
                startValue = midReferenceValue;
            }
            else if (referenceValue < midReferenceValue) {
                endRowNumber = midRowNumber;
                endValue = midReferenceValue;
            }
            else {
                return midRowNumber;
            }
        }

        return startRowNumber;
    }

    /// <summary>
    /// In a table ordered by a column containing entity references searches for a row with the specified reference.
    /// </summary>
    /// <returns>Returns row number [0..RowCount) or -1 if not found.</returns>
    public BinarySearchReference(
        rowCount: number,
        rowSize: number,
        referenceOffset: number,
        referenceValue: number,
        isReferenceSmall: boolean
    ): number {
        let startRowNumber = 0;
        let endRowNumber = rowCount - 1;
        while (startRowNumber <= endRowNumber) {
            let midRowNumber = (startRowNumber + endRowNumber) / 2;
            let midReferenceValue = this.PeekReferenceUnchecked(midRowNumber * rowSize + referenceOffset, isReferenceSmall);
            if (referenceValue > midReferenceValue) {
                startRowNumber = midRowNumber + 1;
            }
            else if (referenceValue < midReferenceValue) {
                endRowNumber = midRowNumber - 1;
            }
            else {
                return midRowNumber;
            }
        }

        return -1;
    }

    // Row number [0, ptrTable.Length) or -1 if not found.
    public BinarySearchReferenceTable(
        ptrTable: number[],
        rowSize: number,
        referenceOffset: number,
        referenceValue: number,
        isReferenceSmall: boolean): number {
        let startRowNumber = 0;
        let endRowNumber = ptrTable.length - 1;
        while (startRowNumber <= endRowNumber) {
            const midRowNumber = (startRowNumber + endRowNumber) / 2;
            const midReferenceValue = this.PeekReferenceUnchecked((ptrTable[midRowNumber] - 1) * rowSize + referenceOffset, isReferenceSmall);
            if (referenceValue > midReferenceValue) {
                startRowNumber = midRowNumber + 1;
            }
            else if (referenceValue < midReferenceValue) {
                endRowNumber = midRowNumber - 1;
            }
            else {
                return midRowNumber;
            }
        }

        return -1;
    }

    /// <summary>
    /// Calculates a range of rows that have specified value in the specified column in a table that is sorted by that column.
    /// </summary>
    public BinarySearchReferenceRange(
        rowCount: number | number[],
        rowSize: number,
        referenceOffset: number,
        referenceValue: number,
        isReferenceSmall: boolean,
    ): {
        startRowNumber: number,
        endRowNumber: number
    } // [0, rowCount) or -1 
    {
        const foundRowNumber = Array.isArray(rowCount) ?
            this.BinarySearchReferenceTable(
                rowCount,
                rowSize,
                referenceOffset,
                referenceValue,
                isReferenceSmall
            ) :
            this.BinarySearchReference(
                rowCount,
                rowSize,
                referenceOffset,
                referenceValue,
                isReferenceSmall
            );

        if (foundRowNumber == -1) {
            const startRowNumber = -1;
            const endRowNumber = -1;
            return { startRowNumber, endRowNumber };
        }

        let startRowNumber = foundRowNumber;
        while (startRowNumber > 0 &&
            this.PeekReferenceUnchecked((startRowNumber - 1) * rowSize + referenceOffset, isReferenceSmall) == referenceValue) {
            startRowNumber--;
        }

        let endRowNumber = foundRowNumber;
        while (endRowNumber + 1 < (Array.isArray(rowCount) ? rowCount.length : rowCount) &&
            this.PeekReferenceUnchecked((endRowNumber + 1) * rowSize + referenceOffset, isReferenceSmall) == referenceValue) {
            endRowNumber++;
        }

        return { startRowNumber, endRowNumber };
    }


    // Always RowNumber....
    public LinearSearchReference(
        rowSize: number,
        referenceOffset: number,
        referenceValue: number,
        isReferenceSmall: boolean): number {
        let currOffset = referenceOffset;
        const totalSize = this.Length;
        while (currOffset < totalSize) {
            const currReference = this.PeekReferenceUnchecked(currOffset, isReferenceSmall);
            if (currReference == referenceValue) {
                return Math.floor(currOffset / rowSize);
            }

            currOffset += rowSize;
        }

        return -1;
    }

    public IsOrderedByReferenceAscending(
        rowSize: number,
        referenceOffset: number,
        isReferenceSmall: boolean): boolean {
        let offset = referenceOffset;
        const totalSize = this.Length;

        let previous = 0;
        while (offset < totalSize) {
            const current = this.PeekReferenceUnchecked(offset, isReferenceSmall);
            if (current < previous) {
                return false;
            }

            previous = current;
            offset += rowSize;
        }

        return true;
    }

    public BuildPtrTable(
        numberOfRows: number,
        rowSize: number,
        referenceOffset: number,
        isReferenceSmall: boolean): number[] {
        const ptrTable = new Array<number>(numberOfRows);
        const unsortedReferences = new Array<number>(numberOfRows);

        for (let i = 0; i < ptrTable.length; i++) {
            ptrTable[i] = i + 1;
        }

        this.ReadColumn(unsortedReferences, rowSize, referenceOffset, isReferenceSmall);
        return ptrTable.sort((a, b) => { return unsortedReferences[a - 1] - unsortedReferences[b - 1]; });
    }

    private ReadColumn(
        result: number[],
        rowSize: number,
        referenceOffset: number,
        isReferenceSmall: boolean,
    ): void {
        let offset = referenceOffset;
        let totalSize = this.Length;

        let i = 0;
        while (offset < totalSize) {
            result[i] = this.PeekReferenceUnchecked(offset, isReferenceSmall);
            offset += rowSize;
            i++;
        }

        assert(i == result.length);
    }

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