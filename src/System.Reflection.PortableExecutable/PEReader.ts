import assert from "assert";
import { Throw } from "System";
import { Stream, SeekOrigin } from "System.IO";
import {
    AbstractMemoryBlock,
    ExternalMemoryBlockProvider,
    MemoryBlockProvider,
    StreamMemoryBlockProvider,
    StreamExtensions,
} from 'System.Reflection.Internal';
import {
    MetadataReader,
    MetadataReaderOptions,
    MetadataStringDecoder,
} from 'System.Reflection.Metadata';
import { PEHeaders } from './PEHeaders';
import { PEStreamOptions } from './PEStreamOptions';
import { PEMemoryBlock } from "./PEMemoryBlock";


/// <summary>
/// Portable Executable format reader.
/// </summary>
/// <remarks>
/// The implementation is thread-safe, that is multiple threads can read data from the reader in parallel.
/// Disposal of the reader is not thread-safe (see <see cref="Dispose"/>).
/// </remarks>
export class PEReader {
    /// <summary>
    /// True if the PE image has been loaded into memory by the OS loader.
    /// </summary>
    public get IsLoadedImage() {
        return this._isLoadedImage;
    }
    private _isLoadedImage: boolean;

    // May be undefined in the event that the entire image is not
    // deemed necessary and we have been instructed to read
    // the image contents without being lazy.
    //
    // _lazyPEHeaders are not undefined in that case.
    private _peImage?: MemoryBlockProvider;

    // If we read the data from the image lazily (peImage != undefined) we defer reading the PE headers.
    private _lazyPEHeaders?: PEHeaders;

    private _lazyMetadataBlock?: AbstractMemoryBlock;
    private _lazyImageBlock?: AbstractMemoryBlock;
    private _lazyPESectionBlocks?: ArrayLike<AbstractMemoryBlock | undefined>[];

    private constructor() {
        this._isLoadedImage = false;
        this._peImage = undefined;
        this._lazyPEHeaders = undefined;
        this._lazyMetadataBlock = undefined;
        this._lazyImageBlock = undefined;
        this._lazyPESectionBlocks = undefined;
    }

    /// <summary>
    /// Creates a Portable Executable reader over a PE image stored in memory.
    /// </summary>
    /// <param name="peImage">Pointer to the start of the PE image.</param>
    /// <param name="size">The size of the PE image.</param>
    /// <exception cref="ArgumentNullException"><paramref name="peImage"/> is <see cref="IntPtr.Zero"/>.</exception>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="size"/> is negative.</exception>
    /// <remarks>
    /// The memory is owned by the caller and not released on disposal of the <see cref="PEReader"/>.
    /// The caller is responsible for keeping the memory alive and unmodified throughout the lifetime of the <see cref="PEReader"/>.
    /// The content of the image is not read during the construction of the <see cref="PEReader"/>
    /// </remarks>
    // public static FromBuffer(peImage: Uint8Array, size: number): PEReader
    // {
    //     return PEReader.FromBuffer(peImage, size, false);
    // }

    /// <summary>
    /// Creates a Portable Executable reader over a PE image stored in memory.
    /// </summary>
    /// <param name="peImage">Pointer to the start of the PE image.</param>
    /// <param name="size">The size of the PE image.</param>
    /// <param name="isLoadedImage">True if the PE image has been loaded into memory by the OS loader.</param>
    /// <exception cref="ArgumentNullException"><paramref name="peImage"/> is <see cref="IntPtr.Zero"/>.</exception>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="size"/> is negative.</exception>
    /// <remarks>
    /// The memory is owned by the caller and not released on disposal of the <see cref="PEReader"/>.
    /// The caller is responsible for keeping the memory alive and unmodified throughout the lifetime of the <see cref="PEReader"/>.
    /// The content of the image is not read during the construction of the <see cref="PEReader"/>
    /// </remarks>
    public static FromBuffer(peImage?: Uint8Array, size?: number, isLoadedImage?: boolean): PEReader {
        if (!peImage) {
            Throw.ArgumentNull('peImage');
        }
        size = size ?? peImage.length;
        isLoadedImage = isLoadedImage ?? false;

        if (size < 0) {
            Throw.ArgumentOutOfRange('size');
        }

        const peReader = new PEReader();
        peReader._peImage = new ExternalMemoryBlockProvider(peImage, size);
        peReader._isLoadedImage = isLoadedImage;

        return peReader;
    }

