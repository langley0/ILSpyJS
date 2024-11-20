import { MemoryBlock } from "System.Reflection.Internal";

export class GuidHeap {
    public readonly Block: MemoryBlock;

    public constructor(block: MemoryBlock) {
        this.Block = block;
    }

    // internal Guid GetGuid(GuidHandle handle)
    // {
    //     if (handle.IsNil)
    //     {
    //         return default(Guid);
    //     }

    //     // Metadata Spec: The Guid heap is an array of GUIDs, each 16 bytes wide.
    //     // Its first element is numbered 1, its second 2, and so on.
    //     return this.Block.PeekGuid((handle.Index - 1) * BlobUtilities.SizeOfGuid);
    // }
}