import assert from "assert";
import { Throw } from "System";
import { MemoryBlock } from "System.Reflection.Internal";
import {
    AssemblyReferenceHandleCollection,
    AssemblyFileHandleCollection,
} from "./TypeSystem/HandleCollections.TypeSystem";
import {
    TypeDefinitionHandle,
    MethodDefinitionHandle,
} from "./TypeSystem/Handles.TypeSystem";

import {
    MetadataReaderOptions,
    MetadataStringDecoder,
    BlobReader,
    MetadataKind,
    DebugMetadataHeader,
} from "System.Reflection.Metadata";

import {
    StringHeap,
    GuidHeap,
    BlobHeap,
    StreamHeader,
    UserStringHeap,
    FileTableReader,
    TableIndex,
    HeapSizes,
    MetadataStreamKind,
    COR20Constants,
    TokenTypeIds,
    TableMask,
} from "System.Reflection.Metadata.Ecma335";

export class MetadataReader {
    // public readonly NamespaceCache: NamespaceCache;
    public readonly Block: MemoryBlock;

    // // A row id of "mscorlib" AssemblyRef in a WinMD file (each WinMD file must have such a reference).
    // public readonly WinMDMscorlibRef: number;

    // Keeps the underlying memory alive.
    private readonly _memoryOwnerObj?: object;

    private readonly _options: MetadataReaderOptions;
    private _lazyNestedTypesMap?: Map<TypeDefinitionHandle, Array<TypeDefinitionHandle>>;

    // #region Constructors

    // /// <summary>
    // /// Creates a metadata reader from the metadata stored at the given memory location.
    // /// </summary>
    // /// <remarks>
    // /// The memory is owned by the caller and it must be kept memory alive and unmodified throughout the lifetime of the <see cref="MetadataReader"/>.
    // /// </remarks>
    // public unsafe MetadataReader(byte* metadata, int length)
    //     : this(metadata, length, MetadataReaderOptions.Default, utf8Decoder: undefined, memoryOwner: undefined)
    // {
    // }

    // /// <summary>
    // /// Creates a metadata reader from the metadata stored at the given memory location.
    // /// </summary>
    // /// <remarks>
    // /// The memory is owned by the caller and it must be kept memory alive and unmodified throughout the lifetime of the <see cref="MetadataReader"/>.
    // /// Use <see cref="PEReaderExtensions.GetMetadataReader(PortableExecutable.PEReader, MetadataReaderOptions)"/> to obtain
    // /// metadata from a PE image.
    // /// </remarks>
    // public unsafe MetadataReader(byte* metadata, int length, MetadataReaderOptions options)
    //     : this(metadata, length, options, utf8Decoder: undefined, memoryOwner: undefined)
    // {
    // }

    // /// <summary>
    // /// Creates a metadata reader from the metadata stored at the given memory location.
    // /// </summary>
    // /// <remarks>
    // /// The memory is owned by the caller and it must be kept memory alive and unmodified throughout the lifetime of the <see cref="MetadataReader"/>.
    // /// Use <see cref="PEReaderExtensions.GetMetadataReader(PortableExecutable.PEReader, MetadataReaderOptions, MetadataStringDecoder)"/> to obtain
    // /// metadata from a PE image.
    // /// </remarks>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="length"/> is not positive.</exception>
    // /// <exception cref="ArgumentNullException"><paramref name="metadata"/> is undefined.</exception>
    // /// <exception cref="ArgumentException">The encoding of <paramref name="utf8Decoder"/> is not <see cref="UTF8Encoding"/>.</exception>
    // /// <exception cref="PlatformNotSupportedException">The current platform is big-endian.</exception>
    // /// <exception cref="BadImageFormatException">Bad metadata header.</exception>
    // public unsafe MetadataReader(byte* metadata, int length, MetadataReaderOptions options, MetadataStringDecoder? utf8Decoder)
    //     : this(metadata, length, options, utf8Decoder, memoryOwner: undefined)
    // {
    // }

    public constructor(metadata: Uint8Array, length: number, options: MetadataReaderOptions, utf8Decoder?: MetadataStringDecoder, memoryOwner?: object) {
        // Do not throw here when length is 0. We'll throw BadImageFormatException later on, so that the caller doesn't need to
        // worry about the image (stream) being empty and can handle all image errors by catching BadImageFormatException.
        if (length < 0) {
            Throw.ArgumentOutOfRange('length');
        }

        if (metadata == undefined) {
            Throw.ArgumentNull('metadata');
        }

        utf8Decoder ??= MetadataStringDecoder.DefaultUTF8;

        this.Block = new MemoryBlock(metadata, length);

        this._memoryOwnerObj = memoryOwner;
        this._options = options;
        this.UTF8Decoder = utf8Decoder;

        const headerReader = BlobReader.FromMemoryBlock(this.Block);
        this._versionString = this.ReadMetadataHeader(headerReader);
        this._metadataKind = this.GetMetadataKind(this._versionString);
        const streamHeaders = MetadataReader.ReadStreamHeaders(headerReader);

        // storage header and stream headers:
        const { metadataStreamKind, metadataTableStream, standalonePdbStream } = this.InitializeStreamReaders(this.Block, streamHeaders);
        this._metadataStreamKind = metadataStreamKind;

        let externalTableRowCountsOpt: Array<number> | undefined;
        if (standalonePdbStream.Length > 0) {
            const pdbStreamOffset = (standalonePdbStream.Pointer.byteOffset - metadata.byteOffset);
            const pdbResult = MetadataReader.ReadStandalonePortablePdbStream(standalonePdbStream, pdbStreamOffset);
            externalTableRowCountsOpt = pdbResult.externalTableRowCounts;
            this._debugMetadataHeader = pdbResult.debugMetadataHeader;
        }
        else {
            externalTableRowCountsOpt = undefined;
        }

        const tableReader = BlobReader.FromMemoryBlock(metadataTableStream);



        const { heapSizes, metadataTableRowCounts, sortedTables } = this.ReadMetadataTableHeader(tableReader);
        this._sortedTables = sortedTables;
        this.InitializeTableReaders(tableReader.GetMemoryBlockAt(0, tableReader.RemainingBytes), heapSizes, metadataTableRowCounts, externalTableRowCountsOpt);

        //     // This previously could occur in obfuscated assemblies but a check was added to prevent
        //     // it getting to this point
        //     assert(AssemblyTable.NumberOfRows <= 1);

        //     // Although the specification states that the module table will have exactly one row,
        //     // the native metadata reader would successfully read files containing more than one row.
        //     // Such files exist in the wild and may be produced by obfuscators.
        //     if (pdbStream.Length == 0 && ModuleTable.NumberOfRows < 1)
        //     {
        //         throw new BadImageFormatException('.Format('.ModuleTableInvalidNumberOfRows, this.ModuleTable.NumberOfRows));
        //     }

        //     //  read
        //     NamespaceCache = new NamespaceCache(this);

        //     if (_metadataKind != MetadataKind.Ecma335)
        //     {
        //         WinMDMscorlibRef = FindMscorlibAssemblyRefNoProjection();
        //     }
    }

    // #endregion

    // #region Metadata Headers

    private readonly _versionString: string;
    private readonly _metadataKind: MetadataKind;
    private readonly _metadataStreamKind: MetadataStreamKind;
    private readonly _debugMetadataHeader?: DebugMetadataHeader;

    public StringHeap!: StringHeap;
    public BlobHeap!: BlobHeap;
    public GuidHeap!: GuidHeap;
    public UserStringHeap!: UserStringHeap;

    /// <summary>
    /// True if the metadata stream has minimal delta format. Used for EnC.
    /// </summary>
    /// <remarks>
    /// The metadata stream has minimal delta format if "#JTD" stream is present.
    /// Minimal delta format uses large size (4B) when encoding table/heap references.
    /// The heaps in minimal delta only contain data of the delta,
    /// there is no padding at the beginning of the heaps that would align them
    /// with the original full metadata heaps.
    /// </remarks>
    public IsMinimalDelta!: boolean;

