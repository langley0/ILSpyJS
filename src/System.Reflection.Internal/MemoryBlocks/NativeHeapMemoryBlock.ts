import { AbstractMemoryBlock } from "./AbstractMemoryBlock";

export class NativeHeapMemoryBlock extends AbstractMemoryBlock {
    //     private sealed unsafe class DisposableData : CriticalDisposableObject
    //     {
    //         private IntPtr _pointer;

    //         public DisposableData(int size)
    //         {
    // #if FEATURE_CER
    //             // make sure the current thread isn't aborted in between allocating and storing the pointer
    //             RuntimeHelpers.PrepareConstrainedRegions();
    //             try
    //             { /* intentionally left blank */ }
    //             finally
    // #endif
    //             {
    //                 _pointer = Marshal.AllocHGlobal(size);
    //             }
    //         }

    //         protected override void Release()
    //         {
    // #if FEATURE_CER
    //             // make sure the current thread isn't aborted in between zeroing the pointer and freeing the memory
    //             RuntimeHelpers.PrepareConstrainedRegions();
    //             try
    //             { /* intentionally left blank */ }
    //             finally
    // #endif
    //             {
    //                 IntPtr ptr = Interlocked.Exchange(ref _pointer, IntPtr.Zero);
    //                 if (ptr != IntPtr.Zero)
    //                 {
    //                     Marshal.FreeHGlobal(ptr);
    //                 }
    //             }
    //         }

    //         public byte* Pointer => (byte*)_pointer;
    //     }

    private readonly _data: Uint8Array;
    private readonly _size: number;

    public constructor(size: number) {
        super();
        this._data = new Uint8Array(size);
        this._size = size;
    }

    public override get Pointer(): Uint8Array {
        return this._data;
    }
    public override get Size(): number {
        return this._size;
    }
}