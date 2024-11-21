import { MemoryBlock, BlobUtilities } from "System.Reflection.Internal";
import { GuidHandle } from "System.Reflection.Metadata/TypeSystem/Handles.TypeSystem";
import { Guid } from "System/Guid";

export class GuidHeap {
    public readonly Block: MemoryBlock;

    public constructor(block: MemoryBlock) {
        this.Block = block;
    }

    public GetGuid( handle: GuidHandle) : Guid
    {
        if (handle.IsNil)
        {
            return new Guid();
        }

        // Metadata Spec: The Guid heap is an array of GUIDs, each 16 bytes wide.
        // Its first element is numbered 1, its second 2, and so on.
        return this.Block.PeekGuid((handle.Index - 1) * BlobUtilities.SizeOfGuid);
    }
}