    /// <summary>
    /// Looks like this function reads beginning of the header described in
    /// ECMA-335 24.2.1 Metadata root
    /// </summary>
    private ReadMetadataHeader(memReader: BlobReader): string {
        if (memReader.RemainingBytes < COR20Constants.MinimumSizeofMetadataHeader) {
            Throw.BadImageFormatException('MetadataHeaderTooSmall');
        }

        const signature = memReader.ReadUInt32();
        if (signature != COR20Constants.COR20MetadataSignature) {
            Throw.BadImageFormatException('MetadataSignature');
        }

        // major version
        memReader.ReadUInt16();

        // minor version
        memReader.ReadUInt16();

        // reserved:
        memReader.ReadUInt32();

        const versionStringSize = memReader.ReadInt32();
        if (memReader.RemainingBytes < versionStringSize) {
            Throw.BadImageFormatException('NotEnoughSpaceForVersionString');
        }

        const versionString = memReader.GetMemoryBlockAt(0, versionStringSize).PeekUtf8NullTerminated(0, undefined, this.UTF8Decoder, 0);
        memReader.Offset += versionStringSize;
        return versionString;
    }

    private GetMetadataKind(versionString: string): MetadataKind {
        // Treat metadata as CLI raw metadata if the client doesn't want to see projections.
        if ((this._options & MetadataReaderOptions.ApplyWindowsRuntimeProjections) == 0) {
            return MetadataKind.Ecma335;
        }

        if (!versionString.includes("WindowsRuntime")) {
            return MetadataKind.Ecma335;
        }
        else if (versionString.includes("CLR")) {
            return MetadataKind.ManagedWindowsMetadata;
        }
        else {
            return MetadataKind.WindowsMetadata;
        }
    }

    /// <summary>
    /// Reads stream headers described in ECMA-335 24.2.2 Stream header
    /// </summary>
    private static ReadStreamHeaders(memReader: BlobReader): StreamHeader[] {
        // storage header:
        memReader.ReadUInt16();
        const streamCount = memReader.ReadInt16();

        const streamHeaders = Array<StreamHeader>(streamCount);
        for (let i = 0; i < streamCount; i++) {
            if (memReader.RemainingBytes < COR20Constants.MinimumSizeofStreamHeader) {
                Throw.BadImageFormatException('StreamHeaderTooSmall');
            }

            streamHeaders[i] = new StreamHeader();
            streamHeaders[i].Offset = memReader.ReadUInt32();
            streamHeaders[i].Size = memReader.ReadInt32();
            streamHeaders[i].Name = memReader.ReadUtf8NullTerminated();
            const aligned = memReader.TryAlign(4);

            if (!aligned || memReader.RemainingBytes == 0) {
                Throw.BadImageFormatException('NotEnoughSpaceForStreamHeaderName');
            }
        }

        return streamHeaders;
    }

    private InitializeStreamReaders(
        metadataRoot: MemoryBlock,
        streamHeaders: StreamHeader[]): {
            metadataStreamKind: MetadataStreamKind,
            metadataTableStream: MemoryBlock,
            standalonePdbStream: MemoryBlock
        } {
        let metadataTableStream: MemoryBlock | undefined = undefined;
        let standalonePdbStream: MemoryBlock | undefined = undefined;
        let metadataStreamKind = MetadataStreamKind.Illegal;

        for (const streamHeader of streamHeaders) {
            switch (streamHeader.Name) {
                case COR20Constants.StringStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('NotEnoughSpaceForStringStream');
                    }

                    this.StringHeap = new StringHeap(metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size), this._metadataKind);
                    break;

                case COR20Constants.BlobStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('NotEnoughSpaceForBlobStream');
                    }