    // /// <summary>
    // /// Creates a Portable Executable reader over a PE image stored in a stream.
    // /// </summary>
    // /// <param name="peStream">PE image stream.</param>
    // /// <exception cref="ArgumentNullException"><paramref name="peStream"/> is undefined.</exception>
    // /// <remarks>
    // /// Ownership of the stream is transferred to the <see cref="PEReader"/> upon successful validation of constructor arguments. It will be
    // /// disposed by the <see cref="PEReader"/> and the caller must not manipulate it.
    // /// </remarks>
    // public PEReader(Stream peStream)
    //     : this(peStream, PEStreamOptions.Default)
    // {
    // }

    // /// <summary>
    // /// Creates a Portable Executable reader over a PE image stored in a stream beginning at its current position and ending at the end of the stream.
    // /// </summary>
    // /// <param name="peStream">PE image stream.</param>
    // /// <param name="options">
    // /// Options specifying how sections of the PE image are read from the stream.
    // ///
    // /// Unless <see cref="PEStreamOptions.LeaveOpen"/> is specified, ownership of the stream is transferred to the <see cref="PEReader"/>
    // /// upon successful argument validation. It will be disposed by the <see cref="PEReader"/> and the caller must not manipulate it.
    // ///
    // /// Unless <see cref="PEStreamOptions.PrefetchMetadata"/> or <see cref="PEStreamOptions.PrefetchEntireImage"/> is specified no data
    // /// is read from the stream during the construction of the <see cref="PEReader"/>. Furthermore, the stream must not be manipulated
    // /// by caller while the <see cref="PEReader"/> is alive and undisposed.
    // ///
    // /// If <see cref="PEStreamOptions.PrefetchMetadata"/> or <see cref="PEStreamOptions.PrefetchEntireImage"/>, the <see cref="PEReader"/>
    // /// will have read all of the data requested during construction. As such, if <see cref="PEStreamOptions.LeaveOpen"/> is also
    // /// specified, the caller retains full ownership of the stream and is assured that it will not be manipulated by the <see cref="PEReader"/>
    // /// after construction.
    // /// </param>
    // /// <exception cref="ArgumentNullException"><paramref name="peStream"/> is undefined.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="options"/> has an invalid value.</exception>
    // /// <exception cref="IOException">Error reading from the stream (only when prefetching data).</exception>
    // /// <exception cref="BadImageFormatException"><see cref="PEStreamOptions.PrefetchMetadata"/> is specified and the PE headers of the image are invalid.</exception>
    // public PEReader(Stream peStream, PEStreamOptions options)
    //     : this(peStream, options, 0)
    // {
    // }

    /// <summary>
    /// Creates a Portable Executable reader over a PE image of the given size beginning at the stream's current position.
    /// </summary>
    /// <param name="peStream">PE image stream.</param>
    /// <param name="size">PE image size.</param>
    /// <param name="options">
    /// Options specifying how sections of the PE image are read from the stream.
    ///
    /// Unless <see cref="PEStreamOptions.LeaveOpen"/> is specified, ownership of the stream is transferred to the <see cref="PEReader"/>
    /// upon successful argument validation. It will be disposed by the <see cref="PEReader"/> and the caller must not manipulate it.
    ///
    /// Unless <see cref="PEStreamOptions.PrefetchMetadata"/> or <see cref="PEStreamOptions.PrefetchEntireImage"/> is specified no data
    /// is read from the stream during the construction of the <see cref="PEReader"/>. Furthermore, the stream must not be manipulated
    /// by caller while the <see cref="PEReader"/> is alive and undisposed.
    ///
    /// If <see cref="PEStreamOptions.PrefetchMetadata"/> or <see cref="PEStreamOptions.PrefetchEntireImage"/>, the <see cref="PEReader"/>
    /// will have read all of the data requested during construction. As such, if <see cref="PEStreamOptions.LeaveOpen"/> is also
    /// specified, the caller retains full ownership of the stream and is assured that it will not be manipulated by the <see cref="PEReader"/>
    /// after construction.
    /// </param>
    /// <exception cref="ArgumentOutOfRangeException">Size is negative or extends past the end of the stream.</exception>
    /// <exception cref="IOException">Error reading from the stream (only when prefetching data).</exception>
    /// <exception cref="BadImageFormatException"><see cref="PEStreamOptions.PrefetchMetadata"/> is specified and the PE headers of the image are invalid.</exception>
    public static FromStream(peStream: Stream, options?: PEStreamOptions, size?: number): PEReader {
        if (!peStream.CanRead || !peStream.CanSeek) {
            Throw.ArgumentException("StreamMustSupportReadAndSeek", "peStream");
        }

        options = options ?? PEStreamOptions.Default;
        size = size ?? 0;

        const peReader = new PEReader();

        peReader._isLoadedImage = (options & PEStreamOptions.IsLoadedImage) != 0;

        const start = peStream.Position;
        const actualSize = StreamExtensions.GetAndValidateSize(peStream, size, 'peStream');

        let closeStream = true;
        try {
            if ((options & (PEStreamOptions.PrefetchMetadata | PEStreamOptions.PrefetchEntireImage)) == 0) {
                peReader._peImage = new StreamMemoryBlockProvider(peStream, start, actualSize, (options & PEStreamOptions.LeaveOpen) != 0);
                closeStream = false;
            }
            else {
                // Read in the entire image or metadata blob:
                if ((options & PEStreamOptions.PrefetchEntireImage) != 0) {
                    const imageBlock = StreamMemoryBlockProvider.ReadMemoryBlockNoLock(peStream, start, actualSize);
                    peReader._lazyImageBlock = imageBlock;
                    peReader._peImage = new ExternalMemoryBlockProvider(imageBlock.Pointer, imageBlock.Size);

                    // if the caller asked for metadata initialize the PE headers (calculates metadata offset):
                    if ((options & PEStreamOptions.PrefetchMetadata) != 0) {
                        peReader.InitializePEHeaders();
                    }
                }
                else {
                    // The peImage is left undefined, but the lazyMetadataBlock is initialized up front.
                    peReader._lazyPEHeaders = new PEHeaders(peStream, actualSize, peReader.IsLoadedImage);

                    if (peReader._lazyPEHeaders.MetadataStartOffset != -1) {
                        peReader._lazyMetadataBlock = StreamMemoryBlockProvider.ReadMemoryBlockNoLock(peStream, peReader._lazyPEHeaders.MetadataStartOffset, peReader._lazyPEHeaders.MetadataSize);
                    }
                }
                // We read all we need, the stream is going to be closed.
            }

            return peReader;
        }
        finally {
            if (closeStream && (options & PEStreamOptions.LeaveOpen) == 0) {
                peStream.Dispose();
            }
        }
    }

