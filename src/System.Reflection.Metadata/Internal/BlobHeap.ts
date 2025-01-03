import { MemoryBlock } from "System.Reflection.Internal";
import {
    MetadataKind,
    BlobHandle,
    BlobReader,
} from "System.Reflection.Metadata";
import { VirtualHeap } from "System.Reflection.Metadata.Ecma335";

export class BlobHeap {
    private static s_virtualValues?: Uint8Array[];

    public readonly Block: MemoryBlock;
    private _lazyVirtualHeap?: VirtualHeap;

    public constructor(block: MemoryBlock, metadataKind: MetadataKind) {
        this._lazyVirtualHeap = undefined;
        this.Block = block;

        if (BlobHeap.s_virtualValues == undefined && metadataKind != MetadataKind.Ecma335) {
            var blobs = Array<Uint8Array>(BlobHandle.VirtualIndex.Count);

            blobs[BlobHandle.VirtualIndex.ContractPublicKeyToken] = Uint8Array.from([
                0xB0, 0x3F, 0x5F, 0x7F, 0x11, 0xD5, 0x0A, 0x3A
            ]);

            blobs[BlobHandle.VirtualIndex.ContractPublicKey] = Uint8Array.from([
                0x00, 0x24, 0x00, 0x00, 0x04, 0x80, 0x00, 0x00, 0x94, 0x00, 0x00, 0x00, 0x06, 0x02, 0x00, 0x00,
                0x00, 0x24, 0x00, 0x00, 0x52, 0x53, 0x41, 0x31, 0x00, 0x04, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
                0x07, 0xD1, 0xFA, 0x57, 0xC4, 0xAE, 0xD9, 0xF0, 0xA3, 0x2E, 0x84, 0xAA, 0x0F, 0xAE, 0xFD, 0x0D,
                0xE9, 0xE8, 0xFD, 0x6A, 0xEC, 0x8F, 0x87, 0xFB, 0x03, 0x76, 0x6C, 0x83, 0x4C, 0x99, 0x92, 0x1E,
                0xB2, 0x3B, 0xE7, 0x9A, 0xD9, 0xD5, 0xDC, 0xC1, 0xDD, 0x9A, 0xD2, 0x36, 0x13, 0x21, 0x02, 0x90,
                0x0B, 0x72, 0x3C, 0xF9, 0x80, 0x95, 0x7F, 0xC4, 0xE1, 0x77, 0x10, 0x8F, 0xC6, 0x07, 0x77, 0x4F,
                0x29, 0xE8, 0x32, 0x0E, 0x92, 0xEA, 0x05, 0xEC, 0xE4, 0xE8, 0x21, 0xC0, 0xA5, 0xEF, 0xE8, 0xF1,
                0x64, 0x5C, 0x4C, 0x0C, 0x93, 0xC1, 0xAB, 0x99, 0x28, 0x5D, 0x62, 0x2C, 0xAA, 0x65, 0x2C, 0x1D,
                0xFA, 0xD6, 0x3D, 0x74, 0x5D, 0x6F, 0x2D, 0xE5, 0xF1, 0x7E, 0x5E, 0xAF, 0x0F, 0xC4, 0x96, 0x3D,
                0x26, 0x1C, 0x8A, 0x12, 0x43, 0x65, 0x18, 0x20, 0x6D, 0xC0, 0x93, 0x34, 0x4D, 0x5A, 0xD2, 0x93
            ]);

            blobs[BlobHandle.VirtualIndex.AttributeUsage_AllowSingle] = Uint8Array.from([
                // preamble:
                0x01, 0x00,
                // target (template parameter):
                0x00, 0x00, 0x00, 0x00,
                // named arg count:
                0x01, 0x00,
                // SERIALIZATION_TYPE_PROPERTY
                0x54,
                // ELEMENT_TYPE_BOOLEAN
                0x02,
                // "AllowMultiple".Length
                0x0D,
                // "AllowMultiple"
                0x41, 0x6C, 0x6C, 0x6F, 0x77, 0x4D, 0x75, 0x6C, 0x74, 0x69, 0x70, 0x6C, 0x65,
                // false
                0x00
            ]);

            blobs[BlobHandle.VirtualIndex.AttributeUsage_AllowMultiple] = Uint8Array.from([
                // preamble:
                0x01, 0x00,
                // target (template parameter):
                0x00, 0x00, 0x00, 0x00,
                // named arg count:
                0x01, 0x00,
                // SERIALIZATION_TYPE_PROPERTY
                0x54,
                // ELEMENT_TYPE_BOOLEAN
                0x02,
                // "AllowMultiple".Length
                0x0D,
                // "AllowMultiple"
                0x41, 0x6C, 0x6C, 0x6F, 0x77, 0x4D, 0x75, 0x6C, 0x74, 0x69, 0x70, 0x6C, 0x65,
                // true
                0x01
            ]);

            BlobHeap.s_virtualValues = blobs;
        }
    }

    public GetBytes(handle: BlobHandle): Uint8Array {
        if (handle.IsVirtual) {
            // consider: if we returned an ImmutableArray we wouldn't need to copy
            return BlobHeap.GetVirtualBlobBytes(handle, true);
        }

        const offset = handle.GetHeapOffset();
        const { value, numberOfBytesRead } = this.Block.PeekCompressedInteger(offset);
        if (value == BlobReader.InvalidCompressedInteger) {
            return new Uint8Array(0);
        }
        // value means the length of the blob
        const blobLength = value;
        return this.Block.PeekBytes(offset + numberOfBytesRead, blobLength);
    }

