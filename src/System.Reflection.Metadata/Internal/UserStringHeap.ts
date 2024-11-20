import { MemoryBlock } from "System.Reflection.Internal";

export class UserStringHeap {
    public readonly Block: MemoryBlock;

    public constructor(block: MemoryBlock) {
        this.Block = block;
    }

    // internal string GetString(UserStringHandle handle)
    // {
    //     int offset, size;
    //     if (!Block.PeekHeapValueOffsetAndSize(handle.GetHeapOffset(), out offset, out size))
    //     {
    //         return string.Empty;
    //     }

    //     // Spec: Furthermore, there is an additional terminal byte (so all byte counts are odd, not even).
    //     // The size in the blob header is the length of the string in bytes + 1.
    //     return Block.PeekUtf16(offset, size & ~1);
    // }

    // internal UserStringHandle GetNextHandle(UserStringHandle handle)
    // {
    //     int offset, size;
    //     if (!Block.PeekHeapValueOffsetAndSize(handle.GetHeapOffset(), out offset, out size))
    //     {
    //         return default(UserStringHandle);
    //     }

    //     int nextIndex = offset + size;
    //     if (nextIndex >= Block.Length)
    //     {
    //         return default(UserStringHandle);
    //     }

    //     return UserStringHandle.FromOffset(nextIndex);
    // }
}