                    this.BlobHeap = new BlobHeap(metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size), this._metadataKind);
                    break;

                case COR20Constants.GUIDStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('.NotEnoughSpaceForGUIDStream');
                    }

                    this.GuidHeap = new GuidHeap(metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size));
                    break;

                case COR20Constants.UserStringStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('.NotEnoughSpaceForBlobStream');
                    }

                    this.UserStringHeap = new UserStringHeap(metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size));
                    break;

                case COR20Constants.CompressedMetadataTableStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('.NotEnoughSpaceForMetadataStream');
                    }

                    metadataStreamKind = MetadataStreamKind.Compressed;
                    metadataTableStream = metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size);
                    break;

                case COR20Constants.UncompressedMetadataTableStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('.NotEnoughSpaceForMetadataStream');
                    }

                    metadataStreamKind = MetadataStreamKind.Uncompressed;
                    metadataTableStream = metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size);
                    break;

                case COR20Constants.MinimalDeltaMetadataTableStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('.NotEnoughSpaceForMetadataStream');
                    }

                    // the content of the stream is ignored
                    this.IsMinimalDelta = true;
                    break;

                case COR20Constants.StandalonePdbStreamName:
                    if (metadataRoot.Length < streamHeader.Offset + streamHeader.Size) {
                        Throw.BadImageFormatException('.NotEnoughSpaceForMetadataStream');
                    }

                    standalonePdbStream = metadataRoot.GetMemoryBlockAt(streamHeader.Offset, streamHeader.Size);
                    break;

                default:
                    // Skip unknown streams. Some obfuscators insert invalid streams.
                    continue;
            }
        }

        if (this.IsMinimalDelta && metadataStreamKind != MetadataStreamKind.Uncompressed) {
            Throw.BadImageFormatException('.InvalidMetadataStreamFormat');
        }

        assert(metadataTableStream != undefined);
        standalonePdbStream ??= new MemoryBlock(Uint8Array.from([]), 0);
        return { metadataStreamKind, metadataTableStream, standalonePdbStream };
    }

    // #endregion

    // #region Tables and Heaps

    private readonly _sortedTables: TableMask;

    /// <summary>
    /// A row count for each possible table. May be indexed by <see cref="TableIndex"/>.
    /// </summary>
    public TableRowCounts?: number[] = undefined!;

    // public ModuleTableReader ModuleTable;
    // public TypeRefTableReader TypeRefTable;
    // public TypeDefTableReader TypeDefTable;
    // public FieldPtrTableReader FieldPtrTable;
    // public FieldTableReader FieldTable;
    // public MethodPtrTableReader MethodPtrTable;
    // public MethodTableReader MethodDefTable;
    // public ParamPtrTableReader ParamPtrTable;
    // public ParamTableReader ParamTable;
    // public InterfaceImplTableReader InterfaceImplTable;
    // public MemberRefTableReader MemberRefTable;
    // public ConstantTableReader ConstantTable;
    // public CustomAttributeTableReader CustomAttributeTable;
    // public FieldMarshalTableReader FieldMarshalTable;
    // public DeclSecurityTableReader DeclSecurityTable;
    // public ClassLayoutTableReader ClassLayoutTable;
    // public FieldLayoutTableReader FieldLayoutTable;
    // public StandAloneSigTableReader StandAloneSigTable;
    // public EventMapTableReader EventMapTable;
    // public EventPtrTableReader EventPtrTable;
    // public EventTableReader EventTable;
    // public PropertyMapTableReader PropertyMapTable;
    // public PropertyPtrTableReader PropertyPtrTable;
    // public PropertyTableReader PropertyTable;
    // public MethodSemanticsTableReader MethodSemanticsTable;
    // public MethodImplTableReader MethodImplTable;
    // public ModuleRefTableReader ModuleRefTable;
    // public TypeSpecTableReader TypeSpecTable;
    // public ImplMapTableReader ImplMapTable;
    // public FieldRVATableReader FieldRvaTable;
    // public EnCLogTableReader EncLogTable;
    // public EnCMapTableReader EncMapTable;
    // public AssemblyTableReader AssemblyTable;
    // public AssemblyProcessorTableReader AssemblyProcessorTable;              // unused
    // public AssemblyOSTableReader AssemblyOSTable;                            // unused
    // public AssemblyRefTableReader AssemblyRefTable;
    // public AssemblyRefProcessorTableReader AssemblyRefProcessorTable;        // unused
    // public AssemblyRefOSTableReader AssemblyRefOSTable;                      // unused
    public FileTable!: FileTableReader;
    // public ExportedTypeTableReader ExportedTypeTable;
    // public ManifestResourceTableReader ManifestResourceTable;
    // public NestedClassTableReader NestedClassTable;
    // public GenericParamTableReader GenericParamTable;
    // public MethodSpecTableReader MethodSpecTable;
    // public GenericParamConstraintTableReader GenericParamConstraintTable;

    // // debug tables
    // public DocumentTableReader DocumentTable;
    // public MethodDebugInformationTableReader MethodDebugInformationTable;
    // public LocalScopeTableReader LocalScopeTable;
    // public LocalVariableTableReader LocalVariableTable;
    // public LocalConstantTableReader LocalConstantTable;
    // public ImportScopeTableReader ImportScopeTable;
    // public StateMachineMethodTableReader StateMachineMethodTable;
    // public CustomDebugInformationTableReader CustomDebugInformationTable;

    private ReadMetadataTableHeader(reader: BlobReader): { heapSizes: HeapSizes, metadataTableRowCounts: Array<number>, sortedTables: TableMask } {
        throw new Error("Not implemented");
        // if (reader.RemainingBytes < MetadataStreamConstants.SizeOfMetadataTableHeader)
        // {
        //     throw new BadImageFormatException('.MetadataTableHeaderTooSmall);
        // }

        // // reserved (shall be ignored):
        // reader.ReadUInt32();

        // // major version (shall be ignored):
        // reader.ReadByte();

        // // minor version (shall be ignored):
        // reader.ReadByte();

        // // heap sizes:
        // heapSizes = (HeapSizes)reader.ReadByte();

        // // reserved (shall be ignored):
        // reader.ReadByte();

        // ulong presentTables = reader.ReadUInt64();
        // sortedTables = (TableMask)reader.ReadUInt64();

        // // According to ECMA-335, MajorVersion and MinorVersion have fixed values and,
        // // based on recommendation in 24.1 Fixed fields: When writing these fields it
        // // is best that they be set to the value indicated, on reading they should be ignored.
        // // We will not be checking version values. We will continue checking that the set of
        // // present tables is within the set we understand.

        // ulong validTables = (ulong)(TableMask.TypeSystemTables | TableMask.DebugTables);

        // if ((presentTables & ~validTables) != 0)
        // {
        //     throw new BadImageFormatException('.Format('.UnknownTables, presentTables));
        // }

        // if (_metadataStreamKind == MetadataStreamKind.Compressed)
        // {
        //     // In general Ptr tables and EnC tables are not allowed in a compressed stream.
        //     // However when asked for a snapshot of the current metadata after an EnC change has been applied
        //     // the CLR includes the EnCLog table into the snapshot. We need to be able to read the image,
        //     // so we'll allow the table here but pretend it's empty later.
        //     if ((presentTables & (ulong)(TableMask.PtrTables | TableMask.EnCMap)) != 0)
        //     {
        //         throw new BadImageFormatException('.IllegalTablesInCompressedMetadataStream);
        //     }
        // }

        // metadataTableRowCounts = ReadMetadataTableRowCounts(ref reader, presentTables);

        // if ((heapSizes & HeapSizes.ExtraData) == HeapSizes.ExtraData)
        // {
        //     // Skip "extra data" used by some obfuscators. Although it is not mentioned in the CLI spec,
        //     // it is honored by the native metadata reader.
        //     reader.ReadUInt32();
        // }
    }

    private static ReadMetadataTableRowCounts(memReader: BlobReader, presentTableMask: number): Array<number> {
        // ulong currentTableBit = 1;

        // const rowCounts = new int[MetadataTokens.TableCount];
        // for (int i = 0; i < rowCounts.Length; i++)
        // {
        //     if ((presentTableMask & currentTableBit) != 0)
        //     {
        //         if (memReader.RemainingBytes < sizeof(uint))
        //         {
        //             throw new BadImageFormatException('.TableRowCountSpaceTooSmall);
        //         }

        //         uint rowCount = memReader.ReadUInt32();
        //         if (rowCount > TokenTypeIds.RIDMask)
        //         {
        //             throw new BadImageFormatException('.Format('.InvalidRowCount, rowCount));
        //         }

        //         rowCounts[i] = rowCount;
        //     }

        //     currentTableBit <<= 1;
        // }

        // return rowCounts;
        throw new Error("Not implemented");
    }

    // public for testing
    public static ReadStandalonePortablePdbStream(pdbStreamBlock: MemoryBlock, pdbStreamOffset: number): { debugMetadataHeader: DebugMetadataHeader, externalTableRowCounts: Array<number> } {
        const reader = BlobReader.FromMemoryBlock(pdbStreamBlock);

        const PdbIdSize = 20;
        const pdbId = reader.ReadBytes(PdbIdSize);

        // ECMA-335 15.4.1.2:
        // The entry point to an application shall be static.
        // This entry point method can be a global method or it can appear inside a type.
        // The entry point method shall either accept no arguments or a vector of strings.
        // The return type of the entry point method shall be void, int32, or unsigned int32.
        // The entry point method cannot be defined in a generic class.
        const entryPointToken = reader.ReadUInt32();
        const entryPointRowId = (entryPointToken & TokenTypeIds.RIDMask);
        if (entryPointToken != 0 && ((entryPointToken & TokenTypeIds.TypeMask) != TokenTypeIds.MethodDef || entryPointRowId == 0)) {
            Throw.BadImageFormatException(`InvalidEntryPointToken ${entryPointToken}`);
        }

        const externalTableMask = reader.ReadUInt64();

        // EnC & Ptr tables can't be referenced from standalone PDB metadata:
        const validTables = TableMask.ValidPortablePdbExternalTables;

        if ((externalTableMask & ~validTables) != 0) {
            Throw.BadImageFormatException(`UnknownTables ${externalTableMask}`);
        }

        const externalTableRowCounts = this.ReadMetadataTableRowCounts(reader, externalTableMask);

        const debugMetadataHeader = new DebugMetadataHeader(
            pdbId,
            MethodDefinitionHandle.FromRowId(entryPointRowId),
            pdbStreamOffset);

        return { debugMetadataHeader, externalTableRowCounts };
    }

    private static readonly SmallIndexSize = 2;
    private static readonly LargeIndexSize = 4;

    // private int GetReferenceSize(int[] rowCounts, TableIndex index)
    // {
    //     return (rowCounts[index] < MetadataStreamConstants.LargeTableRowCount && !IsMinimalDelta) ? SmallIndexSize : LargeIndexSize;
    // }

    private InitializeTableReaders(metadataTablesMemoryBlock: MemoryBlock, heapSizes: HeapSizes, rowCounts: number[], externalRowCountsOpt?: number[]) {
        //     // Size of reference tags in each table.
        //     this.TableRowCounts = rowCounts;

        //     // TODO (https://github.com/dotnet/runtime/issues/14721):
        //     // Shouldn't XxxPtr table be always the same size or smaller than the corresponding Xxx table?

        //     // Compute ref sizes for tables that can have pointer tables
        //     int fieldRefSizeSorted = GetReferenceSize(rowCounts, TableIndex.FieldPtr) > SmallIndexSize ? LargeIndexSize : GetReferenceSize(rowCounts, TableIndex.Field);
        //     int methodRefSizeSorted = GetReferenceSize(rowCounts, TableIndex.MethodPtr) > SmallIndexSize ? LargeIndexSize : GetReferenceSize(rowCounts, TableIndex.MethodDef);
        //     int paramRefSizeSorted = GetReferenceSize(rowCounts, TableIndex.ParamPtr) > SmallIndexSize ? LargeIndexSize : GetReferenceSize(rowCounts, TableIndex.Param);
        //     int eventRefSizeSorted = GetReferenceSize(rowCounts, TableIndex.EventPtr) > SmallIndexSize ? LargeIndexSize : GetReferenceSize(rowCounts, TableIndex.Event);
        //     int propertyRefSizeSorted = GetReferenceSize(rowCounts, TableIndex.PropertyPtr) > SmallIndexSize ? LargeIndexSize : GetReferenceSize(rowCounts, TableIndex.Property);

        //     // Compute the coded token ref sizes
        //     int typeDefOrRefRefSize = ComputeCodedTokenSize(TypeDefOrRefTag.LargeRowSize, rowCounts, TypeDefOrRefTag.TablesReferenced);
        //     int hasConstantRefSize = ComputeCodedTokenSize(HasConstantTag.LargeRowSize, rowCounts, HasConstantTag.TablesReferenced);
        //     int hasCustomAttributeRefSize = ComputeCodedTokenSize(HasCustomAttributeTag.LargeRowSize, rowCounts, HasCustomAttributeTag.TablesReferenced);
        //     int hasFieldMarshalRefSize = ComputeCodedTokenSize(HasFieldMarshalTag.LargeRowSize, rowCounts, HasFieldMarshalTag.TablesReferenced);
        //     int hasDeclSecurityRefSize = ComputeCodedTokenSize(HasDeclSecurityTag.LargeRowSize, rowCounts, HasDeclSecurityTag.TablesReferenced);
        //     int memberRefParentRefSize = ComputeCodedTokenSize(MemberRefParentTag.LargeRowSize, rowCounts, MemberRefParentTag.TablesReferenced);
        //     int hasSemanticsRefSize = ComputeCodedTokenSize(HasSemanticsTag.LargeRowSize, rowCounts, HasSemanticsTag.TablesReferenced);
        //     int methodDefOrRefRefSize = ComputeCodedTokenSize(MethodDefOrRefTag.LargeRowSize, rowCounts, MethodDefOrRefTag.TablesReferenced);
        //     int memberForwardedRefSize = ComputeCodedTokenSize(MemberForwardedTag.LargeRowSize, rowCounts, MemberForwardedTag.TablesReferenced);
        //     int implementationRefSize = ComputeCodedTokenSize(ImplementationTag.LargeRowSize, rowCounts, ImplementationTag.TablesReferenced);
        //     int customAttributeTypeRefSize = ComputeCodedTokenSize(CustomAttributeTypeTag.LargeRowSize, rowCounts, CustomAttributeTypeTag.TablesReferenced);
        //     int resolutionScopeRefSize = ComputeCodedTokenSize(ResolutionScopeTag.LargeRowSize, rowCounts, ResolutionScopeTag.TablesReferenced);
        //     int typeOrMethodDefRefSize = ComputeCodedTokenSize(TypeOrMethodDefTag.LargeRowSize, rowCounts, TypeOrMethodDefTag.TablesReferenced);

        //     // Compute HeapRef Sizes
        const stringHeapRefSize = (heapSizes & HeapSizes.StringHeapLarge) == HeapSizes.StringHeapLarge ? MetadataReader.LargeIndexSize : MetadataReader.SmallIndexSize;
        const guidHeapRefSize = (heapSizes & HeapSizes.GuidHeapLarge) == HeapSizes.GuidHeapLarge ? MetadataReader.LargeIndexSize : MetadataReader.SmallIndexSize;
        const blobHeapRefSize = (heapSizes & HeapSizes.BlobHeapLarge) == HeapSizes.BlobHeapLarge ? MetadataReader.LargeIndexSize : MetadataReader.SmallIndexSize;

        // Populate the Table blocks
        let totalRequiredSize = 0;
        //     this.ModuleTable = new ModuleTableReader(rowCounts[TableIndex.Module], stringHeapRefSize, guidHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ModuleTable.Block.Length;

        //     this.TypeRefTable = new TypeRefTableReader(rowCounts[TableIndex.TypeRef], resolutionScopeRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.TypeRefTable.Block.Length;

        //     this.TypeDefTable = new TypeDefTableReader(rowCounts[TableIndex.TypeDef], fieldRefSizeSorted, methodRefSizeSorted, typeDefOrRefRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.TypeDefTable.Block.Length;

        //     this.FieldPtrTable = new FieldPtrTableReader(rowCounts[TableIndex.FieldPtr], GetReferenceSize(rowCounts, TableIndex.Field), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.FieldPtrTable.Block.Length;

        //     this.FieldTable = new FieldTableReader(rowCounts[TableIndex.Field], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.FieldTable.Block.Length;

        //     this.MethodPtrTable = new MethodPtrTableReader(rowCounts[TableIndex.MethodPtr], GetReferenceSize(rowCounts, TableIndex.MethodDef), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MethodPtrTable.Block.Length;

        //     this.MethodDefTable = new MethodTableReader(rowCounts[TableIndex.MethodDef], paramRefSizeSorted, stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MethodDefTable.Block.Length;

        //     this.ParamPtrTable = new ParamPtrTableReader(rowCounts[TableIndex.ParamPtr], GetReferenceSize(rowCounts, TableIndex.Param), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ParamPtrTable.Block.Length;

        //     this.ParamTable = new ParamTableReader(rowCounts[TableIndex.Param], stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ParamTable.Block.Length;

        //     this.InterfaceImplTable = new InterfaceImplTableReader(rowCounts[TableIndex.InterfaceImpl], IsDeclaredSorted(TableMask.InterfaceImpl), GetReferenceSize(rowCounts, TableIndex.TypeDef), typeDefOrRefRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.InterfaceImplTable.Block.Length;

        //     this.MemberRefTable = new MemberRefTableReader(rowCounts[TableIndex.MemberRef], memberRefParentRefSize, stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MemberRefTable.Block.Length;

        //     this.ConstantTable = new ConstantTableReader(rowCounts[TableIndex.Constant], IsDeclaredSorted(TableMask.Constant), hasConstantRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ConstantTable.Block.Length;

        //     this.CustomAttributeTable = new CustomAttributeTableReader(rowCounts[TableIndex.CustomAttribute],
        //                                                                IsDeclaredSorted(TableMask.CustomAttribute),
        //                                                                hasCustomAttributeRefSize,
        //                                                                customAttributeTypeRefSize,
        //                                                                blobHeapRefSize,
        //                                                                metadataTablesMemoryBlock,
        //                                                                totalRequiredSize);
        //     totalRequiredSize += this.CustomAttributeTable.Block.Length;

        //     this.FieldMarshalTable = new FieldMarshalTableReader(rowCounts[TableIndex.FieldMarshal], IsDeclaredSorted(TableMask.FieldMarshal), hasFieldMarshalRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.FieldMarshalTable.Block.Length;

        //     this.DeclSecurityTable = new DeclSecurityTableReader(rowCounts[TableIndex.DeclSecurity], IsDeclaredSorted(TableMask.DeclSecurity), hasDeclSecurityRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.DeclSecurityTable.Block.Length;

        //     this.ClassLayoutTable = new ClassLayoutTableReader(rowCounts[TableIndex.ClassLayout], IsDeclaredSorted(TableMask.ClassLayout), GetReferenceSize(rowCounts, TableIndex.TypeDef), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ClassLayoutTable.Block.Length;

        //     this.FieldLayoutTable = new FieldLayoutTableReader(rowCounts[TableIndex.FieldLayout], IsDeclaredSorted(TableMask.FieldLayout), GetReferenceSize(rowCounts, TableIndex.Field), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.FieldLayoutTable.Block.Length;

        //     this.StandAloneSigTable = new StandAloneSigTableReader(rowCounts[TableIndex.StandAloneSig], blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.StandAloneSigTable.Block.Length;

        //     this.EventMapTable = new EventMapTableReader(rowCounts[TableIndex.EventMap], GetReferenceSize(rowCounts, TableIndex.TypeDef), eventRefSizeSorted, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.EventMapTable.Block.Length;

        //     this.EventPtrTable = new EventPtrTableReader(rowCounts[TableIndex.EventPtr], GetReferenceSize(rowCounts, TableIndex.Event), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.EventPtrTable.Block.Length;

        //     this.EventTable = new EventTableReader(rowCounts[TableIndex.Event], typeDefOrRefRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.EventTable.Block.Length;

        //     this.PropertyMapTable = new PropertyMapTableReader(rowCounts[TableIndex.PropertyMap], GetReferenceSize(rowCounts, TableIndex.TypeDef), propertyRefSizeSorted, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.PropertyMapTable.Block.Length;

        //     this.PropertyPtrTable = new PropertyPtrTableReader(rowCounts[TableIndex.PropertyPtr], GetReferenceSize(rowCounts, TableIndex.Property), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.PropertyPtrTable.Block.Length;

        //     this.PropertyTable = new PropertyTableReader(rowCounts[TableIndex.Property], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.PropertyTable.Block.Length;

        //     this.MethodSemanticsTable = new MethodSemanticsTableReader(rowCounts[TableIndex.MethodSemantics], IsDeclaredSorted(TableMask.MethodSemantics), GetReferenceSize(rowCounts, TableIndex.MethodDef), hasSemanticsRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MethodSemanticsTable.Block.Length;

        //     this.MethodImplTable = new MethodImplTableReader(rowCounts[TableIndex.MethodImpl], IsDeclaredSorted(TableMask.MethodImpl), GetReferenceSize(rowCounts, TableIndex.TypeDef), methodDefOrRefRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MethodImplTable.Block.Length;

        //     this.ModuleRefTable = new ModuleRefTableReader(rowCounts[TableIndex.ModuleRef], stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ModuleRefTable.Block.Length;

        //     this.TypeSpecTable = new TypeSpecTableReader(rowCounts[TableIndex.TypeSpec], blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.TypeSpecTable.Block.Length;

        //     this.ImplMapTable = new ImplMapTableReader(rowCounts[TableIndex.ImplMap], IsDeclaredSorted(TableMask.ImplMap), GetReferenceSize(rowCounts, TableIndex.ModuleRef), memberForwardedRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ImplMapTable.Block.Length;

        //     this.FieldRvaTable = new FieldRVATableReader(rowCounts[TableIndex.FieldRva], IsDeclaredSorted(TableMask.FieldRva), GetReferenceSize(rowCounts, TableIndex.Field), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.FieldRvaTable.Block.Length;

        //     this.EncLogTable = new EnCLogTableReader(rowCounts[TableIndex.EncLog], metadataTablesMemoryBlock, totalRequiredSize, _metadataStreamKind);
        //     totalRequiredSize += this.EncLogTable.Block.Length;

        //     this.EncMapTable = new EnCMapTableReader(rowCounts[TableIndex.EncMap], metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.EncMapTable.Block.Length;

        //     this.AssemblyTable = new AssemblyTableReader(rowCounts[TableIndex.Assembly], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.AssemblyTable.Block.Length;

        //     this.AssemblyProcessorTable = new AssemblyProcessorTableReader(rowCounts[TableIndex.AssemblyProcessor], metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.AssemblyProcessorTable.Block.Length;

        //     this.AssemblyOSTable = new AssemblyOSTableReader(rowCounts[TableIndex.AssemblyOS], metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.AssemblyOSTable.Block.Length;

        //     this.AssemblyRefTable = new AssemblyRefTableReader(rowCounts[TableIndex.AssemblyRef], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize, _metadataKind);
        //     totalRequiredSize += this.AssemblyRefTable.Block.Length;

        //     this.AssemblyRefProcessorTable = new AssemblyRefProcessorTableReader(rowCounts[TableIndex.AssemblyRefProcessor], GetReferenceSize(rowCounts, TableIndex.AssemblyRef), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.AssemblyRefProcessorTable.Block.Length;

        //     this.AssemblyRefOSTable = new AssemblyRefOSTableReader(rowCounts[TableIndex.AssemblyRefOS], GetReferenceSize(rowCounts, TableIndex.AssemblyRef), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.AssemblyRefOSTable.Block.Length;

        this.FileTable = new FileTableReader(rowCounts[TableIndex.File], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FileTable.Block.Length;

        //     this.ExportedTypeTable = new ExportedTypeTableReader(rowCounts[TableIndex.ExportedType], implementationRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ExportedTypeTable.Block.Length;

        //     this.ManifestResourceTable = new ManifestResourceTableReader(rowCounts[TableIndex.ManifestResource], implementationRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ManifestResourceTable.Block.Length;

        //     this.NestedClassTable = new NestedClassTableReader(rowCounts[TableIndex.NestedClass], IsDeclaredSorted(TableMask.NestedClass), GetReferenceSize(rowCounts, TableIndex.TypeDef), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.NestedClassTable.Block.Length;

        //     this.GenericParamTable = new GenericParamTableReader(rowCounts[TableIndex.GenericParam], IsDeclaredSorted(TableMask.GenericParam), typeOrMethodDefRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.GenericParamTable.Block.Length;

        //     this.MethodSpecTable = new MethodSpecTableReader(rowCounts[TableIndex.MethodSpec], methodDefOrRefRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MethodSpecTable.Block.Length;

        //     this.GenericParamConstraintTable = new GenericParamConstraintTableReader(rowCounts[TableIndex.GenericParamConstraint], IsDeclaredSorted(TableMask.GenericParamConstraint), GetReferenceSize(rowCounts, TableIndex.GenericParam), typeDefOrRefRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.GenericParamConstraintTable.Block.Length;

        //     // debug tables:
        //     // Type-system metadata tables may be stored in a separate (external) metadata file.
        //     // We need to use the row counts of the external tables when referencing them.
        //     // Debug tables are local to the current metadata image and type system metadata tables are external and precede all debug tables.
        //     const combinedRowCounts = (externalRowCountsOpt != undefined) ? CombineRowCounts(rowCounts, externalRowCountsOpt, firstLocalTableIndex: TableIndex.Document) : rowCounts;

        //     int methodRefSizeCombined = GetReferenceSize(combinedRowCounts, TableIndex.MethodDef);
        //     int hasCustomDebugInformationRefSizeCombined = ComputeCodedTokenSize(HasCustomDebugInformationTag.LargeRowSize, combinedRowCounts, HasCustomDebugInformationTag.TablesReferenced);

        //     this.DocumentTable = new DocumentTableReader(rowCounts[TableIndex.Document], guidHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.DocumentTable.Block.Length;

        //     this.MethodDebugInformationTable = new MethodDebugInformationTableReader(rowCounts[TableIndex.MethodDebugInformation], GetReferenceSize(rowCounts, TableIndex.Document), blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.MethodDebugInformationTable.Block.Length;

        //     this.LocalScopeTable = new LocalScopeTableReader(rowCounts[TableIndex.LocalScope], IsDeclaredSorted(TableMask.LocalScope), methodRefSizeCombined, GetReferenceSize(rowCounts, TableIndex.ImportScope), GetReferenceSize(rowCounts, TableIndex.LocalVariable), GetReferenceSize(rowCounts, TableIndex.LocalConstant), metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.LocalScopeTable.Block.Length;

        //     this.LocalVariableTable = new LocalVariableTableReader(rowCounts[TableIndex.LocalVariable], stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.LocalVariableTable.Block.Length;

        //     this.LocalConstantTable = new LocalConstantTableReader(rowCounts[TableIndex.LocalConstant], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.LocalConstantTable.Block.Length;

        //     this.ImportScopeTable = new ImportScopeTableReader(rowCounts[TableIndex.ImportScope], GetReferenceSize(rowCounts, TableIndex.ImportScope), blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.ImportScopeTable.Block.Length;

        //     this.StateMachineMethodTable = new StateMachineMethodTableReader(rowCounts[TableIndex.StateMachineMethod], IsDeclaredSorted(TableMask.StateMachineMethod), methodRefSizeCombined, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.StateMachineMethodTable.Block.Length;

        //     this.CustomDebugInformationTable = new CustomDebugInformationTableReader(rowCounts[TableIndex.CustomDebugInformation], IsDeclaredSorted(TableMask.CustomDebugInformation), hasCustomDebugInformationRefSizeCombined, guidHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        //     totalRequiredSize += this.CustomDebugInformationTable.Block.Length;

        //     if (totalRequiredSize > metadataTablesMemoryBlock.Length)
        //     {
        //         throw new BadImageFormatException('.MetadataTablesTooSmall);
        //     }
    }

    // private static int[] CombineRowCounts(int[] local, int[] external, TableIndex firstLocalTableIndex)
    // {
    //     assert(local.Length == external.Length);

    //     const rowCounts = new int[local.Length];
    //     for (int i = 0; i < firstLocalTableIndex; i++)
    //     {
    //         rowCounts[i] = external[i];
    //     }

    //     for (int i = firstLocalTableIndex; i < rowCounts.Length; i++)
    //     {
    //         rowCounts[i] = local[i];
    //     }

    //     return rowCounts;
    // }

    // private int ComputeCodedTokenSize(int largeRowSize, int[] rowCounts, TableMask tablesReferenced)
    // {
    //     if (IsMinimalDelta)
    //     {
    //         return LargeIndexSize;
    //     }

    //     bool isAllReferencedTablesSmall = true;
    //     ulong tablesReferencedMask = (ulong)tablesReferenced;
    //     for (int tableIndex = 0; tableIndex < MetadataTokens.TableCount; tableIndex++)
    //     {
    //         if ((tablesReferencedMask & 1) != 0)
    //         {
    //             isAllReferencedTablesSmall = isAllReferencedTablesSmall && (rowCounts[tableIndex] < largeRowSize);
    //         }

    //         tablesReferencedMask >>= 1;
    //     }

    //     return isAllReferencedTablesSmall ? SmallIndexSize : LargeIndexSize;
    // }

    // private bool IsDeclaredSorted(TableMask index)
    // {
    //     return (_sortedTables & index) != 0;
    // }

    // #endregion

    // #region Helpers

    // public bool UseFieldPtrTable => FieldPtrTable.NumberOfRows > 0;
    // public bool UseMethodPtrTable => MethodPtrTable.NumberOfRows > 0;
    // public bool UseParamPtrTable => ParamPtrTable.NumberOfRows > 0;
    // public bool UseEventPtrTable => EventPtrTable.NumberOfRows > 0;
    // public bool UsePropertyPtrTable => PropertyPtrTable.NumberOfRows > 0;

    // public void GetFieldRange(TypeDefinitionHandle typeDef, out int firstFieldRowId, out int lastFieldRowId)
    // {
    //     int typeDefRowId = typeDef.RowId;

    //     firstFieldRowId = this.TypeDefTable.GetFieldStart(typeDefRowId);
    //     if (firstFieldRowId == 0)
    //     {
    //         firstFieldRowId = 1;
    //         lastFieldRowId = 0;
    //     }
    //     else if (typeDefRowId == this.TypeDefTable.NumberOfRows)
    //     {
    //         lastFieldRowId = (this.UseFieldPtrTable) ? this.FieldPtrTable.NumberOfRows : this.FieldTable.NumberOfRows;
    //     }
    //     else
    //     {
    //         lastFieldRowId = this.TypeDefTable.GetFieldStart(typeDefRowId + 1) - 1;
    //     }
    // }

    // public void GetMethodRange(TypeDefinitionHandle typeDef, out int firstMethodRowId, out int lastMethodRowId)
    // {
    //     int typeDefRowId = typeDef.RowId;
    //     firstMethodRowId = this.TypeDefTable.GetMethodStart(typeDefRowId);
    //     if (firstMethodRowId == 0)
    //     {
    //         firstMethodRowId = 1;
    //         lastMethodRowId = 0;
    //     }
    //     else if (typeDefRowId == this.TypeDefTable.NumberOfRows)
    //     {
    //         lastMethodRowId = (this.UseMethodPtrTable) ? this.MethodPtrTable.NumberOfRows : this.MethodDefTable.NumberOfRows;
    //     }
    //     else
    //     {
    //         lastMethodRowId = this.TypeDefTable.GetMethodStart(typeDefRowId + 1) - 1;
    //     }
    // }

    // public void GetEventRange(TypeDefinitionHandle typeDef, out int firstEventRowId, out int lastEventRowId)
    // {
    //     int eventMapRowId = this.EventMapTable.FindEventMapRowIdFor(typeDef);
    //     if (eventMapRowId == 0)
    //     {
    //         firstEventRowId = 1;
    //         lastEventRowId = 0;
    //         return;
    //     }

    //     firstEventRowId = this.EventMapTable.GetEventListStartFor(eventMapRowId);
    //     if (eventMapRowId == this.EventMapTable.NumberOfRows)
    //     {
    //         lastEventRowId = this.UseEventPtrTable ? this.EventPtrTable.NumberOfRows : this.EventTable.NumberOfRows;
    //     }
    //     else
    //     {
    //         lastEventRowId = this.EventMapTable.GetEventListStartFor(eventMapRowId + 1) - 1;
    //     }
    // }

    // public void GetPropertyRange(TypeDefinitionHandle typeDef, out int firstPropertyRowId, out int lastPropertyRowId)
    // {
    //     int propertyMapRowId = this.PropertyMapTable.FindPropertyMapRowIdFor(typeDef);
    //     if (propertyMapRowId == 0)
    //     {
    //         firstPropertyRowId = 1;
    //         lastPropertyRowId = 0;
    //         return;
    //     }

    //     firstPropertyRowId = this.PropertyMapTable.GetPropertyListStartFor(propertyMapRowId);
    //     if (propertyMapRowId == this.PropertyMapTable.NumberOfRows)
    //     {
    //         lastPropertyRowId = (this.UsePropertyPtrTable) ? this.PropertyPtrTable.NumberOfRows : this.PropertyTable.NumberOfRows;
    //     }
    //     else
    //     {
    //         lastPropertyRowId = this.PropertyMapTable.GetPropertyListStartFor(propertyMapRowId + 1) - 1;
    //     }
    // }

    // public void GetParameterRange(MethodDefinitionHandle methodDef, out int firstParamRowId, out int lastParamRowId)
    // {
    //     int rid = methodDef.RowId;

    //     firstParamRowId = this.MethodDefTable.GetParamStart(rid);
    //     if (firstParamRowId == 0)
    //     {
    //         firstParamRowId = 1;
    //         lastParamRowId = 0;
    //     }
    //     else if (rid == this.MethodDefTable.NumberOfRows)
    //     {
    //         lastParamRowId = (this.UseParamPtrTable ? this.ParamPtrTable.NumberOfRows : this.ParamTable.NumberOfRows);
    //     }
    //     else
    //     {
    //         lastParamRowId = this.MethodDefTable.GetParamStart(rid + 1) - 1;
    //     }
    // }

    // public void GetLocalVariableRange(LocalScopeHandle scope, out int firstVariableRowId, out int lastVariableRowId)
    // {
    //     int scopeRowId = scope.RowId;

    //     firstVariableRowId = this.LocalScopeTable.GetVariableStart(scopeRowId);
    //     if (firstVariableRowId == 0)
    //     {
    //         firstVariableRowId = 1;
    //         lastVariableRowId = 0;
    //     }
    //     else if (scopeRowId == this.LocalScopeTable.NumberOfRows)
    //     {
    //         lastVariableRowId = this.LocalVariableTable.NumberOfRows;
    //     }
    //     else
    //     {
    //         lastVariableRowId = this.LocalScopeTable.GetVariableStart(scopeRowId + 1) - 1;
    //     }
    // }

    // public void GetLocalConstantRange(LocalScopeHandle scope, out int firstConstantRowId, out int lastConstantRowId)
    // {
    //     int scopeRowId = scope.RowId;

    //     firstConstantRowId = this.LocalScopeTable.GetConstantStart(scopeRowId);
    //     if (firstConstantRowId == 0)
    //     {
    //         firstConstantRowId = 1;
    //         lastConstantRowId = 0;
    //     }
    //     else if (scopeRowId == this.LocalScopeTable.NumberOfRows)
    //     {
    //         lastConstantRowId = this.LocalConstantTable.NumberOfRows;
    //     }
    //     else
    //     {
    //         lastConstantRowId = this.LocalScopeTable.GetConstantStart(scopeRowId + 1) - 1;
    //     }
    // }

    // #endregion

    // #region Public APIs

    // /// <summary>
    // /// Pointer to the underlying data.
    // /// </summary>
    // public unsafe byte* MetadataPointer => Block.Pointer;

    // /// <summary>
    // /// Length of the underlying data.
    // /// </summary>
    // public int MetadataLength => Block.Length;

    // /// <summary>
    // /// Options passed to the constructor.
    // /// </summary>
    // public MetadataReaderOptions Options => _options;

    // /// <summary>
    // /// Version string read from metadata header.
    // /// </summary>
    // public string MetadataVersion => _versionString;

    // /// <summary>
    // /// Information decoded from #Pdb stream, or undefined if the stream is not present.
    // /// </summary>
    // public DebugMetadataHeader? DebugMetadataHeader => _debugMetadataHeader;

    // /// <summary>
    // /// The kind of the metadata (plain ECMA335, WinMD, etc.).
    // /// </summary>
    // public MetadataKind MetadataKind => _metadataKind;

    // /// <summary>
    // /// Comparer used to compare strings stored in metadata.
    // /// </summary>
    // public MetadataStringComparer StringComparer => new MetadataStringComparer(this);

    /// <summary>
    /// The decoder used by the reader to produce <see cref="string"/> instances from UTF-8 encoded byte sequences.
    /// </summary>
    public readonly UTF8Decoder: MetadataStringDecoder;

    // /// <summary>
    // /// Returns true if the metadata represent an assembly.
    // /// </summary>
    // public bool IsAssembly => AssemblyTable.NumberOfRows == 1;

    public get AssemblyReferences() { return new AssemblyReferenceHandleCollection(this); }
    // public TypeDefinitionHandleCollection TypeDefinitions => new TypeDefinitionHandleCollection(TypeDefTable.NumberOfRows);
    // public TypeReferenceHandleCollection TypeReferences => new TypeReferenceHandleCollection(TypeRefTable.NumberOfRows);
    // public CustomAttributeHandleCollection CustomAttributes => new CustomAttributeHandleCollection(this);
    // public DeclarativeSecurityAttributeHandleCollection DeclarativeSecurityAttributes => new DeclarativeSecurityAttributeHandleCollection(this);
    // public MemberReferenceHandleCollection MemberReferences => new MemberReferenceHandleCollection(MemberRefTable.NumberOfRows);
    // public ManifestResourceHandleCollection ManifestResources => new ManifestResourceHandleCollection(ManifestResourceTable.NumberOfRows);
    public get AssemblyFiles() { return new AssemblyFileHandleCollection(this.FileTable.NumberOfRows); }
    // public ExportedTypeHandleCollection ExportedTypes => new ExportedTypeHandleCollection(ExportedTypeTable.NumberOfRows);
    // public MethodDefinitionHandleCollection MethodDefinitions => new MethodDefinitionHandleCollection(this);
    // public FieldDefinitionHandleCollection FieldDefinitions => new FieldDefinitionHandleCollection(this);
    // public EventDefinitionHandleCollection EventDefinitions => new EventDefinitionHandleCollection(this);
    // public PropertyDefinitionHandleCollection PropertyDefinitions => new PropertyDefinitionHandleCollection(this);
    // public DocumentHandleCollection Documents => new DocumentHandleCollection(this);
    // public MethodDebugInformationHandleCollection MethodDebugInformation => new MethodDebugInformationHandleCollection(this);
    // public LocalScopeHandleCollection LocalScopes => new LocalScopeHandleCollection(this, 0);
    // public LocalVariableHandleCollection LocalVariables => new LocalVariableHandleCollection(this, default(LocalScopeHandle));
    // public LocalConstantHandleCollection LocalConstants => new LocalConstantHandleCollection(this, default(LocalScopeHandle));
    // public ImportScopeCollection ImportScopes => new ImportScopeCollection(this);
    // public CustomDebugInformationHandleCollection CustomDebugInformation => new CustomDebugInformationHandleCollection(this);

    // public AssemblyDefinition GetAssemblyDefinition()
    // {
    //     if (!IsAssembly)
    //     {
    //         throw new InvalidOperationException('.MetadataImageDoesNotRepresentAnAssembly);
    //     }

    //     return new AssemblyDefinition(this);
    // }

    // public string GetString(StringHandle handle)
    // {
    //     return StringHeap.GetString(handle, UTF8Decoder);
    // }

    // public string GetString(NamespaceDefinitionHandle handle)
    // {
    //     if (handle.HasFullName)
    //     {
    //         return StringHeap.GetString(handle.GetFullName(), UTF8Decoder);
    //     }

    //     return NamespaceCache.GetFullName(handle);
    // }

    // public byte[] GetBlobBytes(BlobHandle handle)
    // {
    //     return BlobHeap.GetBytes(handle);
    // }

    // public ImmutableArray<byte> GetBlobContent(BlobHandle handle)
    // {
    //     // TODO: We can skip a copy for virtual blobs.
    //     byte[]? bytes = GetBlobBytes(handle);
    //     return ImmutableCollectionsMarshal.AsImmutableArray(bytes);
    // }

    // public BlobReader GetBlobReader(BlobHandle handle)
    // {
    //     return BlobHeap.GetBlobReader(handle);
    // }

    // public BlobReader GetBlobReader(StringHandle handle)
    // {
    //     return StringHeap.GetBlobReader(handle);
    // }

    // public string GetUserString(UserStringHandle handle)
    // {
    //     return UserStringHeap.GetString(handle);
    // }

    // public Guid GetGuid(GuidHandle handle)
    // {
    //     return GuidHeap.GetGuid(handle);
    // }

    // public ModuleDefinition GetModuleDefinition()
    // {
    //     if (_debugMetadataHeader != undefined)
    //     {
    //         throw new InvalidOperationException('.StandaloneDebugMetadataImageDoesNotContainModuleTable);
    //     }

    //     return new ModuleDefinition(this);
    // }

    // public AssemblyReference GetAssemblyReference(AssemblyReferenceHandle handle)
    // {
    //     return new AssemblyReference(this, handle.Value);
    // }

    // public TypeDefinition GetTypeDefinition(TypeDefinitionHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new TypeDefinition(this, GetTypeDefTreatmentAndRowId(handle));
    // }

    // public NamespaceDefinition GetNamespaceDefinitionRoot()
    // {
    //     NamespaceData data = NamespaceCache.GetRootNamespace();
    //     return new NamespaceDefinition(data);
    // }

    // public NamespaceDefinition GetNamespaceDefinition(NamespaceDefinitionHandle handle)
    // {
    //     NamespaceData data = NamespaceCache.GetNamespaceData(handle);
    //     return new NamespaceDefinition(data);
    // }

    // private uint GetTypeDefTreatmentAndRowId(TypeDefinitionHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     if (_metadataKind == MetadataKind.Ecma335)
    //     {
    //         return (uint)handle.RowId;
    //     }

    //     return CalculateTypeDefTreatmentAndRowId(handle);
    // }

    // public TypeReference GetTypeReference(TypeReferenceHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new TypeReference(this, GetTypeRefTreatmentAndRowId(handle));
    // }

    // private uint GetTypeRefTreatmentAndRowId(TypeReferenceHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     if (_metadataKind == MetadataKind.Ecma335)
    //     {
    //         return (uint)handle.RowId;
    //     }

    //     return CalculateTypeRefTreatmentAndRowId(handle);
    // }

    // public ExportedType GetExportedType(ExportedTypeHandle handle)
    // {
    //     return new ExportedType(this, handle.RowId);
    // }

    // public CustomAttributeHandleCollection GetCustomAttributes(EntityHandle handle)
    // {
    //     return new CustomAttributeHandleCollection(this, handle);
    // }

    // public CustomAttribute GetCustomAttribute(CustomAttributeHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new CustomAttribute(this, GetCustomAttributeTreatmentAndRowId(handle));
    // }

    // private uint GetCustomAttributeTreatmentAndRowId(CustomAttributeHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     if (_metadataKind == MetadataKind.Ecma335)
    //     {
    //         return (uint)handle.RowId;
    //     }

    //     return TreatmentAndRowId((byte)CustomAttributeTreatment.WinMD, handle.RowId);
    // }

    // public DeclarativeSecurityAttribute GetDeclarativeSecurityAttribute(DeclarativeSecurityAttributeHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new DeclarativeSecurityAttribute(this, handle.RowId);
    // }

    // public Constant GetConstant(ConstantHandle handle)
    // {
    //     return new Constant(this, handle.RowId);
    // }

    // public MethodDefinition GetMethodDefinition(MethodDefinitionHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new MethodDefinition(this, GetMethodDefTreatmentAndRowId(handle));
    // }

    // private uint GetMethodDefTreatmentAndRowId(MethodDefinitionHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     if (_metadataKind == MetadataKind.Ecma335)
    //     {
    //         return (uint)handle.RowId;
    //     }

    //     return CalculateMethodDefTreatmentAndRowId(handle);
    // }

    // public FieldDefinition GetFieldDefinition(FieldDefinitionHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new FieldDefinition(this, GetFieldDefTreatmentAndRowId(handle));
    // }

    // private uint GetFieldDefTreatmentAndRowId(FieldDefinitionHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     if (_metadataKind == MetadataKind.Ecma335)
    //     {
    //         return (uint)handle.RowId;
    //     }

    //     return CalculateFieldDefTreatmentAndRowId(handle);
    // }

    // public PropertyDefinition GetPropertyDefinition(PropertyDefinitionHandle handle)
    // {
    //     return new PropertyDefinition(this, handle);
    // }

    // public EventDefinition GetEventDefinition(EventDefinitionHandle handle)
    // {
    //     return new EventDefinition(this, handle);
    // }

    // public MethodImplementation GetMethodImplementation(MethodImplementationHandle handle)
    // {
    //     return new MethodImplementation(this, handle);
    // }

    // public MemberReference GetMemberReference(MemberReferenceHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     return new MemberReference(this, GetMemberRefTreatmentAndRowId(handle));
    // }

    // private uint GetMemberRefTreatmentAndRowId(MemberReferenceHandle handle)
    // {
    //     // PERF: This code pattern is JIT friendly and results in very efficient code.
    //     if (_metadataKind == MetadataKind.Ecma335)
    //     {
    //         return (uint)handle.RowId;
    //     }

    //     return CalculateMemberRefTreatmentAndRowId(handle);
    // }

    // public MethodSpecification GetMethodSpecification(MethodSpecificationHandle handle)
    // {
    //     return new MethodSpecification(this, handle);
    // }

    // public Parameter GetParameter(ParameterHandle handle)
    // {
    //     return new Parameter(this, handle);
    // }

    // public GenericParameter GetGenericParameter(GenericParameterHandle handle)
    // {
    //     return new GenericParameter(this, handle);
    // }

    // public GenericParameterConstraint GetGenericParameterConstraint(GenericParameterConstraintHandle handle)
    // {
    //     return new GenericParameterConstraint(this, handle);
    // }

    // public ManifestResource GetManifestResource(ManifestResourceHandle handle)
    // {
    //     return new ManifestResource(this, handle);
    // }

    // public AssemblyFile GetAssemblyFile(AssemblyFileHandle handle)
    // {
    //     return new AssemblyFile(this, handle);
    // }

    // public StandaloneSignature GetStandaloneSignature(StandaloneSignatureHandle handle)
    // {
    //     return new StandaloneSignature(this, handle);
    // }

    // public TypeSpecification GetTypeSpecification(TypeSpecificationHandle handle)
    // {
    //     return new TypeSpecification(this, handle);
    // }

    // public ModuleReference GetModuleReference(ModuleReferenceHandle handle)
    // {
    //     return new ModuleReference(this, handle);
    // }

    // public InterfaceImplementation GetInterfaceImplementation(InterfaceImplementationHandle handle)
    // {
    //     return new InterfaceImplementation(this, handle);
    // }

    // public TypeDefinitionHandle GetDeclaringType(MethodDefinitionHandle methodDef)
    // {
    //     int methodRowId;
    //     if (UseMethodPtrTable)
    //     {
    //         methodRowId = MethodPtrTable.GetRowIdForMethodDefRow(methodDef.RowId);
    //     }
    //     else
    //     {
    //         methodRowId = methodDef.RowId;
    //     }

    //     return TypeDefTable.FindTypeContainingMethod(methodRowId, MethodDefTable.NumberOfRows);
    // }

    // public TypeDefinitionHandle GetDeclaringType(FieldDefinitionHandle fieldDef)
    // {
    //     int fieldRowId;
    //     if (UseFieldPtrTable)
    //     {
    //         fieldRowId = FieldPtrTable.GetRowIdForFieldDefRow(fieldDef.RowId);
    //     }
    //     else
    //     {
    //         fieldRowId = fieldDef.RowId;
    //     }

    //     return TypeDefTable.FindTypeContainingField(fieldRowId, FieldTable.NumberOfRows);
    // }

    // public string GetString(DocumentNameBlobHandle handle)
    // {
    //     return BlobHeap.GetDocumentName(handle);
    // }

    // public Document GetDocument(DocumentHandle handle)
    // {
    //     return new Document(this, handle);
    // }

    // public MethodDebugInformation GetMethodDebugInformation(MethodDebugInformationHandle handle)
    // {
    //     return new MethodDebugInformation(this, handle);
    // }

    // public MethodDebugInformation GetMethodDebugInformation(MethodDefinitionHandle handle)
    // {
    //     return new MethodDebugInformation(this, MethodDebugInformationHandle.FromRowId(handle.RowId));
    // }

    // public LocalScope GetLocalScope(LocalScopeHandle handle)
    // {
    //     return new LocalScope(this, handle);
    // }

    // public LocalVariable GetLocalVariable(LocalVariableHandle handle)
    // {
    //     return new LocalVariable(this, handle);
    // }

    // public LocalConstant GetLocalConstant(LocalConstantHandle handle)
    // {
    //     return new LocalConstant(this, handle);
    // }

    // public ImportScope GetImportScope(ImportScopeHandle handle)
    // {
    //     return new ImportScope(this, handle);
    // }

    // public CustomDebugInformation GetCustomDebugInformation(CustomDebugInformationHandle handle)
    // {
    //     return new CustomDebugInformation(this, handle);
    // }

    // public CustomDebugInformationHandleCollection GetCustomDebugInformation(EntityHandle handle)
    // {
    //     return new CustomDebugInformationHandleCollection(this, handle);
    // }

    // public LocalScopeHandleCollection GetLocalScopes(MethodDefinitionHandle handle)
    // {
    //     return new LocalScopeHandleCollection(this, handle.RowId);
    // }

    // public LocalScopeHandleCollection GetLocalScopes(MethodDebugInformationHandle handle)
    // {
    //     return new LocalScopeHandleCollection(this, handle.RowId);
    // }

    // #endregion

    // #region Nested Types

    // private void InitializeNestedTypesMap()
    // {
    //     const groupedNestedTypes = new Dictionary<TypeDefinitionHandle, ImmutableArray<TypeDefinitionHandle>.Builder>();

    //     int numberOfNestedTypes = NestedClassTable.NumberOfRows;
    //     ImmutableArray<TypeDefinitionHandle>.Builder? builder = undefined;
    //     TypeDefinitionHandle previousEnclosingClass = default(TypeDefinitionHandle);

    //     for (int i = 1; i <= numberOfNestedTypes; i++)
    //     {
    //         TypeDefinitionHandle enclosingClass = NestedClassTable.GetEnclosingClass(i);

    //         assert(!enclosingClass.IsNil);

    //         if (enclosingClass != previousEnclosingClass)
    //         {
    //             if (!groupedNestedTypes.TryGetValue(enclosingClass, out builder))
    //             {
    //                 builder = ImmutableArray.CreateBuilder<TypeDefinitionHandle>();
    //                 groupedNestedTypes.Add(enclosingClass, builder);
    //             }

    //             previousEnclosingClass = enclosingClass;
    //         }
    //         else
    //         {
    //             assert(builder == groupedNestedTypes[enclosingClass]);
    //         }

    //         builder.Add(NestedClassTable.GetNestedClass(i));
    //     }

    //     const nestedTypesMap = new Dictionary<TypeDefinitionHandle, ImmutableArray<TypeDefinitionHandle>>();
    //     foreach (const group in groupedNestedTypes)
    //     {
    //         nestedTypesMap.Add(group.Key, group.Value.ToImmutable());
    //     }

    //     _lazyNestedTypesMap = nestedTypesMap;
    // }

    // /// <summary>
    // /// Returns an array of types nested in the specified type.
    // /// </summary>
    // public ImmutableArray<TypeDefinitionHandle> GetNestedTypes(TypeDefinitionHandle typeDef)
    // {
    //     if (_lazyNestedTypesMap == undefined)
    //     {
    //         InitializeNestedTypesMap();
    //         assert(_lazyNestedTypesMap != undefined);
    //     }

    //     ImmutableArray<TypeDefinitionHandle> nestedTypes;
    //     if (_lazyNestedTypesMap.TryGetValue(typeDef, out nestedTypes))
    //     {
    //         return nestedTypes;
    //     }

    //     return ImmutableArray<TypeDefinitionHandle>.Empty;
    // }
    // #endregion
}