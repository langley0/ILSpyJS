import { AbstractMemoryBlock } from "./AbstractMemoryBlock";
import { Stream } from "System.IO";
import { StreamConstraints } from "./StreamConstraints";


export abstract class MemoryBlockProvider  {
    // /// <summary>
    // /// Creates and hydrates a memory block representing all data.
    // /// </summary>
    // /// <exception cref="IOException">Error while reading from the memory source.</exception>
    // public AbstractMemoryBlock GetMemoryBlock()
    // {
    //     return GetMemoryBlockImpl(0, Size);
    // }

    // /// <summary>
    // /// Creates and hydrates a memory block representing data in the specified range.
    // /// </summary>
    // /// <param name="start">Starting offset relative to the beginning of the data represented by this provider.</param>
    // /// <param name="size">Size of the resulting block.</param>
    // /// <exception cref="IOException">Error while reading from the memory source.</exception>
    // public AbstractMemoryBlock GetMemoryBlock(int start, int size)
    // {
    //     // Add cannot overflow as it is the sum of two 32-bit values done in 64 bits.
    //     // Negative start or size is handle by overflow to greater than maximum size = int.MaxValue.
    //     if ((ulong)(unchecked((uint)start)) + unchecked((uint)size) > (ulong)this.Size)
    //     {
    //         Throw.ImageTooSmallOrContainsInvalidOffsetOrCount();
    //     }

    //     return GetMemoryBlockImpl(start, size);
    // }

    /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    protected abstract GetMemoryBlockImpl(start: number, size: number): AbstractMemoryBlock;

    /// <summary>
    /// Gets a seekable and readable <see cref="Stream"/> that can be used to read all data.
    /// The operations on the stream has to be done under a lock of <see cref="StreamConstraints.GuardOpt"/> if non-null.
    /// The image starts at <see cref="StreamConstraints.ImageStart"/> and has size <see cref="StreamConstraints.ImageSize"/>.
    /// It is the caller's responsibility not to read outside those bounds.
    /// </summary>
    public abstract GetStream(): [Stream, StreamConstraints]

    /// <summary>
    /// The size of the data.
    /// </summary>
    public abstract get Size(): number;

    // protected abstract void Dispose(bool disposing);

    // public void Dispose()
    // {
    //     Dispose(disposing: true);
    //     GC.SuppressFinalize(this);
    // }
}