    // /// <summary>
    // /// Creates a Portable Executable reader over a PE image stored in a byte array.
    // /// </summary>
    // /// <param name="peImage">PE image.</param>
    // /// <remarks>
    // /// The content of the image is not read during the construction of the <see cref="PEReader"/>
    // /// </remarks>
    // /// <exception cref="ArgumentNullException"><paramref name="peImage"/> is undefined.</exception>
    // public PEReader(ImmutableArray<byte> peImage)
    // {
    //     if (peImage.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(peImage));
    //     }

    //     _peImage = new ByteArrayMemoryProvider(peImage);
    // }

    // /// <summary>
    // /// Disposes all memory allocated by the reader.
    // /// </summary>
    // /// <remarks>
    // /// <see cref="Dispose"/>  can be called multiple times (but not in parallel).
    // /// It is not safe to call <see cref="Dispose"/> in parallel with any other operation on the <see cref="PEReader"/>
    // /// or reading from <see cref="PEMemoryBlock"/>s retrieved from the reader.
    // /// </remarks>
    // public void Dispose()
    // {
    //     _lazyPEHeaders = undefined;

    //     _peImage?.Dispose();
    //     _peImage = undefined;

    //     _lazyImageBlock?.Dispose();
    //     _lazyImageBlock = undefined;

    //     _lazyMetadataBlock?.Dispose();
    //     _lazyMetadataBlock = undefined;

    //     const peSectionBlocks = _lazyPESectionBlocks;
    //     if (peSectionBlocks != undefined)
    //     {
    //         foreach (const block in peSectionBlocks)
    //         {
    //             block?.Dispose();
    //         }

    //         _lazyPESectionBlocks = undefined;
    //     }
    // }

    private GetPEImage(): MemoryBlockProvider {
        const peImage = this._peImage;
        if (peImage == undefined) {
            if (this._lazyPEHeaders == undefined) {
                Throw.PEReaderDisposed();
            }
            Throw.InvalidOperation_PEImageNotAvailable();
        }
        return peImage;
    }

    /// <summary>
    /// Gets the PE headers.
    /// </summary>
    /// <exception cref="BadImageFormatException">The headers contain invalid data.</exception>
    /// <exception cref="IOException">Error reading from the stream.</exception>
    public get PEHeaders(): PEHeaders {
        if (this._lazyPEHeaders == undefined) {
            this.InitializePEHeaders();
            assert(this._lazyPEHeaders != undefined);
        }

        return this._lazyPEHeaders;
    }

