import assert from "assert";
import { Throw, sizeof, Guid } from "System";
import { BitArithmetic, BlobUtilities } from "System.Reflection";
import { BlobBuilderImpl } from "./BlobWriterImpl";
import { Blob } from "./Blob";
import { Chunks, Blobs } from "./BlobBuilder.Enumerators";

export class BlobBuilder {
    // The implementation is akin to StringBuilder.
    // The differences:
    // - BlobBuilder allows efficient sequential write of the built content to a stream.
    // - BlobBuilder allows for chunk allocation customization. A custom allocator can use pooling strategy, for example.

    public static readonly DefaultChunkSize = 256;

    // Must be at least the size of the largest primitive type we write atomically (Guid).
    public static readonly MinChunkSize = 16;

    // Builders are linked like so:
    //
    // [1:first]->[2]->[3:last]<-[4:head]
    //     ^_______________|
    //
    // In this case the content represented is a sequence (1,2,3,4).
    // This structure optimizes for append write operations and sequential enumeration from the start of the chain.
    // Data can only be written to the head node. Other nodes are "frozen".
    private _nextOrPrevious: BlobBuilder;
    private get FirstChunk(): BlobBuilder {
        return this._nextOrPrevious._nextOrPrevious;
    }

    // The sum of lengths of all preceding chunks (not including the current chunk),
    // or a difference between original buffer length of a builder that was linked as a suffix to another builder,
    // and the current length of the buffer (not that the buffers are swapped when suffix linking).
    private _previousLengthOrFrozenSuffixLengthDelta: number;

    private _buffer: Buffer;

    // The length of data in the buffer in lower 31 bits.
    // Head: highest bit is 0, length may be 0.
    // Non-head: highest bit is 1, lower 31 bits are not all 0.
    private _length: number;

    // begin of getter for only Chunks 
    public get _nextOrPrevious_chunks() {
        return this._nextOrPrevious;
    }
    public get FirstChunk_chunks() {
        return this.FirstChunk;
    }
    public get _buffer_chunks() {
        return this._buffer;
    }
    public get _length_chunks() {
        return this._length;
    }
    // end of getter for only Chunks

    private static readonly IsFrozenMask = 0x80000000;
    public get IsHead(): boolean {
        return (this._length & BlobBuilder.IsFrozenMask) == 0;
    }
    public get Length(): number {
        return (this._length & ~BlobBuilder.IsFrozenMask);
    }
    public get FrozenLength(): number {
        return this._length | BlobBuilder.IsFrozenMask;
    }
    public get Span(): Uint8Array {
        return this._buffer;
    }

    public constructor(capacity: number = BlobBuilder.DefaultChunkSize) {
        if (capacity < 0) {
            Throw.ArgumentOutOfRange("capacity");
        }

        this._nextOrPrevious = this;
        this._buffer = Buffer.from(new Uint8Array(Math.max(BlobBuilder.MinChunkSize, capacity)));
        this._length = 0
        this._previousLengthOrFrozenSuffixLengthDelta = 0;

    }

    protected AllocateChunk(minimalSize: number): BlobBuilder {
        return new BlobBuilder(Math.max(this._buffer.length, minimalSize));
    }

    protected FreeChunk() // for virtual call
    {
        // nop
    }

    public Clear() {
        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        // Swap buffer with the first chunk.
        // Note that we need to keep holding on all allocated buffers,
        // so that builders with custom allocator can release them.
        var first = this.FirstChunk;
        if (first != this) {
            var firstBuffer = first._buffer;
            first._length = this.FrozenLength;
            first._buffer = this._buffer;
            this._buffer = firstBuffer;
        }

        // free all chunks except for the current one
        const chunks = this.GetChunks()
        while (chunks.MoveNext()) {
            const chunk = chunks.Current;
            assert(chunk);
            if (chunk != this) {
                chunk.ClearAndFreeChunk();
            }
        }

        this.ClearChunk();
    }

    protected Free() {
        this.Clear();
        this.FreeChunk();
    }

    // public for testing
    public ClearChunk() {
        this._length = 0;
        this._previousLengthOrFrozenSuffixLengthDelta = 0;
        this._nextOrPrevious = this;
    }

