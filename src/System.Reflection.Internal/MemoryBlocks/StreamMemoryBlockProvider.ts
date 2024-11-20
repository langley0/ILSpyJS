import assert from "assert";
import { Stream, SeekOrigin } from "System.IO";
import { StreamConstraints } from "./StreamConstraints";
import { AbstractMemoryBlock } from "./AbstractMemoryBlock";
import { MemoryBlockProvider } from "./MemoryBlockProvider";
import { NativeHeapMemoryBlock } from "./NativeHeapMemoryBlock";

export class StreamMemoryBlockProvider extends MemoryBlockProvider {
    // We're trying to balance total VM usage (which is a minimum of 64KB for a memory mapped file)
    // with private working set (since heap memory will be backed by the paging file and non-sharable).
    // Internal for testing.
    public static readonly MemoryMapThreshold = 16 * 1024;

    // The stream is user specified and might not be thread-safe.
    // Any read from the stream must be protected by streamGuard.
    private _stream: Stream;

    private readonly _leaveOpen: boolean;
    private _useMemoryMap: boolean;

    private readonly _imageStart: number;
    private readonly _imageSize: number;

    public constructor(stream: Stream, imageStart: number, imageSize: number, leaveOpen: boolean) {
        super();

        assert(stream.CanSeek && stream.CanRead);
        this._stream = stream;
        this._imageStart = imageStart;
        this._imageSize = imageSize;
        this._leaveOpen = leaveOpen;
        // memory mapped file not supported
        this._useMemoryMap = false;
    }

    // protected override Dispose(disposing? : boolean)
    // {
    //     assert(disposing);
    //     if (!_leaveOpen)
    //     {
    //         Interlocked.Exchange(ref _stream, undefined!)?.Dispose();
    //     }

    //     Interlocked.Exchange(ref _lazyMemoryMap, undefined)?.Dispose();
    // }

    public override get Size(): number {
        return this._imageSize;
    }

    /// <exception cref="IOException">Error reading from the stream.</exception>
    public static ReadMemoryBlockNoLock(stream: Stream, start: number, size: number): NativeHeapMemoryBlock {
        const block = new NativeHeapMemoryBlock(size);
        stream.Seek(start, SeekOrigin.Begin);

        const bytesRead = stream.ReadBytes(block.Pointer, size);
        if (bytesRead != size) {
            throw new Error("if  it is not a memory mapped file, this code will not be executed.");
        }
        return block;
    }

    /// <exception cref="IOException">Error while reading from the stream.</exception>
    protected override  GetMemoryBlockImpl(start: number, size: number): AbstractMemoryBlock {
        const absoluteStart = this._imageStart + start;

        if (this._useMemoryMap && size > StreamMemoryBlockProvider.MemoryMapThreshold) {
            throw new Error("this code will not be executed.");
        }

        return StreamMemoryBlockProvider.ReadMemoryBlockNoLock(this._stream, absoluteStart, size);
    }

    public override GetStream(): [Stream, StreamConstraints] {
        const constraints = new StreamConstraints(undefined, this._imageStart, this._imageSize);
        return [this._stream, constraints];
    }

    // /// <exception cref="IOException">IO error while mapping memory or not enough memory to create the mapping.</exception>
    // private unsafe boolean TryCreateMemoryMappedFileBlock(long start, int size, [NotNullWhen(true)] out MemoryMappedFileBlock? block)
    // {
    //     if (_lazyMemoryMap == undefined)
    //     {
    //         // leave the underlying stream open. It will be closed by the Dispose method.
    //         MemoryMappedFile newMemoryMap;

    //         // CreateMemoryMap might modify the stream (calls FileStream.Flush)
    //         lock (_streamGuard)
    //         {
    //             try
    //             {
    //                 newMemoryMap =
    //                     MemoryMappedFile.CreateFromFile(
    //                         fileStream: (FileStream)_stream,
    //                         mapName: undefined,
    //                         capacity: 0,
    //                         access: MemoryMappedFileAccess.Read,
    //                         inheritability: HandleInheritability.None,
    //                         leaveOpen: true);
    //             }
    //             catch (UnauthorizedAccessException e)
    //             {
    //                 throw new IOException(e.Message, e);
    //             }
    //         }

    //         if (newMemoryMap == undefined)
    //         {
    //             block = undefined;
    //             return false;
    //         }

    //         if (Interlocked.CompareExchange(ref _lazyMemoryMap, newMemoryMap, undefined) != undefined)
    //         {
    //             newMemoryMap.Dispose();
    //         }
    //     }

    //     MemoryMappedViewAccessor accessor;

    //     lock (_streamGuard)
    //     {
    //         accessor = _lazyMemoryMap.CreateViewAccessor(start, size, MemoryMappedFileAccess.Read);
    //     }

    //     if (accessor == undefined)
    //     {
    //         block = undefined;
    //         return false;
    //     }

    //     block = new MemoryMappedFileBlock(accessor, accessor.SafeMemoryMappedViewHandle, accessor.PointerOffset, size);
    //     return true;
    // }
}