    /// <exception cref="IOException">Error reading from the stream.</exception>
    private InitializePEHeaders() {
        const [stream, constraints] = this.GetPEImage().GetStream();

        let headers = PEReader.ReadPEHeadersNoLock(stream, constraints.ImageStart, constraints.ImageSize, this.IsLoadedImage);
        this._lazyPEHeaders = headers;
    }

    /// <exception cref="IOException">Error reading from the stream.</exception>
    private static ReadPEHeadersNoLock(stream: Stream, imageStartPosition: number, imageSize: number, isLoadedImage: boolean): PEHeaders {
        assert(imageStartPosition >= 0 && imageStartPosition <= stream.Length);
        stream.Seek(imageStartPosition, SeekOrigin.Begin);
        return new PEHeaders(stream, imageSize, isLoadedImage);
    }

    // /// <summary>
    // /// Returns a view of the entire image as a pointer and length.
    // /// </summary>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // private AbstractMemoryBlock GetEntireImageBlock()
    // {
    //     if (_lazyImageBlock == undefined)
    //     {
    //         const newBlock = GetPEImage().GetMemoryBlock();
    //         if (Interlocked.CompareExchange(ref _lazyImageBlock, newBlock, undefined) != undefined)
    //         {
    //             // another thread created the block already, we need to dispose ours:
    //             newBlock.Dispose();
    //         }
    //     }

    //     return _lazyImageBlock;
    // }

    /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    /// <exception cref="InvalidOperationException">PE image doesn't have metadata.</exception>
    private GetMetadataBlock(): AbstractMemoryBlock {
        if (!this.HasMetadata) {
            Throw.InvalidOperationException("PEImageDoesNotHaveMetadata");
        }

        if (!this._lazyMetadataBlock) {
            this._lazyMetadataBlock = this.GetPEImage().GetMemoryBlock(this.PEHeaders.MetadataStartOffset, this.PEHeaders.MetadataSize);
            assert(this._lazyMetadataBlock != undefined);
        }

        return this._lazyMetadataBlock;
    }

    // /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // private AbstractMemoryBlock GetPESectionBlock(int index)
    // {
    //     assert(index >= 0 && index < PEHeaders.SectionHeaders.Length);

    //     const peImage = GetPEImage();

    //     if (_lazyPESectionBlocks == undefined)
    //     {
    //         Interlocked.CompareExchange(ref _lazyPESectionBlocks, new AbstractMemoryBlock[PEHeaders.SectionHeaders.Length], undefined);
    //     }

    //     AbstractMemoryBlock? existingBlock = Volatile.Read(ref _lazyPESectionBlocks[index]);
    //     if (existingBlock != undefined)
    //     {
    //         return existingBlock;
    //     }

    //     AbstractMemoryBlock newBlock;
    //     if (IsLoadedImage)
    //     {
    //         newBlock = peImage.GetMemoryBlock(
    //             PEHeaders.SectionHeaders[index].VirtualAddress,
    //             PEHeaders.SectionHeaders[index].VirtualSize);
    //     }
    //     else
    //     {
    //         // Virtual size can be smaller than size in the image
    //         // since the size in the image is aligned.
    //         // Trim the alignment.
    //         //
    //         // Virtual size can also be larger than size in the image.
    //         // When loaded sizeInImage bytes are mapped from the image
    //         // and the rest of the bytes are zeroed out.
    //         // Only return data stored in the image.

    //         int size = Math.Min(
    //             PEHeaders.SectionHeaders[index].VirtualSize,
    //             PEHeaders.SectionHeaders[index].SizeOfRawData);

    //         newBlock = peImage.GetMemoryBlock(PEHeaders.SectionHeaders[index].PointerToRawData, size);
    //     }

    //     if (Interlocked.CompareExchange(ref _lazyPESectionBlocks[index], newBlock, undefined) != undefined)
    //     {
    //         // another thread created the block already, we need to dispose ours:
    //         newBlock.Dispose();
    //     }

    //     return _lazyPESectionBlocks[index]!;
    // }

    // /// <summary>
    // /// Return true if the reader can access the entire PE image.
    // /// </summary>
    // /// <remarks>
    // /// Returns false if the <see cref="PEReader"/> is constructed from a stream and only part of it is prefetched into memory.
    // /// </remarks>
    // public bool IsEntireImageAvailable => _lazyImageBlock != undefined || _peImage != undefined;

    // /// <summary>
    // /// Gets a pointer to and size of the PE image if available (<see cref="IsEntireImageAvailable"/>).
    // /// </summary>
    // /// <exception cref="InvalidOperationException">The entire PE image is not available.</exception>
    // public PEMemoryBlock GetEntireImage()
    // {
    //     return new PEMemoryBlock(GetEntireImageBlock());
    // }