    private CheckInvariants() {
        assert(this._buffer);
        assert(this.Length >= 0 && this.Length <= this._buffer.length);
        assert(this._nextOrPrevious != null);

        if (this.IsHead) {
            assert(this._previousLengthOrFrozenSuffixLengthDelta >= 0);

            // last chunk:
            let totalLength = 0;
            const chunks = this.GetChunks();
            while (chunks.MoveNext()) {
                const chunk = chunks.Current;
                assert(chunk);
                assert(chunk.IsHead || chunk.Length > 0);
                totalLength += chunk.Length;
            }

            assert(totalLength == this.Count);
        }
    }

    public get Count(): number {
        return this._previousLengthOrFrozenSuffixLengthDelta + this.Length;
    }

    private get PreviousLength(): number {
        assert(this.IsHead);
        return this._previousLengthOrFrozenSuffixLengthDelta;
    }

    private set PreviousLength(value: number) {
        assert(this.IsHead);
        this._previousLengthOrFrozenSuffixLengthDelta = value;

    }

    protected get FreeBytes(): number {
        return this._buffer.length - this.Length;
    }

    // // public for testing
    protected get ChunkCapacity(): number {
        return this._buffer.length;
    }

    // public for testing
    public GetChunks(): Chunks {
        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        return new Chunks(this);
    }

    /// <summary>
    /// Returns a sequence of all blobs that represent the content of the builder.
    /// </summary>
    /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    public GetBlobs(): Blobs {
        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        return new Blobs(this);
    }

    // /// <summary>
    // /// Compares the current content of this writer with another one.
    // /// </summary>
    // /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    // public boolean ContentEquals(BlobBuilder other)
    // {
    //     if (!IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     if (ReferenceEquals(this, other))
    //     {
    //         return true;
    //     }

    //     if (other == null)
    //     {
    //         return false;
    //     }

    //     if (!other.IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     if (Count != other.Count)
    //     {
    //         return false;
    //     }

    //     var leftEnumerator = GetChunks();
    //     var rightEnumerator = other.GetChunks();
    //     number leftStart = 0;
    //     number rightStart = 0;

    //     boolean leftContinues = leftEnumerator.MoveNext();
    //     boolean rightContinues = rightEnumerator.MoveNext();

    //     while (leftContinues && rightContinues)
    //     {
    //         assert(leftStart == 0 || rightStart == 0);

    //         var left = leftEnumerator.Current;
    //         var right = rightEnumerator.Current;

    //         number minLength = Math.Min(left.Length - leftStart, right.Length - rightStart);
    //         if (!left._buffer.AsSpan(leftStart, minLength).SequenceEqual(right._buffer.AsSpan(rightStart, minLength)))
    //         {
    //             return false;
    //         }

    //         leftStart += minLength;
    //         rightStart += minLength;

    //         // nothing remains in left chunk to compare:
    //         if (leftStart == left.Length)
    //         {
    //             leftContinues = leftEnumerator.MoveNext();
    //             leftStart = 0;
    //         }

    //         // nothing remains in left chunk to compare:
    //         if (rightStart == right.Length)
    //         {
    //             rightContinues = rightEnumerator.MoveNext();
    //             rightStart = 0;
    //         }
    //     }

    //     return leftContinues == rightContinues;
    // }

    // /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    // public byte[] ToArray()
    // {
    //     return ToArray(0, Count);
    // }

    /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the buffer content.</exception>
    /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    public ToArray(start?: number, byteCount?: number): Uint8Array {
        start = start ?? 0;
        byteCount = byteCount ?? this.Count;

        BlobUtilities.ValidateRange(this.Count, start, byteCount, 'byteCount');

        var result = new Uint8Array(byteCount);

        let chunkStart = 0;
        let bufferStart = start;
        const bufferEnd = start + byteCount;
        for (const chunk of this.GetChunks().ToArray()) {
            const chunkEnd = chunkStart + chunk.Length;
            assert(bufferStart >= chunkStart);

            if (chunkEnd > bufferStart) {
                const bytesToCopy = Math.min(bufferEnd, chunkEnd) - bufferStart;
                assert(bytesToCopy >= 0);

                const src = chunk._buffer;
                const targetStart = bufferStart - start;
                const srcStart = bufferStart - chunkStart;
                const srcEnd = srcStart + bytesToCopy;
                src.copy(result, targetStart, srcStart, srcEnd);

                bufferStart += bytesToCopy;

                if (bufferStart == bufferEnd) {
                    break;
                }
            }

            chunkStart = chunkEnd;
        }

        assert(bufferStart == bufferEnd);

        return result;
    }

