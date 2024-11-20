export class VirtualHeap // : CriticalDisposableObject
{
    //         private struct PinnedBlob
    //         {
    //             // can't be read-only since GCHandle is a mutable struct
    //             public GCHandle Handle;

    //             public readonly int Length;

    //             public PinnedBlob(GCHandle handle, int length)
    //             {
    //                 Handle = handle;
    //                 Length = length;
    //             }

    //             public unsafe MemoryBlock GetMemoryBlock() =>
    //                 new MemoryBlock((byte*)Handle.AddrOfPinnedObject(), Length);
    //         }

    //         // maps raw value of StringHandle or BlobHandle to the corresponding pinned array
    //         private Dictionary<uint, PinnedBlob>? _blobs;

    //         private VirtualHeap()
    //         {
    //             _blobs = new Dictionary<uint, PinnedBlob>();
    //         }

    //         protected override void Release()
    //         {
    // #if FEATURE_CER
    //             // Make sure the current thread isn't aborted in the middle of the operation.
    //             RuntimeHelpers.PrepareConstrainedRegions();
    //             try
    //             { /* intentionally left blank */ }
    //             finally
    // #endif
    //             {
    //                 var blobs = Interlocked.Exchange(ref _blobs, null);

    //                 if (blobs != null)
    //                 {
    //                     foreach (var blobPair in blobs)
    //                     {
    //                         blobPair.Value.Handle.Free();
    //                     }
    //                 }
    //             }
    //         }

    //         private Dictionary<uint, PinnedBlob> GetBlobs()
    //         {
    //             var blobs = _blobs;
    //             if (blobs == null)
    //             {
    //                 throw new ObjectDisposedException(nameof(VirtualHeap));
    //             }

    //             return blobs;
    //         }

    //         public bool TryGetMemoryBlock(uint rawHandle, out MemoryBlock block)
    //         {
    //             if (!GetBlobs().TryGetValue(rawHandle, out var blob))
    //             {
    //                 block = default(MemoryBlock);
    //                 return false;
    //             }

    //             block = blob.GetMemoryBlock();
    //             return true;
    //         }

    //         internal MemoryBlock AddBlob(uint rawHandle, byte[] value)
    //         {
    //             var blobs = GetBlobs();

    //             MemoryBlock result;
    // #if FEATURE_CER
    //             RuntimeHelpers.PrepareConstrainedRegions();
    //             try
    //             { /* intentionally left blank */ }
    //             finally
    // #endif
    //             {
    //                 var blob = new PinnedBlob(GCHandle.Alloc(value, GCHandleType.Pinned), value.Length);
    //                 blobs.Add(rawHandle, blob);
    //                 result = blob.GetMemoryBlock();
    //             }

    //             return result;
    //         }

    //         internal static VirtualHeap GetOrCreateVirtualHeap(ref VirtualHeap? lazyHeap)
    //         {
    //             if (lazyHeap == null)
    //             {
    //                 Interlocked.CompareExchange(ref lazyHeap, new VirtualHeap(), null);
    //             }

    //             return lazyHeap;
    //         }
}