    /// <summary>
    /// Returns true if the PE image contains CLI metadata.
    /// </summary>
    /// <exception cref="BadImageFormatException">The PE headers contain invalid data.</exception>
    /// <exception cref="IOException">Error reading from the underlying stream.</exception>
    public get HasMetadata(): boolean {
        return this.PEHeaders.MetadataSize > 0;
    }

    /// <summary>
    /// Loads PE section that contains CLI metadata.
    /// </summary>
    /// <exception cref="InvalidOperationException">The PE image doesn't contain metadata (<see cref="HasMetadata"/> returns false).</exception>
    /// <exception cref="BadImageFormatException">The PE headers contain invalid data.</exception>
    /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    public GetMetadata(): PEMemoryBlock {
        return new PEMemoryBlock(this.GetMetadataBlock());
    }

    // /// <summary>
    // /// Loads PE section that contains the specified <paramref name="relativeVirtualAddress"/> into memory
    // /// and returns a memory block that starts at <paramref name="relativeVirtualAddress"/> and ends at the end of the containing section.
    // /// </summary>
    // /// <param name="relativeVirtualAddress">Relative Virtual Address of the data to read.</param>
    // /// <returns>
    // /// An empty block if <paramref name="relativeVirtualAddress"/> doesn't represent a location in any of the PE sections of this PE image.
    // /// </returns>
    // /// <exception cref="BadImageFormatException">The PE headers contain invalid data.</exception>
    // /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="relativeVirtualAddress"/> is negative.</exception>
    // public PEMemoryBlock GetSectionData(int relativeVirtualAddress)
    // {
    //     if (relativeVirtualAddress < 0)
    //     {
    //         Throw.ArgumentOutOfRange(nameof(relativeVirtualAddress));
    //     }

    //     int sectionIndex = PEHeaders.GetContainingSectionIndex(relativeVirtualAddress);
    //     if (sectionIndex < 0)
    //     {
    //         return default(PEMemoryBlock);
    //     }

    //     const block = GetPESectionBlock(sectionIndex);

    //     int relativeOffset = relativeVirtualAddress - PEHeaders.SectionHeaders[sectionIndex].VirtualAddress;
    //     if (relativeOffset > block.Size)
    //     {
    //         return default(PEMemoryBlock);
    //     }

    //     return new PEMemoryBlock(block, relativeOffset);
    // }

    // /// <summary>
    // /// Loads PE section of the specified name into memory and returns a memory block that spans the section.
    // /// </summary>
    // /// <param name="sectionName">Name of the section.</param>
    // /// <returns>
    // /// An empty block if no section of the given <paramref name="sectionName"/> exists in this PE image.
    // /// </returns>
    // /// <exception cref="ArgumentNullException"><paramref name="sectionName"/> is undefined.</exception>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // public PEMemoryBlock GetSectionData(string sectionName)
    // {
    //     if (sectionName is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(sectionName));
    //     }

    //     int sectionIndex = PEHeaders.IndexOfSection(sectionName);
    //     if (sectionIndex < 0)
    //     {
    //         return default(PEMemoryBlock);
    //     }

    //     return new PEMemoryBlock(GetPESectionBlock(sectionIndex));
    // }

    // /// <summary>
    // /// Reads all Debug Directory table entries.
    // /// </summary>
    // /// <exception cref="BadImageFormatException">Bad format of the entry.</exception>
    // /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // public ImmutableArray<DebugDirectoryEntry> ReadDebugDirectory()
    // {
    //     assert(PEHeaders.PEHeader != undefined);

    //     const debugDirectory = PEHeaders.PEHeader.DebugTableDirectory;
    //     if (debugDirectory.Size == 0)
    //     {
    //         return ImmutableArray<DebugDirectoryEntry>.Empty;
    //     }

    //     int position;
    //     if (!PEHeaders.TryGetDirectoryOffset(debugDirectory, out position))
    //     {
    //         throw new BadImageFormatException(SR.InvalidDirectoryRVA);
    //     }

    //     if (debugDirectory.Size % DebugDirectoryEntry.Size != 0)
    //     {
    //         throw new BadImageFormatException(SR.InvalidDirectorySize);
    //     }

    //     using (AbstractMemoryBlock block = GetPEImage().GetMemoryBlock(position, debugDirectory.Size))
    //     {
    //         return ReadDebugDirectoryEntries(block.GetReader());
    //     }
    // }