    // /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    // public ImmutableArray<byte> ToImmutableArray()
    // {
    //     return ToImmutableArray(0, Count);
    // }

    /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the buffer content.</exception>
    /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    public ToImmutableArray(start?: number, byteCount?: number): Uint8Array {
        return Uint8Array.from([... this.ToArray(start, byteCount)]);
    }

    // public boolean TryGetSpan(out ReadOnlySpan<byte> buffer)
    // {
    //     if (_nextOrPrevious == this)
    //     {
    //         // If the blob builder has one chunk, we can just return it and avoid copies.
    //         buffer = Span;
    //         return true;
    //     }

    //     buffer = default;
    //     return false;
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="destination"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    // public  WriteContentTo(Stream destination)
    // {
    //     if (destination is null)
    //     {
    //         Throw.ArgumentNull(nameof(destination));
    //     }

    //     foreach (var chunk in GetChunks())
    //     {
    //         destination.Write(chunk._buffer, 0, chunk.Length);
    //     }
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="destination"/> is default(<see cref="BlobWriter"/>).</exception>
    // /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    // public  WriteContentTo(ref BlobWriter destination)
    // {
    //     if (destination.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(destination));
    //     }

    //     foreach (var chunk in GetChunks())
    //     {
    //         destination.WriteBytes(chunk.Span);
    //     }
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="destination"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Content is not available, the builder has been linked with another one.</exception>
    // public  WriteContentTo(BlobBuilder destination)
    // {
    //     if (destination is null)
    //     {
    //         Throw.ArgumentNull(nameof(destination));
    //     }

    //     foreach (var chunk in GetChunks())
    //     {
    //         destination.WriteBytes(chunk.Span);
    //     }
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="prefix"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  LinkPrefix(BlobBuilder prefix)
    // {
    //     if (prefix is null)
    //     {
    //         Throw.ArgumentNull(nameof(prefix));
    //     }

    //     // TODO: consider copying data from right to left while there is space

    //     if (!prefix.IsHead || !IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     // avoid chaining empty chunks:
    //     if (prefix.Count == 0)
    //     {
    //         prefix.ClearAndFreeChunk();
    //         return;
    //     }

    //     PreviousLength += prefix.Count;

    //     // prefix is not a head anymore:
    //     prefix._length = prefix.FrozenLength;

    //     // First and last chunks:
    //     //
    //     // [PrefixFirst]->[]->[PrefixLast] <- [prefix]    [First]->[]->[Last] <- [this]
    //     //       ^_________________|                          ^___________|
    //     //
    //     // Degenerate cases:
    //     // this == First == Last and/or prefix == PrefixFirst == PrefixLast.
    //     var first = FirstChunk;
    //     var prefixFirst = prefix.FirstChunk;
    //     var last = _nextOrPrevious;
    //     var prefixLast = prefix._nextOrPrevious;

    //     // Relink like so:
    //     // [PrefixFirst]->[]->[PrefixLast] -> [prefix] -> [First]->[]->[Last] <- [this]
    //     //      ^________________________________________________________|

    //     _nextOrPrevious = (last != this) ? last : prefix;
    //     prefix._nextOrPrevious = (first != this) ? first : (prefixFirst != prefix) ? prefixFirst : prefix;

    //     if (last != this)
    //     {
    //         last._nextOrPrevious = (prefixFirst != prefix) ? prefixFirst : prefix;
    //     }

    //     if (prefixLast != prefix)
    //     {
    //         prefixLast._nextOrPrevious = prefix;
    //     }