    // public MemoryBlock GetMemoryBlock(BlobHandle handle)
    // {
    //     if (handle.IsVirtual)
    //     {
    //         return GetVirtualHandleMemoryBlock(handle);
    //     }

    //     int offset, size;
    //     Block.PeekHeapValueOffsetAndSize(handle.GetHeapOffset(), out offset, out size);
    //     return Block.GetMemoryBlockAt(offset, size);
    // }

    // private MemoryBlock GetVirtualHandleMemoryBlock(BlobHandle handle)
    // {
    //     var heap = VirtualHeap.GetOrCreateVirtualHeap(ref _lazyVirtualHeap);

    //     lock (heap)
    //     {
    //         if (!heap.TryGetMemoryBlock(handle.RawValue, out var block))
    //         {
    //             block = heap.AddBlob(handle.RawValue, GetVirtualBlobBytes(handle, unique: false));
    //         }

    //         return block;
    //     }
    // }

    // public BlobReader GetBlobReader(BlobHandle handle)
    // {
    //     return new BlobReader(GetMemoryBlock(handle));
    // }

    // public BlobHandle GetNextHandle(BlobHandle handle)
    // {
    //     if (handle.IsVirtual)
    //     {
    //         return default(BlobHandle);
    //     }

    //     int offset, size;
    //     if (!Block.PeekHeapValueOffsetAndSize(handle.GetHeapOffset(), out offset, out size))
    //     {
    //         return default(BlobHandle);
    //     }

    //     int nextIndex = offset + size;
    //     if (nextIndex >= Block.Length)
    //     {
    //         return default(BlobHandle);
    //     }

    //     return BlobHandle.FromOffset(nextIndex);
    // }

    public static GetVirtualBlobBytes(handle: BlobHandle, unique: boolean): Uint8Array {
        const index = handle.GetVirtualIndex();
        let result = BlobHeap.s_virtualValues![index];

        switch (index) {
            case BlobHandle.VirtualIndex.AttributeUsage_AllowMultiple:
            case BlobHandle.VirtualIndex.AttributeUsage_AllowSingle:
                result = result.slice();
                handle.SubstituteTemplateParameters(result);
                break;

            default:
                if (unique) {
                    result = result.slice();
                }
                break;
        }

        return result;
    }

    // public string GetDocumentName(DocumentNameBlobHandle handle)
    // {
    //     var blobReader = GetBlobReader(handle);

    //     // Spec: separator is an ASCII encoded character in range [0x01, 0x7F], or byte 0 to represent an empty separator.
    //     int separator = blobReader.ReadByte();
    //     if (separator > 0x7f)
    //     {
    //         throw new BadImageFormatException(SR.InvalidDocumentName);
    //     }

    //     var pooledBuilder = PooledStringBuilder.GetInstance();
    //     var builder = pooledBuilder.Builder;
    //     bool isFirstPart = true;
    //     while (blobReader.RemainingBytes > 0)
    //     {
    //         if (separator != 0 && !isFirstPart)
    //         {
    //             builder.Append((char)separator);
    //         }

    //         var partReader = GetBlobReader(blobReader.ReadBlobHandle());

    //         builder.Append(partReader.ReadUTF8(partReader.Length));
    //         isFirstPart = false;
    //     }

    //     return pooledBuilder.ToStringAndFree();
    // }

    // public bool DocumentNameEquals(DocumentNameBlobHandle handle, string other, bool ignoreCase)
    // {
    //     var blobReader = GetBlobReader(handle);

    //     // Spec: separator is an ASCII encoded character in range [0x01, 0x7F], or byte 0 to represent an empty separator.
    //     int separator = blobReader.ReadByte();
    //     if (separator > 0x7f)
    //     {
    //         return false;
    //     }

    //     int ignoreCaseMask = StringUtils.IgnoreCaseMask(ignoreCase);
    //     int otherIndex = 0;
    //     bool isFirstPart = true;
    //     while (blobReader.RemainingBytes > 0)
    //     {
    //         if (separator != 0 && !isFirstPart)
    //         {
    //             if (otherIndex == other.Length || !StringUtils.IsEqualAscii(other[otherIndex], separator, ignoreCaseMask))
    //             {
    //                 return false;
    //             }

    //             otherIndex++;
    //         }

    //         var partBlock = GetMemoryBlock(blobReader.ReadBlobHandle());

    //         int firstDifferenceIndex;
    //         var result = partBlock.Utf8NullTerminatedFastCompare(0, other, otherIndex, out firstDifferenceIndex, terminator: '\0', ignoreCase: ignoreCase);
    //         if (result == MemoryBlock.FastComparisonResult.Inconclusive)
    //         {
    //             return GetDocumentName(handle).Equals(other, ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
    //         }

    //         if (result == MemoryBlock.FastComparisonResult.Unequal ||
    //             firstDifferenceIndex - otherIndex != partBlock.Length)
    //         {
    //             return false;
    //         }

    //         otherIndex = firstDifferenceIndex;
    //         isFirstPart = false;
    //     }

    //     return otherIndex == other.Length;
    // }
}