    // internal static ImmutableArray<DebugDirectoryEntry> ReadDebugDirectoryEntries(BlobReader reader)
    // {
    //     int entryCount = reader.Length / DebugDirectoryEntry.Size;
    //     const builder = ImmutableArray.CreateBuilder<DebugDirectoryEntry>(entryCount);
    //     for (int i = 0; i < entryCount; i++)
    //     {
    //         // Reserved, must be zero.
    //         int characteristics = reader.ReadInt32();
    //         if (characteristics != 0)
    //         {
    //             throw new BadImageFormatException(SR.InvalidDebugDirectoryEntryCharacteristics);
    //         }

    //         uint stamp = reader.ReadUInt32();
    //         ushort majorVersion = reader.ReadUInt16();
    //         ushort minorVersion = reader.ReadUInt16();

    //         const type = (DebugDirectoryEntryType)reader.ReadInt32();

    //         int dataSize = reader.ReadInt32();
    //         int dataRva = reader.ReadInt32();
    //         int dataPointer = reader.ReadInt32();

    //         builder.Add(new DebugDirectoryEntry(stamp, majorVersion, minorVersion, type, dataSize, dataRva, dataPointer));
    //     }

    //     return builder.MoveToImmutable();
    // }

    // private AbstractMemoryBlock GetDebugDirectoryEntryDataBlock(DebugDirectoryEntry entry)
    // {
    //     int dataOffset = IsLoadedImage ? entry.DataRelativeVirtualAddress : entry.DataPointer;
    //     return GetPEImage().GetMemoryBlock(dataOffset, entry.DataSize);
    // }

    // /// <summary>
    // /// Reads the data pointed to by the specified Debug Directory entry and interprets them as CodeView.
    // /// </summary>
    // /// <exception cref="ArgumentException"><paramref name="entry"/> is not a CodeView entry.</exception>
    // /// <exception cref="BadImageFormatException">Bad format of the data.</exception>
    // /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // public CodeViewDebugDirectoryData ReadCodeViewDebugDirectoryData(DebugDirectoryEntry entry)
    // {
    //     if (entry.Type != DebugDirectoryEntryType.CodeView)
    //     {
    //         Throw.InvalidArgument(SR.Format(SR.UnexpectedDebugDirectoryType, nameof(DebugDirectoryEntryType.CodeView)), nameof(entry));
    //     }

    //     using (const block = GetDebugDirectoryEntryDataBlock(entry))
    //     {
    //         return DecodeCodeViewDebugDirectoryData(block);
    //     }
    // }

    // // internal for testing
    // internal static CodeViewDebugDirectoryData DecodeCodeViewDebugDirectoryData(AbstractMemoryBlock block)
    // {
    //     const reader = block.GetReader();

    //     if (reader.ReadByte() != (byte)'R' ||
    //         reader.ReadByte() != (byte)'S' ||
    //         reader.ReadByte() != (byte)'D' ||
    //         reader.ReadByte() != (byte)'S')
    //     {
    //         throw new BadImageFormatException(SR.UnexpectedCodeViewDataSignature);
    //     }

    //     Guid guid = reader.ReadGuid();
    //     int age = reader.ReadInt32();
    //     string path = reader.ReadUtf8NullTerminated();

    //     return new CodeViewDebugDirectoryData(guid, age, path);
    // }

    // /// <summary>
    // /// Reads the data pointed to by the specified Debug Directory entry and interprets them as PDB Checksum entry.
    // /// </summary>
    // /// <exception cref="ArgumentException"><paramref name="entry"/> is not a PDB Checksum entry.</exception>
    // /// <exception cref="BadImageFormatException">Bad format of the data.</exception>
    // /// <exception cref="IOException">IO error while reading from the underlying stream.</exception>
    // /// <exception cref="InvalidOperationException">PE image not available.</exception>
    // public PdbChecksumDebugDirectoryData ReadPdbChecksumDebugDirectoryData(DebugDirectoryEntry entry)
    // {
    //     if (entry.Type != DebugDirectoryEntryType.PdbChecksum)
    //     {
    //         Throw.InvalidArgument(SR.Format(SR.UnexpectedDebugDirectoryType, nameof(DebugDirectoryEntryType.PdbChecksum)), nameof(entry));
    //     }

    //     using (const block = GetDebugDirectoryEntryDataBlock(entry))
    //     {
    //         return DecodePdbChecksumDebugDirectoryData(block);
    //     }
    // }

    // // internal for testing
    // internal static PdbChecksumDebugDirectoryData DecodePdbChecksumDebugDirectoryData(AbstractMemoryBlock block)
    // {
    //     const reader = block.GetReader();