    //     prefix.CheckInvariants();
    //     CheckInvariants();
    // }

    /// <exception cref="ArgumentNullException"><paramref name="suffix"/> is null.</exception>
    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public LinkSuffix(suffix?: BlobBuilder) {
        if (!suffix) {
            Throw.ArgumentNull("suffix");
        }

        // TODO: consider copying data from right to left while there is space
        if (!this.IsHead || !suffix.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        // avoid chaining empty chunks:
        if (suffix.Count == 0) {
            suffix.ClearAndFreeChunk();
            return;
        }

        const isEmpty = this.Count == 0;

        // swap buffers of the heads:
        const suffixBuffer = suffix._buffer;
        const suffixLength = suffix._length;
        const suffixPreviousLength = suffix.PreviousLength;
        const oldSuffixLength = suffix.Length;
        suffix._buffer = this._buffer;
        suffix._length = this.FrozenLength; // suffix is not a head anymore
        this._buffer = suffixBuffer;
        this._length = suffixLength;

        this.PreviousLength += suffix.Length + suffixPreviousLength;

        // Update the _previousLength of the suffix so that suffix.Count = suffix._previousLength + suffix.Length doesn't change.
        // Note that the resulting previous length might be negative.
        // The value is not used, other than for calculating the value of Count property.
        suffix._previousLengthOrFrozenSuffixLengthDelta = suffixPreviousLength + oldSuffixLength - suffix.Length;

        if (!isEmpty) {
            // First and last chunks:
            //
            // [First]->[]->[Last] <- [this]    [SuffixFirst]->[]->[SuffixLast]  <- [suffix]
            //    ^___________|                       ^_________________|
            //
            // Degenerate cases:
            // this == First == Last and/or suffix == SuffixFirst == SuffixLast.
            var first = this.FirstChunk;
            var suffixFirst = suffix.FirstChunk;
            var last = this._nextOrPrevious;
            var suffixLast = suffix._nextOrPrevious;

            // Relink like so:
            // [First]->[]->[Last] -> [suffix] -> [SuffixFirst]->[]->[SuffixLast]  <- [this]
            //    ^_______________________________________________________|
            this._nextOrPrevious = suffixLast;
            suffix._nextOrPrevious = (suffixFirst != suffix) ? suffixFirst : (first != this) ? first : suffix;

            if (last != this) {
                last._nextOrPrevious = suffix;
            }

            if (suffixLast != suffix) {
                suffixLast._nextOrPrevious = (first != this) ? first : suffix;
            }
        }

        this.CheckInvariants();
        suffix.CheckInvariants();
    }

    private AddLength(value: number) {
        this._length += value;
    }

    // [MethodImpl(MethodImplOptions.NoInlining)]
    private Expand(newLength: number) {
        // TODO: consider converting the last chunk to a smaller one if there is too much empty space left

        // May happen only if the derived class attempts to write to a builder that is not last,
        // or if a builder prepended to another one is not discarded.
        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        var newChunk = this.AllocateChunk(Math.max(newLength, BlobBuilder.MinChunkSize));
        if (newChunk.ChunkCapacity < newLength) {
            // The overridden allocator didn't provide large enough buffer:
            Throw.InvalidOperationException(`ReturnedBuilderSizeTooSmall:BlobBuilder`, `AllocateChunk`);
        }

        var newBuffer = newChunk._buffer;

        if (this._length == 0) {
            // If the first write into an empty buffer needs more space than the buffer provides, swap the buffers.
            newChunk._buffer = this._buffer;
            this._buffer = newBuffer;
        }
        else {
            // Otherwise append the new buffer.
            var last = this._nextOrPrevious;
            var first = this.FirstChunk;

            if (last == this) {
                // single chunk in the chain
                this._nextOrPrevious = newChunk;
            }
            else {
                newChunk._nextOrPrevious = first;
                last._nextOrPrevious = newChunk;
                this._nextOrPrevious = newChunk;
            }

            newChunk._buffer = this._buffer;
            newChunk._length = this.FrozenLength;
            newChunk._previousLengthOrFrozenSuffixLengthDelta = this.PreviousLength;

            this._buffer = newBuffer;
            this.PreviousLength += this.Length;
            this._length = 0;
        }
    }

    /// <summary>
    /// Reserves a contiguous block of bytes.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public ReserveBytes(byteCount: number): Blob {
        if (byteCount < 0) {
            Throw.ArgumentOutOfRange('byteCount');
        }

        const start = this.ReserveBytesImpl(byteCount);
        return new Blob(this._buffer, start, byteCount);
    }

