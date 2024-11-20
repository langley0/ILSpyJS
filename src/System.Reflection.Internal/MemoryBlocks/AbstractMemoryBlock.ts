export abstract class AbstractMemoryBlock {
    /// <summary>
    /// Pointer to the underlying data (not valid after disposal).
    /// </summary>
    public abstract get Pointer(): Uint8Array;

    /// <summary>
    /// Size of the block.
    /// </summary>
    public abstract get Size(): number;

    // public unsafe BlobReader GetReader() => new BlobReader(Pointer, Size);

    /// <summary>
    /// Returns the content of the entire memory block.
    /// </summary>
    /// <remarks>
    /// Does not check bounds.
    ///
    /// Only creates a copy of the data if they are not represented by a managed byte array,
    /// or if the specified range doesn't span the entire block.
    /// </remarks>
    public  GetContentUnchecked( start: number ,  length: number): Uint8Array
    {
        return this.Pointer.subarray(start, start + length);
    }

    // /// <summary>
    // /// Disposes the block.
    // /// </summary>
    // /// <remarks>
    // /// The operation is idempotent, but must not be called concurrently with any other operations on the block.
    // ///
    // /// Using the block after dispose is an error in our code and therefore no effort is made to throw a tidy
    // /// ObjectDisposedException and undefined ref or AV is possible.
    // /// </remarks>
    // public abstract void Dispose();
}