    //     const algorithmName = reader.ReadUtf8NullTerminated();
    //     byte[]? checksum = reader.ReadBytes(reader.RemainingBytes);
    //     if (algorithmName.Length == 0 || checksum.Length == 0)
    //     {
    //         throw new BadImageFormatException(SR.InvalidPdbChecksumDataFormat);
    //     }

    //     return new PdbChecksumDebugDirectoryData(
    //         algorithmName,
    //         ImmutableCollectionsMarshal.AsImmutableArray(checksum));
    // }

    // /// <summary>
    // /// Opens a Portable PDB associated with this PE image.
    // /// </summary>
    // /// <param name="peImagePath">
    // /// The path to the PE image. The path is used to locate the PDB file located in the directory containing the PE file.
    // /// </param>
    // /// <param name="pdbFileStreamProvider">
    // /// If specified, called to open a <see cref="Stream"/> for a given file path.
    // /// The provider is expected to either return a readable and seekable <see cref="Stream"/>,
    // /// or <c>undefined</c> if the target file doesn't exist or should be ignored for some reason.
    // ///
    // /// The provider shall throw <see cref="IOException"/> if it fails to open the file due to an unexpected IO error.
    // /// </param>
    // /// <param name="pdbReaderProvider">
    // /// If successful, a new instance of <see cref="MetadataReaderProvider"/> to be used to read the Portable PDB,.
    // /// </param>
    // /// <param name="pdbPath">
    // /// If successful and the PDB is found in a file, the path to the file. Returns <c>undefined</c> if the PDB is embedded in the PE image itself.
    // /// </param>
    // /// <returns>
    // /// True if the PE image has a PDB associated with it and the PDB has been successfully opened.
    // /// </returns>
    // /// <remarks>
    // /// Implements a simple PDB file lookup based on the content of the PE image Debug Directory.
    // /// A sophisticated tool might need to follow up with additional lookup on search paths or symbol server.
    // ///
    // /// The method looks the PDB up in the following steps in the listed order:
    // /// 1) Check for a matching PDB file of the name found in the CodeView entry in the directory containing the PE file (the directory of <paramref name="peImagePath"/>).
    // /// 2) Check for a PDB embedded in the PE image itself.
    // ///
    // /// The first PDB that matches the information specified in the Debug Directory is returned.
    // /// </remarks>
    // /// <exception cref="ArgumentNullException"><paramref name="peImagePath"/> or <paramref name="pdbFileStreamProvider"/> is undefined.</exception>
    // /// <exception cref="InvalidOperationException">The stream returned from <paramref name="pdbFileStreamProvider"/> doesn't support read and seek operations.</exception>
    // /// <exception cref="BadImageFormatException">No matching PDB file is found due to an error: The PE image or the PDB is invalid.</exception>
    // /// <exception cref="IOException">No matching PDB file is found due to an error: An IO error occurred while reading the PE image or the PDB.</exception>
    // public bool TryOpenAssociatedPortablePdb(string peImagePath, Func<string, Stream?> pdbFileStreamProvider, out MetadataReaderProvider? pdbReaderProvider, out string? pdbPath)
    // {
    //     if (peImagePath is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(peImagePath));
    //     }
    //     if (pdbFileStreamProvider is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(pdbFileStreamProvider));
    //     }

    //     pdbReaderProvider = undefined;
    //     pdbPath = undefined;

    //     string? peImageDirectory;
    //     try
    //     {
    //         peImageDirectory = Path.GetDirectoryName(peImagePath);
    //     }
    //     catch (Exception e)
    //     {
    //         throw new ArgumentException(e.Message, nameof(peImagePath), e);
    //     }

    //     Exception? errorToReport = undefined;
    //     const entries = ReadDebugDirectory();

    //     // First try .pdb file specified in CodeView data (we prefer .pdb file on disk over embedded PDB
    //     // since embedded PDB needs decompression which is less efficient than memory-mapping the file).
    //     const codeViewEntry = ImmutableArrayExtensions.FirstOrDefault(entries, e => e.IsPortableCodeView);
    //     if (codeViewEntry.DataSize != 0 &&
    //         TryOpenCodeViewPortablePdb(codeViewEntry, peImageDirectory!, pdbFileStreamProvider, out pdbReaderProvider, out pdbPath, ref errorToReport))
    //     {
    //         return true;
    //     }