    private ReserveBytesImpl(byteCount: number): number {
        assert(byteCount >= 0);

        // If write is attempted to a frozen builder we fall back
        // to expand where an exception is thrown:
        let result = this._length;
        if (result > this._buffer.length - byteCount) {
            this.Expand(byteCount);
            result = 0;
        }

        this._length = result + byteCount;
        return result;
    }

    private ReserveBytesPrimitive(byteCount: number): number {
        // If the primitive doesn't fit to the current chuck we'll allocate a new chunk that is at least MinChunkSize.
        // That chunk has to fit the primitive otherwise we might keep allocating new chunks and never end up with one that fits.
        assert(byteCount <= BlobBuilder.MinChunkSize);
        return this.ReserveBytesImpl(byteCount);
    }

    /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteBytes(value: number, byteCount: number) {
        if (byteCount < 0) {
            Throw.ArgumentOutOfRange('byteCount');
        }

        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        const bytesToCurrent = Math.min(this.FreeBytes, byteCount);

        for (let i = 0; i < bytesToCurrent; i++) {
            this._buffer[this.Length + i] = value;
        }
        this.AddLength(bytesToCurrent);

        const remaining = byteCount - bytesToCurrent;
        if (remaining > 0) {
            this.Expand(remaining);


            for (let i = 0; i < remaining; i++) {
                this._buffer[i] = value;
            }
            this.AddLength(remaining);
        }
    }

    /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is null.</exception>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteBytesArray(buffer: Uint8Array, byteCount: number) {
        if (byteCount < 0) {
            Throw.ArgumentOutOfRange('byteCount');
        }

        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        this.WriteBytesUnchecked(buffer.slice(0, byteCount));
    }

    private WriteBytesUnchecked(buffer: Uint8Array) {
        const origin = Buffer.from(buffer);
        const bytesToCurrent = Math.min(this.FreeBytes, buffer.length);

        origin.copy(this._buffer, this.Length, 0, bytesToCurrent);
        this.AddLength(bytesToCurrent);

        if (buffer.length > bytesToCurrent) {
            const remaining = Buffer.from(buffer, bytesToCurrent);
            this.Expand(remaining.length);
            remaining.copy(this._buffer, 0, 0, remaining.length);
            this.AddLength(remaining.length);
        }
    }

    // /// <exception cref="ArgumentNullException"><paramref name="source"/> is null.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="byteCount"/> is negative.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // /// <returns>Bytes successfully written from the <paramref name="source" />.</returns>
    // public number TryWriteBytes(Stream source, number byteCount)
    // {
    //     if (source is null)
    //     {
    //         Throw.ArgumentNull(nameof(source));
    //     }

    //     if (byteCount < 0)
    //     {
    //         throw new ArgumentOutOfRangeException(nameof(byteCount));
    //     }

    //     if (byteCount == 0)
    //     {
    //         return 0;
    //     }

    //     number bytesRead = 0;
    //     number bytesToCurrent = Math.Min(FreeBytes, byteCount);

    //     if (bytesToCurrent > 0)
    //     {
    //         bytesRead = source.TryReadAll(_buffer, Length, bytesToCurrent);
    //         AddLength(bytesRead);

    //         if (bytesRead != bytesToCurrent)
    //         {
    //             return bytesRead;
    //         }
    //     }

    //     number remaining = byteCount - bytesToCurrent;
    //     if (remaining > 0)
    //     {
    //         Expand(remaining);
    //         bytesRead = source.TryReadAll(_buffer, 0, remaining);
    //         AddLength(bytesRead);

    //         bytesRead += bytesToCurrent;
    //     }

    //     return bytesRead;
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteBytes(ImmutableArray<byte> buffer)
    // {
    //     if (buffer.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     WriteBytes(buffer.AsSpan());
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is null.</exception>
    // /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the <paramref name="buffer"/>.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteBytes(ImmutableArray<byte> buffer, number start, number byteCount)
    // {
    //     if (buffer.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     BlobUtilities.ValidateRange(buffer.Length, start, byteCount, nameof(byteCount));

    //     WriteBytes(buffer.AsSpan(start, byteCount));
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteBytes(byte[] buffer)
    // {
    //     if (buffer is null)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     WriteBytes(buffer.AsSpan());
    // }

    // /// <exception cref="ArgumentNullException"><paramref name="buffer"/> is null.</exception>
    // /// <exception cref="ArgumentOutOfRangeException">Range specified by <paramref name="start"/> and <paramref name="byteCount"/> falls outside of the bounds of the <paramref name="buffer"/>.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteBytes(byte[] buffer, number start, number byteCount)
    // {
    //     if (buffer is null)
    //     {
    //         Throw.ArgumentNull(nameof(buffer));
    //     }

    //     BlobUtilities.ValidateRange(buffer.Length, start, byteCount, nameof(byteCount));

    //     WriteBytes(buffer.AsSpan(start, byteCount));
    // }