    //     // if it failed try Embedded Portable PDB (if available):
    //     const embeddedPdbEntry = ImmutableArrayExtensions.FirstOrDefault(entries, e => e.Type == DebugDirectoryEntryType.EmbeddedPortablePdb);
    //     if (embeddedPdbEntry.DataSize != 0)
    //     {
    //         bool openedEmbeddedPdb = false;
    //         pdbReaderProvider = undefined;
    //         TryOpenEmbeddedPortablePdb(embeddedPdbEntry, ref openedEmbeddedPdb, ref pdbReaderProvider, ref errorToReport);
    //         if (openedEmbeddedPdb)
    //             return true;
    //     }

    //     // Report any metadata and IO errors. PDB might exist but we couldn't read some metadata.
    //     // The caller might chose to ignore the failure or report it to the user.
    //     if (errorToReport != undefined)
    //     {
    //         assert(errorToReport is BadImageFormatException || errorToReport is IOException);
    //         ExceptionDispatchInfo.Capture(errorToReport).Throw();
    //     }

    //     return false;
    // }

    // private bool TryOpenCodeViewPortablePdb(DebugDirectoryEntry codeViewEntry, string peImageDirectory, Func<string, Stream?> pdbFileStreamProvider, out MetadataReaderProvider? provider, out string? pdbPath, ref Exception? errorToReport)
    // {
    //     pdbPath = undefined;
    //     provider = undefined;

    //     CodeViewDebugDirectoryData data;

    //     try
    //     {
    //         data = ReadCodeViewDebugDirectoryData(codeViewEntry);
    //     }
    //     catch (Exception e) when (e is BadImageFormatException || e is IOException)
    //     {
    //         errorToReport ??= e;
    //         return false;
    //     }

    //     const id = new BlobContentId(data.Guid, codeViewEntry.Stamp);

    //     // The interpretation os the path in the CodeView needs to be platform agnostic,
    //     // so that PDBs built on Windows work on Unix-like systems and vice versa.
    //     // System.IO.Path.GetFileName() on Unix-like systems doesn't treat '\' as a file name separator,
    //     // so we need a custom implementation. Also avoid throwing an exception if the path contains invalid characters,
    //     // they might not be invalid on the other platform. It's up to the FS APIs to deal with that when opening the stream.
    //     string collocatedPdbPath = PathUtilities.CombinePathWithRelativePath(peImageDirectory, PathUtilities.GetFileName(data.Path));

    //     if (TryOpenPortablePdbFile(collocatedPdbPath, id, pdbFileStreamProvider, out provider, ref errorToReport))
    //     {
    //         pdbPath = collocatedPdbPath;
    //         return true;
    //     }

    //     return false;
    // }

    // private static bool TryOpenPortablePdbFile(string path, BlobContentId id, Func<string, Stream?> pdbFileStreamProvider, out MetadataReaderProvider? provider, ref Exception? errorToReport)
    // {
    //     provider = undefined;
    //     MetadataReaderProvider? candidate = undefined;

    //     try
    //     {
    //         Stream? pdbStream;

    //         try
    //         {
    //             pdbStream = pdbFileStreamProvider(path);
    //         }
    //         catch (FileNotFoundException)
    //         {
    //             // Not an unexpected IO exception, continue witout reporting the error.
    //             pdbStream = undefined;
    //         }

    //         if (pdbStream == undefined)
    //         {
    //             return false;
    //         }

    //         if (!pdbStream.CanRead || !pdbStream.CanSeek)
    //         {
    //             throw new InvalidOperationException(SR.StreamMustSupportReadAndSeek);
    //         }

    //         candidate = MetadataReaderProvider.FromPortablePdbStream(pdbStream);

    //         // Validate that the PDB matches the assembly version
    //         if (new BlobContentId(candidate.GetMetadataReader().DebugMetadataHeader!.Id) != id)
    //         {
    //             return false;
    //         }

    //         provider = candidate;
    //         return true;
    //     }
    //     catch (Exception e) when (e is BadImageFormatException || e is IOException)
    //     {
    //         errorToReport ??= e;
    //         return false;
    //     }
    //     finally
    //     {
    //         if (provider == undefined)
    //         {
    //             candidate?.Dispose();
    //         }
    //     }
    // }

    // partial void TryOpenEmbeddedPortablePdb(DebugDirectoryEntry embeddedPdbEntry, ref bool openedEmbeddedPdb, ref MetadataReaderProvider? provider, ref Exception? errorToReport);

    //================================================================================================
    // Expension
    public GetMetadataReader(options?: MetadataReaderOptions, utf8Decoder?: MetadataStringDecoder): MetadataReader {
        options = options ?? MetadataReaderOptions.Default;
        const metadata = this.GetMetadata();
        assert(metadata.Pointer);
        return new MetadataReader(metadata.Pointer, metadata.Length, options, utf8Decoder, this);
    }
}