    // public  WriteBytes(ReadOnlySpan<byte> buffer)
    // {
    //     if (!IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     WriteBytesUnchecked(buffer);
    // }

    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  PadTo(number position)
    // {
    //     WriteBytes(0, position - Count);
    // }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public Align(alignment: number) {
        const position = this.Count;
        this.WriteBytes(0, BitArithmetic.Align32(position, alignment) - position);
    }

    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteBoolean(boolean value)
    // {
    //     WriteByte((byte)(value ? 1 : 0));
    // }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteByte(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('byte'));
        this._buffer.writeUInt8(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteSByte(value: number) {
        this.WriteByte(value);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteDouble(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('double'));
        this._buffer.writeDoubleLE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteSingle(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('float'));
        this._buffer.writeFloatLE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteInt16(value: number) {
        this.WriteUInt16(value);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteUInt16(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('ushort'));
        this._buffer.writeUInt16LE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteInt16BE(value: number) {
        this.WriteUInt16BE(value);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteUInt16BE(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('ushort'));
        this._buffer.writeUInt16BE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteInt32BE(value: number) {
        this.WriteUInt32BE(value);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteUInt32BE(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('uint'));
        this._buffer.writeUInt32BE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteInt32(value: number) {
        this.WriteUInt32(value);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteUInt32(value: number) {
        const start = this.ReserveBytesPrimitive(sizeof('uint'));
        this._buffer.writeUInt32LE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteInt64(value: bigint) {
        this.WriteUInt64(value);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteUInt64(value: bigint) {
        const start = this.ReserveBytesPrimitive(sizeof('ulong'));
        this._buffer.writeBigUInt64LE(value, start);
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteDecimal(value: bigint) {
        // const start = this.ReserveBytesPrimitive(BlobUtilities.SizeOfSerializedDecimal);
        // this._buffer.WriteDecimal(start, value);
        throw new Error("Not implemented");
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteGuid(value: Guid) {
        // const start = this.ReserveBytesPrimitive(BlobUtilities.SizeOfGuid);
        // this._buffer.WriteGuid(start, value);
        throw new Error("Not implemented");
    }

    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteDateTime(value: Date) {
        // this.WriteInt64(BigInt(value.getTime()));
        throw new Error("Not implemented");
    }

    // /// <summary>
    // /// Writes a reference to a heap (heap offset) or a table (row number).
    // /// </summary>
    // /// <param name="reference">Heap offset or table row number.</param>
    // /// <param name="isSmall">True to encode the reference as 16-bit integer, false to encode as 32-bit integer.</param>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteReference(number reference, boolean isSmall)
    // {
    //     // This code is a very hot path, hence we don't check if the reference actually fits 2B.

    //     if (isSmall)
    //     {
    //         assert(unchecked((ushort)reference) == reference);
    //         WriteUInt16((ushort)reference);
    //     }
    //     else
    //     {
    //         WriteInt32(reference);
    //     }
    // }

    // /// <summary>
    // /// Writes UTF-16 (little-endian) encoded string at the current position.
    // /// </summary>
    // /// <exception cref="ArgumentNullException"><paramref name="value"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteUTF16(char[] value)
    // {
    //     if (value is null)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     if (!IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     WriteUTF16(value.AsSpan());
    // }

    // /// <summary>
    // /// Writes UTF-16 (little-endian) encoded string at the current position.
    // /// </summary>
    // /// <exception cref="ArgumentNullException"><paramref name="value"/> is null.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteUTF16(string value)
    // {
    //     if (value is null)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     if (!IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     WriteUTF16(value.AsSpan());
    // }

    // private  WriteUTF16(ReadOnlySpan<char> value)
    // {
    //     if (!IsHead)
    //     {
    //         Throw.InvalidOperationBuilderAlreadyLinked();
    //     }

    //     if (BitConverter.IsLittleEndian)
    //     {
    //         WriteBytesUnchecked(MemoryMarshal.AsBytes(value));
    //     }
    //     else
    //     {
    //         foreach (char c in value)
    //         {
    //             WriteUInt16(c);
    //         }
    //     }
    // }

    // /// <summary>
    // /// Writes string in SerString format (see ECMA-335-II 23.3 Custom attributes).
    // /// </summary>
    // /// <remarks>
    // /// The string is UTF-8 encoded and prefixed by the its size in bytes.
    // /// Null string is represented as a single byte 0xFF.
    // /// </remarks>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteSerializedString(string? value)
    // {
    //     if (value == null)
    //     {
    //         WriteByte(0xff);
    //         return;
    //     }

    //     WriteUTF8(value, 0, value.Length, allowUnpairedSurrogates: true, prependSize: true);
    // }

    // /// <summary>
    // /// Writes string in User String (#US) heap format (see ECMA-335-II 24.2.4 #US and #Blob heaps):
    // /// </summary>
    // /// <remarks>
    // /// The string is UTF-16 encoded and prefixed by the its size in bytes.
    // ///
    // /// This final byte holds the value 1 if and only if any UTF-16 character within the string has any bit set in its top byte,
    // /// or its low byte is any of the following: 0x01-0x08, 0x0E-0x1F, 0x27, 0x2D, 0x7F. Otherwise, it holds 0.
    // /// The 1 signifies Unicode characters that require handling beyond that normally provided for 8-bit encoding sets.
    // /// </remarks>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteUserString(string value)
    // {
    //     if (value is null)
    //     {
    //         Throw.ArgumentNull(nameof(value));
    //     }

    //     WriteCompressedInteger(BlobUtilities.GetUserStringByteLength(value.Length));
    //     WriteUTF16(value);
    //     WriteByte(BlobUtilities.GetUserStringTrailingByte(value));
    // }

    /// <summary>
    /// Writes UTF-8 encoded string at the current position.
    /// </summary>
    /// <param name="value">Constant value.</param>
    /// <param name="allowUnpairedSurrogates">
    /// True to encode unpaired surrogates as specified, otherwise replace them with U+FFFD character.
    /// </param>
    /// <exception cref="ArgumentNullException"><paramref name="value"/> is null.</exception>
    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteUTF8(value: string, allowUnpairedSurrogates: boolean = true) {
        this.WriteUTF8Core(value, 0, value.length, allowUnpairedSurrogates, false);
    }

    public WriteUTF8Core(str: string, start: number, length: number, allowUnpairedSurrogates: boolean, prependSize: boolean) {
        assert(start >= 0);
        assert(length >= 0);
        assert(start + length <= str.length);

        if (!this.IsHead) {
            Throw.InvalidOperationBuilderAlreadyLinked();
        }

        const strBuf = Buffer.from(str, 'utf-8');

        // the max size of compressed number is 4B:
        const byteLimit = this.FreeBytes - (prependSize ? sizeof('uint') : 0);

        const bytesToCurrent = Math.min(strBuf.length, byteLimit);
        const charsToCurrent = bytesToCurrent;
        const charsToNext = length - charsToCurrent;
        const bytesToNext = charsToNext;

        if (prependSize) {
            this.WriteCompressedInteger(strBuf.length);
        }

        for (let i = 0; i < bytesToCurrent; i++) {
            this._buffer.writeUInt8(strBuf[i], i + this.Length);
        }
        this.AddLength(bytesToCurrent);

        if (bytesToNext > 0) {
            this.Expand(bytesToNext);

            for (let i = 0; i < bytesToNext; i++) {
                this._buffer.writeUInt8(strBuf[i], i + this.Length);
            }
            this.AddLength(bytesToNext);
        }
    }

    // /// <summary>
    // /// Implements compressed signed integer encoding as defined by ECMA-335-II chapter 23.2: Blobs and signatures.
    // /// </summary>
    // /// <remarks>
    // /// If the value lies between -64 (0xFFFFFFC0) and 63 (0x3F), inclusive, encode as a one-byte integer:
    // /// bit 7 clear, value bits 5 through 0 held in bits 6 through 1, sign bit (value bit 31) in bit 0.
    // ///
    // /// If the value lies between -8192 (0xFFFFE000) and 8191 (0x1FFF), inclusive, encode as a two-byte integer:
    // /// 15 set, bit 14 clear, value bits 12 through 0 held in bits 13 through 1, sign bit(value bit 31) in bit 0.
    // ///
    // /// If the value lies between -268435456 (0xF000000) and 268435455 (0x0FFFFFFF), inclusive, encode as a four-byte integer:
    // /// 31 set, 30 set, bit 29 clear, value bits 27 through 0 held in bits 28 through 1, sign bit(value bit 31) in bit 0.
    // /// </remarks>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="value"/> can't be represented as a compressed signed integer.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteCompressedSignedInteger(number value)
    // {
    //     BlobWriterImpl.WriteCompressedSignedInteger(this, value);
    // }

    /// <summary>
    /// Implements compressed unsigned integer encoding as defined by ECMA-335-II chapter 23.2: Blobs and signatures.
    /// </summary>
    /// <remarks>
    /// If the value lies between 0 (0x00) and 127 (0x7F), inclusive,
    /// encode as a one-byte integer (bit 7 is clear, value held in bits 6 through 0).
    ///
    /// If the value lies between 28 (0x80) and 214 - 1 (0x3FFF), inclusive,
    /// encode as a 2-byte integer with bit 15 set, bit 14 clear (value held in bits 13 through 0).
    ///
    /// Otherwise, encode as a 4-byte integer, with bit 31 set, bit 30 set, bit 29 clear (value held in bits 28 through 0).
    /// </remarks>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="value"/> can't be represented as a compressed unsigned integer.</exception>
    /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    public WriteCompressedInteger(value: number) {
        BlobBuilderImpl.WriteCompressedInteger(this, value);
    }

    // /// <summary>
    // /// Writes a constant value (see ECMA-335 Partition II section 22.9) at the current position.
    // /// </summary>
    // /// <exception cref="ArgumentException"><paramref name="value"/> is not of a constant type.</exception>
    // /// <exception cref="InvalidOperationException">Builder is not writable, it has been linked with another one.</exception>
    // public  WriteConstant(object? value)
    // {
    //     BlobWriterImpl.WriteConstant(this, value);
    // }

    // public string GetDebuggerDisplay()
    // {
    //     return IsHead ?
    //         string.Join("->", GetChunks().Select(chunk => $"[{Display(chunk._buffer, chunk.Length)}]")) :
    //         $"<{Display(_buffer, Length)}>";
    // }

    // private static string Display(byte[] bytes, number length)
    // {
    //     const number MaxDisplaySize = 64;

    //     return (length <= MaxDisplaySize) ?
    //         BitConverter.ToString(bytes, 0, length) :
    //         BitConverter.ToString(bytes, 0, MaxDisplaySize / 2) + "-...-" + BitConverter.ToString(bytes, length - MaxDisplaySize / 2, MaxDisplaySize / 2);
    // }

    private ClearAndFreeChunk() {
        this.ClearChunk();
        this.FreeChunk();
    }
}