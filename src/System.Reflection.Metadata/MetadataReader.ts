import assert from "assert";
import { Guid, Throw, Type, sizeof } from "System";
import { TypeAttributes, } from "System.Reflection";
import { BitArithmetic, MemoryBlock } from "System.Reflection.Internal";
import {
    AssemblyReferenceHandleCollection,
    AssemblyFileHandleCollection,
    TypeDefinitionHandle,
    MethodDefinitionHandle,
    ModuleDefinition,
    MetadataReaderOptions,
    MetadataStringDecoder,
    BlobReader,
    MetadataKind,
    DebugMetadataHeader,
    AssemblyDefinition,
    StringHandle,
    GuidHandle,
    TypeDefinitionHandleCollection,
    ExportedTypeHandleCollection,
    CustomAttributeHandleCollection,
    TypeDefinition,
    AssemblyReferenceHandle,
    EntityHandle,
    TypeReferenceHandle,
    HandleKind,
    CustomAttributeHandle,
    ExportedTypeHandle,
    ExportedType,
    MemberReferenceHandle,
    AssemblyReference,
    TypeReference,
    ModuleReferenceHandle,
    ModuleReference,
    TypeSpecificationHandle,
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
    MetadataStreamConstants,
    MetadataTokens,
    TypeDefOrRefTag,
    TypeOrMethodDefTag,
    HasConstantTag,
    HasCustomAttributeTag,
    HasFieldMarshalTag,
    HasDeclSecurityTag,
    MemberRefParentTag,
    HasSemanticsTag,
    MemberForwardedTag,
    ImplementationTag,
    CustomAttributeTypeTag,
    ResolutionScopeTag,
    MethodDefOrRefTag,
    ModuleTableReader,
    TypeRefTableReader,
    TypeDefTableReader,
    FieldPtrTableReader,
    FieldTableReader,
    MethodPtrTableReader,
    MethodTableReader,
    ParamPtrTableReader,
    ParamTableReader,
    InterfaceImplTableReader,
    MemberRefTableReader,
    ConstantTableReader,
    CustomAttributeTableReader,
    FieldMarshalTableReader,
    DeclSecurityTableReader,
    ClassLayoutTableReader,
    FieldLayoutTableReader,
    StandAloneSigTableReader,
    EventMapTableReader,
    EventPtrTableReader,
    EventTableReader,
    PropertyMapTableReader,
    PropertyPtrTableReader,
    PropertyTableReader,
    MethodSemanticsTableReader,
    MethodImplTableReader,
    ModuleRefTableReader,
    TypeSpecTableReader,
    ImplMapTableReader,
    FieldRVATableReader,
    EnCLogTableReader,
    EnCMapTableReader,
    AssemblyTableReader,
    AssemblyProcessorTableReader,
    AssemblyOSTableReader,
    AssemblyRefTableReader,
    AssemblyRefProcessorTableReader,
    AssemblyRefOSTableReader,
    ExportedTypeTableReader,
    ManifestResourceTableReader,
    NestedClassTableReader,
    GenericParamTableReader,
    MethodSpecTableReader,
    GenericParamConstraintTableReader,
    DocumentTableReader,
    MethodDebugInformationTableReader,
    LocalScopeTableReader,
    LocalVariableTableReader,
    LocalConstantTableReader,
    ImportScopeTableReader,
    StateMachineMethodTableReader,
    CustomDebugInformationTableReader,
    HasCustomDebugInformationTag,
    TypeDefTreatment,
    TypeRefSignatureTreatment,
    TypeRefTreatment,
} from "System.Reflection.Metadata.Ecma335";
import { TypeSpecification } from "./TypeSystem/TypeSpecification";

class ProjectionInfo {
    public readonly WinRTNamespace: string;
    public readonly ClrNamespace: StringHandle.VirtualIndex;
    public readonly ClrName: StringHandle.VirtualIndex;
    public readonly AssemblyRef: AssemblyReferenceHandle.VirtualIndex;
    public readonly Treatment: TypeDefTreatment;
    public readonly SignatureTreatment: TypeRefSignatureTreatment;
    public readonly IsIDisposable: boolean;

    public constructor(
        winRtNamespace: string,
        clrNamespace: StringHandle.VirtualIndex,
        clrName: StringHandle.VirtualIndex,
        clrAssembly: AssemblyReferenceHandle.VirtualIndex,
        treatment: TypeDefTreatment = TypeDefTreatment.RedirectedToClrType,
        signatureTreatment: TypeRefSignatureTreatment = TypeRefSignatureTreatment.None,
        isIDisposable: boolean = false
    ) {
        this.WinRTNamespace = winRtNamespace;
        this.ClrNamespace = clrNamespace;
        this.ClrName = clrName;
        this.AssemblyRef = clrAssembly;
        this.Treatment = treatment;
        this.SignatureTreatment = signatureTreatment;
        this.IsIDisposable = isIDisposable;
    }
}

export class MetadataReader {
    static readonly ClrPrefix = "<CLR>";

    static readonly WinRTPrefix: Uint8Array = Uint8Array.from(Buffer.from("<WinRT>"));


    // public readonly NamespaceCache: NamespaceCache;
    public readonly Block: MemoryBlock;

    // // A row id of "mscorlib" AssemblyRef in a WinMD file (each WinMD file must have such a reference).
    public readonly WinMDMscorlibRef: number = 0;

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

        // This previously could occur in obfuscated assemblies but a check was added to prevent
        // it getting to this point
        assert(this.AssemblyTable.NumberOfRows <= 1);

        // // Although the specification states that the module table will have exactly one row,
        // // the native metadata reader would successfully read files containing more than one row.
        // // Such files exist in the wild and may be produced by obfuscators.
        // if (pdbStream.Length == 0 && this.ModuleTable.NumberOfRows < 1) {
        //     Throw.BadImageFormatException(`ModuleTableInvalidNumberOfRows, ${this.ModuleTable.NumberOfRows}`);
        // }

        // //  read
        // this.NamespaceCache = new NamespaceCache(this);

        if (this._metadataKind != MetadataKind.Ecma335) {
            this.WinMDMscorlibRef = this.FindMscorlibAssemblyRefNoProjection();
        }
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
    public TableRowCounts: number[] = undefined!;

    public ModuleTable: ModuleTableReader = undefined!;
    public TypeRefTable: TypeRefTableReader = undefined!;
    public TypeDefTable: TypeDefTableReader = undefined!;
    public FieldPtrTable: FieldPtrTableReader = undefined!;
    public FieldTable: FieldTableReader = undefined!;
    public MethodPtrTable: MethodPtrTableReader = undefined!;
    public MethodDefTable: MethodTableReader = undefined!;
    public ParamPtrTable: ParamPtrTableReader = undefined!;
    public ParamTable: ParamTableReader = undefined!;
    public InterfaceImplTable: InterfaceImplTableReader = undefined!;
    public MemberRefTable: MemberRefTableReader = undefined!;
    public ConstantTable: ConstantTableReader = undefined!;
    public CustomAttributeTable: CustomAttributeTableReader = undefined!;
    public FieldMarshalTable: FieldMarshalTableReader = undefined!;
    public DeclSecurityTable: DeclSecurityTableReader = undefined!;
    public ClassLayoutTable: ClassLayoutTableReader = undefined!;
    public FieldLayoutTable: FieldLayoutTableReader = undefined!;
    public StandAloneSigTable: StandAloneSigTableReader = undefined!;
    public EventMapTable: EventMapTableReader = undefined!;
    public EventPtrTable: EventPtrTableReader = undefined!;
    public EventTable: EventTableReader = undefined!;
    public PropertyMapTable: PropertyMapTableReader = undefined!;
    public PropertyPtrTable: PropertyPtrTableReader = undefined!;
    public PropertyTable: PropertyTableReader = undefined!;
    public MethodSemanticsTable: MethodSemanticsTableReader = undefined!;
    public MethodImplTable: MethodImplTableReader = undefined!;
    public ModuleRefTable: ModuleRefTableReader = undefined!;
    public TypeSpecTable: TypeSpecTableReader = undefined!;
    public ImplMapTable: ImplMapTableReader = undefined!;
    public FieldRvaTable: FieldRVATableReader = undefined!;
    public EncLogTable: EnCLogTableReader = undefined!;
    public EncMapTable: EnCMapTableReader = undefined!;
    public AssemblyTable: AssemblyTableReader = undefined!;
    public AssemblyProcessorTable: AssemblyProcessorTableReader = undefined!;              // unused
    public AssemblyOSTable: AssemblyOSTableReader = undefined!;                            // unused
    public AssemblyRefTable: AssemblyRefTableReader = undefined!;
    public AssemblyRefProcessorTable: AssemblyRefProcessorTableReader = undefined!;        // unused
    public AssemblyRefOSTable: AssemblyRefOSTableReader = undefined!;                      // unused
    public FileTable: FileTableReader = undefined!;
    public ExportedTypeTable: ExportedTypeTableReader = undefined!;
    public ManifestResourceTable: ManifestResourceTableReader = undefined!;
    public NestedClassTable: NestedClassTableReader = undefined!;
    public GenericParamTable: GenericParamTableReader = undefined!;
    public MethodSpecTable: MethodSpecTableReader = undefined!;
    public GenericParamConstraintTable: GenericParamConstraintTableReader = undefined!;

    // debug tables
    public DocumentTable: DocumentTableReader = undefined!;
    public MethodDebugInformationTable: MethodDebugInformationTableReader = undefined!;
    public LocalScopeTable: LocalScopeTableReader = undefined!;
    public LocalVariableTable: LocalVariableTableReader = undefined!;
    public LocalConstantTable: LocalConstantTableReader = undefined!;
    public ImportScopeTable: ImportScopeTableReader = undefined!;
    public StateMachineMethodTable: StateMachineMethodTableReader = undefined!;
    public CustomDebugInformationTable: CustomDebugInformationTableReader = undefined!;

    private ReadMetadataTableHeader(reader: BlobReader): { heapSizes: HeapSizes, metadataTableRowCounts: Array<number>, sortedTables: TableMask } {

        if (reader.RemainingBytes < MetadataStreamConstants.SizeOfMetadataTableHeader) {
            Throw.BadImageFormatException('.MetadataTableHeaderTooSmal');
        }

        // reserved (shall be ignored):
        reader.ReadUInt32();

        // major version (shall be ignored):
        reader.ReadByte();

        // minor version (shall be ignored):
        reader.ReadByte();

        // heap sizes:
        const heapSizes: HeapSizes = reader.ReadByte();

        // reserved (shall be ignored):
        reader.ReadByte();

        const presentTables = reader.Read64BitFlags();
        const sortedTables: TableMask = reader.ReadUInt64();

        // According to ECMA-335, MajorVersion and MinorVersion have fixed values and,
        // based on recommendation in 24.1 Fixed fields: When writing these fields it
        // is best that they be set to the value indicated, on reading they should be ignored.
        // We will not be checking version values. We will continue checking that the set of
        // present tables is within the set we understand.

        const validTables = (TableMask.TypeSystemTables | TableMask.DebugTables);

        if ((Number(presentTables) & ~validTables) != 0) {
            Throw.BadImageFormatException(`UnknownTables, ${presentTables}`);
        }

        if (this._metadataStreamKind == MetadataStreamKind.Compressed) {
            // In general Ptr tables and EnC tables are not allowed in a compressed stream.
            // However when asked for a snapshot of the current metadata after an EnC change has been applied
            // the CLR includes the EnCLog table into the snapshot. We need to be able to read the image,
            // so we'll allow the table here but pretend it's empty later.
            if ((Number(presentTables) & (TableMask.PtrTables | TableMask.EnCMap)) != 0) {
                Throw.BadImageFormatException('.IllegalTablesInCompressedMetadataStream');
            }
        }

        const metadataTableRowCounts = MetadataReader.ReadMetadataTableRowCounts(reader, presentTables);

        if ((heapSizes & HeapSizes.ExtraData) == HeapSizes.ExtraData) {
            // Skip "extra data" used by some obfuscators. Although it is not mentioned in the CLI spec,
            // it is honored by the native metadata reader.
            reader.ReadUInt32();
        }

        return {
            heapSizes,
            metadataTableRowCounts,
            sortedTables
        }
    }

    private static ReadMetadataTableRowCounts(memReader: BlobReader, presentTableMask: bigint): Array<number> {
        const rowCounts = new Array(MetadataTokens.TableCount).fill(0);
        for (let i = 0; i < rowCounts.length; i++) {
            const currentTableBit = BitArithmetic.SetBit64(i);

            if ((Number(BitArithmetic.And64(presentTableMask, currentTableBit))) != 0) {
                if (memReader.RemainingBytes < sizeof('uint')) {
                    Throw.BadImageFormatException('.TableRowCountSpaceTooSmall');
                }

                const rowCount = memReader.ReadUInt32();
                if (rowCount > TokenTypeIds.RIDMask) {
                    Throw.BadImageFormatException(`InvalidRowCount, ${rowCount}`);
                }

                rowCounts[i] = rowCount;
            }
        }
        return rowCounts;
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

        const externalTableMask = reader.Read64BitFlags();
        // EnC & Ptr tables can't be referenced from standalone PDB metadata:
        const validTables = TableMask.ValidPortablePdbExternalTables;

        if ((Number(externalTableMask) & ~validTables) != 0) {
            Throw.BadImageFormatException(`UnknownTables ${externalTableMask}`);
        }
        const externalTableRowCounts = MetadataReader.ReadMetadataTableRowCounts(reader, externalTableMask);

        const debugMetadataHeader = new DebugMetadataHeader(
            pdbId,
            MethodDefinitionHandle.FromRowId(entryPointRowId),
            pdbStreamOffset);

        return { debugMetadataHeader, externalTableRowCounts };
    }

    private static readonly SmallIndexSize = 2;
    private static readonly LargeIndexSize = 4;

    private GetReferenceSize(rowCounts: number[], index: TableIndex): number {
        return (rowCounts[index] < MetadataStreamConstants.LargeTableRowCount && !this.IsMinimalDelta) ? MetadataReader.SmallIndexSize : MetadataReader.LargeIndexSize;
    }

    private InitializeTableReaders(metadataTablesMemoryBlock: MemoryBlock, heapSizes: HeapSizes, rowCounts: number[], externalRowCountsOpt?: number[]) {
        // Size of reference tags in each table.
        this.TableRowCounts = rowCounts;

        // TODO (https://github.com/dotnet/runtime/issues/14721):
        // Shouldn't XxxPtr table be always the same size or smaller than the corresponding Xxx table?

        // Compute ref sizes for tables that can have pointer tables
        const fieldRefSizeSorted = this.GetReferenceSize(rowCounts, TableIndex.FieldPtr) > MetadataReader.SmallIndexSize ? MetadataReader.LargeIndexSize : this.GetReferenceSize(rowCounts, TableIndex.Field);
        const methodRefSizeSorted = this.GetReferenceSize(rowCounts, TableIndex.MethodPtr) > MetadataReader.SmallIndexSize ? MetadataReader.LargeIndexSize : this.GetReferenceSize(rowCounts, TableIndex.MethodDef);
        const paramRefSizeSorted = this.GetReferenceSize(rowCounts, TableIndex.ParamPtr) > MetadataReader.SmallIndexSize ? MetadataReader.LargeIndexSize : this.GetReferenceSize(rowCounts, TableIndex.Param);
        const eventRefSizeSorted = this.GetReferenceSize(rowCounts, TableIndex.EventPtr) > MetadataReader.SmallIndexSize ? MetadataReader.LargeIndexSize : this.GetReferenceSize(rowCounts, TableIndex.Event);
        const propertyRefSizeSorted = this.GetReferenceSize(rowCounts, TableIndex.PropertyPtr) > MetadataReader.SmallIndexSize ? MetadataReader.LargeIndexSize : this.GetReferenceSize(rowCounts, TableIndex.Property);

        // Compute the coded token ref sizes
        const typeDefOrRefRefSize = this.ComputeCodedTokenSize(TypeDefOrRefTag.LargeRowSize, rowCounts, TypeDefOrRefTag.TablesReferenced);
        const hasConstantRefSize = this.ComputeCodedTokenSize(HasConstantTag.LargeRowSize, rowCounts, HasConstantTag.TablesReferenced);
        const hasCustomAttributeRefSize = this.ComputeCodedTokenSize(HasCustomAttributeTag.LargeRowSize, rowCounts, HasCustomAttributeTag.TablesReferenced);
        const hasFieldMarshalRefSize = this.ComputeCodedTokenSize(HasFieldMarshalTag.LargeRowSize, rowCounts, HasFieldMarshalTag.TablesReferenced);
        const hasDeclSecurityRefSize = this.ComputeCodedTokenSize(HasDeclSecurityTag.LargeRowSize, rowCounts, HasDeclSecurityTag.TablesReferenced);
        const memberRefParentRefSize = this.ComputeCodedTokenSize(MemberRefParentTag.LargeRowSize, rowCounts, MemberRefParentTag.TablesReferenced);
        const hasSemanticsRefSize = this.ComputeCodedTokenSize(HasSemanticsTag.LargeRowSize, rowCounts, HasSemanticsTag.TablesReferenced);
        const methodDefOrRefRefSize = this.ComputeCodedTokenSize(MethodDefOrRefTag.LargeRowSize, rowCounts, MethodDefOrRefTag.TablesReferenced);
        const memberForwardedRefSize = this.ComputeCodedTokenSize(MemberForwardedTag.LargeRowSize, rowCounts, MemberForwardedTag.TablesReferenced);
        const implementationRefSize = this.ComputeCodedTokenSize(ImplementationTag.LargeRowSize, rowCounts, ImplementationTag.TablesReferenced);
        const customAttributeTypeRefSize = this.ComputeCodedTokenSize(CustomAttributeTypeTag.LargeRowSize, rowCounts, CustomAttributeTypeTag.TablesReferenced);
        const resolutionScopeRefSize = this.ComputeCodedTokenSize(ResolutionScopeTag.LargeRowSize, rowCounts, ResolutionScopeTag.TablesReferenced);
        const typeOrMethodDefRefSize = this.ComputeCodedTokenSize(TypeOrMethodDefTag.LargeRowSize, rowCounts, TypeOrMethodDefTag.TablesReferenced);

        //     // Compute HeapRef Sizes
        const stringHeapRefSize = (heapSizes & HeapSizes.StringHeapLarge) == HeapSizes.StringHeapLarge ? MetadataReader.LargeIndexSize : MetadataReader.SmallIndexSize;
        const guidHeapRefSize = (heapSizes & HeapSizes.GuidHeapLarge) == HeapSizes.GuidHeapLarge ? MetadataReader.LargeIndexSize : MetadataReader.SmallIndexSize;
        const blobHeapRefSize = (heapSizes & HeapSizes.BlobHeapLarge) == HeapSizes.BlobHeapLarge ? MetadataReader.LargeIndexSize : MetadataReader.SmallIndexSize;

        // Populate the Table blocks
        let totalRequiredSize = 0;
        this.ModuleTable = new ModuleTableReader(rowCounts[TableIndex.Module], stringHeapRefSize, guidHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ModuleTable.Block.Length;

        this.TypeRefTable = new TypeRefTableReader(rowCounts[TableIndex.TypeRef], resolutionScopeRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.TypeRefTable.Block.Length;

        this.TypeDefTable = new TypeDefTableReader(rowCounts[TableIndex.TypeDef], fieldRefSizeSorted, methodRefSizeSorted, typeDefOrRefRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.TypeDefTable.Block.Length;

        this.FieldPtrTable = new FieldPtrTableReader(rowCounts[TableIndex.FieldPtr], this.GetReferenceSize(rowCounts, TableIndex.Field), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FieldPtrTable.Block.Length;

        this.FieldTable = new FieldTableReader(rowCounts[TableIndex.Field], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FieldTable.Block.Length;

        this.MethodPtrTable = new MethodPtrTableReader(rowCounts[TableIndex.MethodPtr], this.GetReferenceSize(rowCounts, TableIndex.MethodDef), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MethodPtrTable.Block.Length;

        this.MethodDefTable = new MethodTableReader(rowCounts[TableIndex.MethodDef], paramRefSizeSorted, stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MethodDefTable.Block.Length;

        this.ParamPtrTable = new ParamPtrTableReader(rowCounts[TableIndex.ParamPtr], this.GetReferenceSize(rowCounts, TableIndex.Param), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ParamPtrTable.Block.Length;

        this.ParamTable = new ParamTableReader(rowCounts[TableIndex.Param], stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ParamTable.Block.Length;

        this.InterfaceImplTable = new InterfaceImplTableReader(rowCounts[TableIndex.InterfaceImpl], this.IsDeclaredSorted(TableMask.InterfaceImpl), this.GetReferenceSize(rowCounts, TableIndex.TypeDef), typeDefOrRefRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.InterfaceImplTable.Block.Length;

        this.MemberRefTable = new MemberRefTableReader(rowCounts[TableIndex.MemberRef], memberRefParentRefSize, stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MemberRefTable.Block.Length;

        this.ConstantTable = new ConstantTableReader(rowCounts[TableIndex.Constant], this.IsDeclaredSorted(TableMask.Constant), hasConstantRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ConstantTable.Block.Length;

        this.CustomAttributeTable = new CustomAttributeTableReader(rowCounts[TableIndex.CustomAttribute],
            this.IsDeclaredSorted(TableMask.CustomAttribute),
            hasCustomAttributeRefSize,
            customAttributeTypeRefSize,
            blobHeapRefSize,
            metadataTablesMemoryBlock,
            totalRequiredSize);
        totalRequiredSize += this.CustomAttributeTable.Block.Length;

        this.FieldMarshalTable = new FieldMarshalTableReader(rowCounts[TableIndex.FieldMarshal], this.IsDeclaredSorted(TableMask.FieldMarshal), hasFieldMarshalRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FieldMarshalTable.Block.Length;

        this.DeclSecurityTable = new DeclSecurityTableReader(rowCounts[TableIndex.DeclSecurity], this.IsDeclaredSorted(TableMask.DeclSecurity), hasDeclSecurityRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.DeclSecurityTable.Block.Length;

        this.ClassLayoutTable = new ClassLayoutTableReader(rowCounts[TableIndex.ClassLayout], this.IsDeclaredSorted(TableMask.ClassLayout), this.GetReferenceSize(rowCounts, TableIndex.TypeDef), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ClassLayoutTable.Block.Length;

        this.FieldLayoutTable = new FieldLayoutTableReader(rowCounts[TableIndex.FieldLayout], this.IsDeclaredSorted(TableMask.FieldLayout), this.GetReferenceSize(rowCounts, TableIndex.Field), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FieldLayoutTable.Block.Length;

        this.StandAloneSigTable = new StandAloneSigTableReader(rowCounts[TableIndex.StandAloneSig], blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.StandAloneSigTable.Block.Length;

        this.EventMapTable = new EventMapTableReader(rowCounts[TableIndex.EventMap], this.GetReferenceSize(rowCounts, TableIndex.TypeDef), eventRefSizeSorted, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.EventMapTable.Block.Length;

        this.EventPtrTable = new EventPtrTableReader(rowCounts[TableIndex.EventPtr], this.GetReferenceSize(rowCounts, TableIndex.Event), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.EventPtrTable.Block.Length;

        this.EventTable = new EventTableReader(rowCounts[TableIndex.Event], typeDefOrRefRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.EventTable.Block.Length;

        this.PropertyMapTable = new PropertyMapTableReader(rowCounts[TableIndex.PropertyMap], this.GetReferenceSize(rowCounts, TableIndex.TypeDef), propertyRefSizeSorted, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.PropertyMapTable.Block.Length;

        this.PropertyPtrTable = new PropertyPtrTableReader(rowCounts[TableIndex.PropertyPtr], this.GetReferenceSize(rowCounts, TableIndex.Property), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.PropertyPtrTable.Block.Length;

        this.PropertyTable = new PropertyTableReader(rowCounts[TableIndex.Property], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.PropertyTable.Block.Length;

        this.MethodSemanticsTable = new MethodSemanticsTableReader(rowCounts[TableIndex.MethodSemantics], this.IsDeclaredSorted(TableMask.MethodSemantics), this.GetReferenceSize(rowCounts, TableIndex.MethodDef), hasSemanticsRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MethodSemanticsTable.Block.Length;

        this.MethodImplTable = new MethodImplTableReader(rowCounts[TableIndex.MethodImpl], this.IsDeclaredSorted(TableMask.MethodImpl), this.GetReferenceSize(rowCounts, TableIndex.TypeDef), methodDefOrRefRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MethodImplTable.Block.Length;

        this.ModuleRefTable = new ModuleRefTableReader(rowCounts[TableIndex.ModuleRef], stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ModuleRefTable.Block.Length;

        this.TypeSpecTable = new TypeSpecTableReader(rowCounts[TableIndex.TypeSpec], blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.TypeSpecTable.Block.Length;

        this.ImplMapTable = new ImplMapTableReader(rowCounts[TableIndex.ImplMap], this.IsDeclaredSorted(TableMask.ImplMap), this.GetReferenceSize(rowCounts, TableIndex.ModuleRef), memberForwardedRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ImplMapTable.Block.Length;

        this.FieldRvaTable = new FieldRVATableReader(rowCounts[TableIndex.FieldRva], this.IsDeclaredSorted(TableMask.FieldRva), this.GetReferenceSize(rowCounts, TableIndex.Field), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FieldRvaTable.Block.Length;

        this.EncLogTable = new EnCLogTableReader(rowCounts[TableIndex.EncLog], metadataTablesMemoryBlock, totalRequiredSize, this._metadataStreamKind);
        totalRequiredSize += this.EncLogTable.Block.Length;

        this.EncMapTable = new EnCMapTableReader(rowCounts[TableIndex.EncMap], metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.EncMapTable.Block.Length;

        this.AssemblyTable = new AssemblyTableReader(rowCounts[TableIndex.Assembly], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.AssemblyTable.Block.Length;

        this.AssemblyProcessorTable = new AssemblyProcessorTableReader(rowCounts[TableIndex.AssemblyProcessor], metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.AssemblyProcessorTable.Block.Length;

        this.AssemblyOSTable = new AssemblyOSTableReader(rowCounts[TableIndex.AssemblyOS], metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.AssemblyOSTable.Block.Length;

        this.AssemblyRefTable = new AssemblyRefTableReader(rowCounts[TableIndex.AssemblyRef], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize, this._metadataKind);
        totalRequiredSize += this.AssemblyRefTable.Block.Length;

        this.AssemblyRefProcessorTable = new AssemblyRefProcessorTableReader(rowCounts[TableIndex.AssemblyRefProcessor], this.GetReferenceSize(rowCounts, TableIndex.AssemblyRef), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.AssemblyRefProcessorTable.Block.Length;

        this.AssemblyRefOSTable = new AssemblyRefOSTableReader(rowCounts[TableIndex.AssemblyRefOS], this.GetReferenceSize(rowCounts, TableIndex.AssemblyRef), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.AssemblyRefOSTable.Block.Length;

        this.FileTable = new FileTableReader(rowCounts[TableIndex.File], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.FileTable.Block.Length;

        this.ExportedTypeTable = new ExportedTypeTableReader(rowCounts[TableIndex.ExportedType], implementationRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ExportedTypeTable.Block.Length;

        this.ManifestResourceTable = new ManifestResourceTableReader(rowCounts[TableIndex.ManifestResource], implementationRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ManifestResourceTable.Block.Length;

        this.NestedClassTable = new NestedClassTableReader(rowCounts[TableIndex.NestedClass], this.IsDeclaredSorted(TableMask.NestedClass), this.GetReferenceSize(rowCounts, TableIndex.TypeDef), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.NestedClassTable.Block.Length;

        this.GenericParamTable = new GenericParamTableReader(rowCounts[TableIndex.GenericParam], this.IsDeclaredSorted(TableMask.GenericParam), typeOrMethodDefRefSize, stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.GenericParamTable.Block.Length;

        this.MethodSpecTable = new MethodSpecTableReader(rowCounts[TableIndex.MethodSpec], methodDefOrRefRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MethodSpecTable.Block.Length;

        this.GenericParamConstraintTable = new GenericParamConstraintTableReader(rowCounts[TableIndex.GenericParamConstraint], this.IsDeclaredSorted(TableMask.GenericParamConstraint), this.GetReferenceSize(rowCounts, TableIndex.GenericParam), typeDefOrRefRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.GenericParamConstraintTable.Block.Length;

        // debug tables:
        // Type-system metadata tables may be stored in a separate (external) metadata file.
        // We need to use the row counts of the external tables when referencing them.
        // Debug tables are local to the current metadata image and type system metadata tables are external and precede all debug tables.
        const combinedRowCounts = (externalRowCountsOpt != undefined) ? MetadataReader.CombineRowCounts(rowCounts, externalRowCountsOpt, TableIndex.Document) : rowCounts;

        const methodRefSizeCombined = this.GetReferenceSize(combinedRowCounts, TableIndex.MethodDef);
        const hasCustomDebugInformationRefSizeCombined = this.ComputeCodedTokenSize(HasCustomDebugInformationTag.LargeRowSize, combinedRowCounts, HasCustomDebugInformationTag.TablesReferenced);

        this.DocumentTable = new DocumentTableReader(rowCounts[TableIndex.Document], guidHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.DocumentTable.Block.Length;

        this.MethodDebugInformationTable = new MethodDebugInformationTableReader(rowCounts[TableIndex.MethodDebugInformation], this.GetReferenceSize(rowCounts, TableIndex.Document), blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.MethodDebugInformationTable.Block.Length;

        this.LocalScopeTable = new LocalScopeTableReader(rowCounts[TableIndex.LocalScope], this.IsDeclaredSorted(TableMask.LocalScope), methodRefSizeCombined, this.GetReferenceSize(rowCounts, TableIndex.ImportScope), this.GetReferenceSize(rowCounts, TableIndex.LocalVariable), this.GetReferenceSize(rowCounts, TableIndex.LocalConstant), metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.LocalScopeTable.Block.Length;

        this.LocalVariableTable = new LocalVariableTableReader(rowCounts[TableIndex.LocalVariable], stringHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.LocalVariableTable.Block.Length;

        this.LocalConstantTable = new LocalConstantTableReader(rowCounts[TableIndex.LocalConstant], stringHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.LocalConstantTable.Block.Length;

        this.ImportScopeTable = new ImportScopeTableReader(rowCounts[TableIndex.ImportScope], this.GetReferenceSize(rowCounts, TableIndex.ImportScope), blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.ImportScopeTable.Block.Length;

        this.StateMachineMethodTable = new StateMachineMethodTableReader(rowCounts[TableIndex.StateMachineMethod], this.IsDeclaredSorted(TableMask.StateMachineMethod), methodRefSizeCombined, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.StateMachineMethodTable.Block.Length;

        this.CustomDebugInformationTable = new CustomDebugInformationTableReader(rowCounts[TableIndex.CustomDebugInformation], this.IsDeclaredSorted(TableMask.CustomDebugInformation), hasCustomDebugInformationRefSizeCombined, guidHeapRefSize, blobHeapRefSize, metadataTablesMemoryBlock, totalRequiredSize);
        totalRequiredSize += this.CustomDebugInformationTable.Block.Length;

        if (totalRequiredSize > metadataTablesMemoryBlock.Length) {
            Throw.BadImageFormatException('.MetadataTablesTooSmall');
        }
    }

    private static CombineRowCounts(local: number[], external: number[], firstLocalTableIndex: TableIndex): number[] {
        assert(local.length == external.length);

        const rowCounts = new Array<number>(local.length);
        for (let i = 0; i < firstLocalTableIndex; i++) {
            rowCounts[i] = external[i];
        }

        for (let i = firstLocalTableIndex; i < rowCounts.length; i++) {
            rowCounts[i] = local[i];
        }

        return rowCounts;
    }

    private ComputeCodedTokenSize(largeRowSize: number, rowCounts: number[], tablesReferenced: TableMask): number {
        if (this.IsMinimalDelta) {
            return MetadataReader.LargeIndexSize;
        }

        let isAllReferencedTablesSmall = true;
        let tablesReferencedMask: number = tablesReferenced;
        for (let tableIndex = 0; tableIndex < MetadataTokens.TableCount; tableIndex++) {
            if ((tablesReferencedMask & 1) != 0) {
                isAllReferencedTablesSmall = isAllReferencedTablesSmall && (rowCounts[tableIndex] < largeRowSize);
            }

            tablesReferencedMask >>= 1;
        }

        return isAllReferencedTablesSmall ? MetadataReader.SmallIndexSize : MetadataReader.LargeIndexSize;
    }

    private IsDeclaredSorted(index: TableMask): boolean {
        return (this._sortedTables & index) != 0;
    }

    // #endregion

    // #region Helpers

    public get UseFieldPtrTable(): boolean { return this.FieldPtrTable.NumberOfRows > 0; }
    public get UseMethodPtrTable(): boolean { return this.MethodPtrTable.NumberOfRows > 0; }
    public get UseParamPtrTable(): boolean { return this.ParamPtrTable.NumberOfRows > 0; }
    public get UseEventPtrTable(): boolean { return this.EventPtrTable.NumberOfRows > 0; }
    public get UsePropertyPtrTable(): boolean { return this.PropertyPtrTable.NumberOfRows > 0; }

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

    /// <summary>
    /// Returns true if the metadata represent an assembly.
    /// </summary>
    public get IsAssembly(): boolean { return this.AssemblyTable.NumberOfRows == 1; }
    public get AssemblyReferences() { return new AssemblyReferenceHandleCollection(this); }
    public get TypeDefinitions() { return new TypeDefinitionHandleCollection(this.TypeDefTable.NumberOfRows); }
    // public TypeReferenceHandleCollection TypeReferences => new TypeReferenceHandleCollection(TypeRefTable.NumberOfRows);
    public get CustomAttributes() { return new CustomAttributeHandleCollection(this); }
    // public DeclarativeSecurityAttributeHandleCollection DeclarativeSecurityAttributes => new DeclarativeSecurityAttributeHandleCollection(this);
    // public MemberReferenceHandleCollection MemberReferences => new MemberReferenceHandleCollection(MemberRefTable.NumberOfRows);
    // public ManifestResourceHandleCollection ManifestResources => new ManifestResourceHandleCollection(ManifestResourceTable.NumberOfRows);
    public get AssemblyFiles() { return new AssemblyFileHandleCollection(this.FileTable.NumberOfRows); }
    public get ExportedTypes() { return new ExportedTypeHandleCollection(this.ExportedTypeTable.NumberOfRows); }
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

    public GetAssemblyDefinition(): AssemblyDefinition {
        if (!this.IsAssembly) {
            Throw.InvalidOperationException('.MetadataImageDoesNotRepresentAnAssembly');
        }

        return new AssemblyDefinition(this);
    }

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

    public GetGuid(handle: GuidHandle): Guid {
        return this.GuidHeap.GetGuid(handle);
    }

    public GetModuleDefinition(): ModuleDefinition {
        if (this._debugMetadataHeader != undefined) {
            Throw.InvalidOperationException('.StandaloneDebugMetadataImageDoesNotContainModuleTable');
        }

        return new ModuleDefinition(this);
    }

    public GetAssemblyReference(handle: AssemblyReferenceHandle): AssemblyReference {
        return new AssemblyReference(this, handle.Value);
    }

    public GetTypeDefinition(handle: TypeDefinitionHandle): TypeDefinition {
        // PERF: This code pattern is JIT friendly and results in very efficient code.
        return new TypeDefinition(this, this.GetTypeDefTreatmentAndRowId(handle));
    }

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

    private GetTypeDefTreatmentAndRowId(handle: TypeDefinitionHandle): number {
        // PERF: This code pattern is JIT friendly and results in very efficient code.
        if (this._metadataKind == MetadataKind.Ecma335) {
            return handle.RowId;
        }

        return this.CalculateTypeDefTreatmentAndRowId(handle);
    }

    public GetTypeReference(handle: TypeReferenceHandle): TypeReference {
        // PERF: This code pattern is JIT friendly and results in very efficient code.
        // return new TypeReference(this, GetTypeRefTreatmentAndRowId(handle));
        throw new Error('Not implemented');
    }

    private GetTypeRefTreatmentAndRowId(handle: TypeReferenceHandle): number {
        // PERF: This code pattern is JIT friendly and results in very efficient code.
        if (this._metadataKind == MetadataKind.Ecma335) {
            return handle.RowId;
        }

        return this.CalculateTypeRefTreatmentAndRowId(handle);
    }

    public GetExportedType(handle: ExportedTypeHandle): ExportedType {
        return new ExportedType(this, handle.RowId);
    }

    public GetCustomAttributes(handle: EntityHandle): CustomAttributeHandleCollection {
        return new CustomAttributeHandleCollection(this, handle);
    }

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

    public GetTypeSpecification(handle: TypeSpecificationHandle): TypeSpecification {
        return new TypeSpecification(this, handle);
    }

    public GetModuleReference(handle: ModuleReferenceHandle): ModuleReference {
        return new ModuleReference(this, handle);
    }

    // public InterfaceImplementation GetInterfaceImplementation(InterfaceImplementationHandle handle)
    // {
    //     return new InterfaceImplementation(this, handle);
    // }

    public GetDeclaringType(methodDef: MethodDefinitionHandle): TypeDefinitionHandle {
        let methodRowId;
        if (this.UseMethodPtrTable) {
            methodRowId = this.MethodPtrTable.GetRowIdForMethodDefRow(methodDef.RowId);
        }
        else {
            methodRowId = methodDef.RowId;
        }

        return this.TypeDefTable.FindTypeContainingMethod(methodRowId, this.MethodDefTable.NumberOfRows);
    }

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

    //=======================================================================================================
    // Win.MD
    // internal const string ClrPrefix = "<CLR>";

    // internal static readonly byte[] WinRTPrefix = "<WinRT>"u8.ToArray();

    // #region Projection Tables

    // Maps names of projected types to projection information for each type.
    // Both arrays are of the same length and sorted by the type name.
    private static s_projectedTypeNames: string[] | undefined;
    private static s_projectionInfos: ProjectionInfo[] | undefined;



    private GetWellKnownTypeDefinitionTreatment(typeDef: TypeDefinitionHandle): TypeDefTreatment {
        MetadataReader.InitializeProjectedTypes();

        const name: StringHandle = this.TypeDefTable.GetName(typeDef);

        const index = this.StringHeap.BinarySearchRaw(MetadataReader.s_projectedTypeNames!, name);
        if (index < 0) {
            return TypeDefTreatment.None;
        }

        const namespaceName: StringHandle = this.TypeDefTable.GetNamespace(typeDef);
        if (namespaceName.GetString(this) == StringHeap.GetVirtualString(MetadataReader.s_projectionInfos![index].ClrNamespace)) {
            return MetadataReader.s_projectionInfos![index].Treatment;
        }

        // TODO: we can avoid this comparison if info.DotNetNamespace == info.WinRtNamespace
        if (namespaceName.GetString(this) == MetadataReader.s_projectionInfos![index].WinRTNamespace) {
            return MetadataReader.s_projectionInfos![index].Treatment | TypeDefTreatment.MarkInternalFlag;
        }

        return TypeDefTreatment.None;
    }

    private GetProjectionIndexForTypeReference(typeRef: TypeReferenceHandle): number {
        MetadataReader.InitializeProjectedTypes();

        const index = this.StringHeap.BinarySearchRaw(MetadataReader.s_projectedTypeNames!, this.TypeRefTable.GetName(typeRef));
        if (index >= 0 && this.TypeRefTable.GetNamespace(typeRef).GetString(this) == MetadataReader.s_projectionInfos![index].WinRTNamespace) {
            return index;
        }

        return -1;
    }

    public static GetProjectedAssemblyRef(projectionIndex: number): AssemblyReferenceHandle {
        assert(MetadataReader.s_projectionInfos != undefined && projectionIndex >= 0 && projectionIndex < MetadataReader.s_projectionInfos.length);
        return AssemblyReferenceHandle.FromVirtualIndex(MetadataReader.s_projectionInfos[projectionIndex].AssemblyRef);
    }

    public static GetProjectedName(projectionIndex: number): StringHandle {
        assert(MetadataReader.s_projectionInfos != undefined && projectionIndex >= 0 && projectionIndex < MetadataReader.s_projectionInfos.length);
        return StringHandle.FromVirtualIndex(MetadataReader.s_projectionInfos[projectionIndex].ClrName);
    }

    public static GetProjectedNamespace(projectionIndex: number): StringHandle {
        assert(MetadataReader.s_projectionInfos != undefined && projectionIndex >= 0 && projectionIndex < MetadataReader.s_projectionInfos.length);
        return StringHandle.FromVirtualIndex(MetadataReader.s_projectionInfos[projectionIndex].ClrNamespace);
    }

    // internal static TypeRefSignatureTreatment GetProjectedSignatureTreatment(int projectionIndex)
    // {
    //     assert(s_projectionInfos != undefined && projectionIndex >= 0 && projectionIndex < s_projectionInfos.Length);
    //     return s_projectionInfos[projectionIndex].SignatureTreatment;
    // }

    private static InitializeProjectedTypes() {
        if (MetadataReader.s_projectedTypeNames == undefined || MetadataReader.s_projectionInfos == undefined) {
            const systemRuntimeWindowsRuntime = AssemblyReferenceHandle.VirtualIndex.System_Runtime_WindowsRuntime;
            const systemRuntime = AssemblyReferenceHandle.VirtualIndex.System_Runtime;
            const systemObjectModel = AssemblyReferenceHandle.VirtualIndex.System_ObjectModel;
            const systemRuntimeWindowsUiXaml = AssemblyReferenceHandle.VirtualIndex.System_Runtime_WindowsRuntime_UI_Xaml;
            const systemRuntimeInterop = AssemblyReferenceHandle.VirtualIndex.System_Runtime_InteropServices_WindowsRuntime;
            const systemNumericsVectors = AssemblyReferenceHandle.VirtualIndex.System_Numerics_Vectors;

            // sorted by name
            const keys = new Array<string>(50);
            const values = new Array<ProjectionInfo>(50);
            let k = 0, v = 0;

            // WARNING: Keys must be sorted by name and must only contain ASCII characters. WinRTNamespace must also be ASCII only.

            keys[k++] = "AttributeTargets"; values[v++] = new ProjectionInfo("Windows.Foundation.Metadata", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.AttributeTargets, systemRuntime);
            keys[k++] = "AttributeUsageAttribute"; values[v++] = new ProjectionInfo("Windows.Foundation.Metadata", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.AttributeUsageAttribute, systemRuntime, TypeDefTreatment.RedirectedToClrAttribute);
            keys[k++] = "Color"; values[v++] = new ProjectionInfo("Windows.UI", StringHandle.VirtualIndex.Windows_UI, StringHandle.VirtualIndex.Color, systemRuntimeWindowsRuntime);
            keys[k++] = "CornerRadius"; values[v++] = new ProjectionInfo("Windows.UI.Xaml", StringHandle.VirtualIndex.Windows_UI_Xaml, StringHandle.VirtualIndex.CornerRadius, systemRuntimeWindowsUiXaml);
            keys[k++] = "DateTime"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.DateTimeOffset, systemRuntime);
            keys[k++] = "Duration"; values[v++] = new ProjectionInfo("Windows.UI.Xaml", StringHandle.VirtualIndex.Windows_UI_Xaml, StringHandle.VirtualIndex.Duration, systemRuntimeWindowsUiXaml);
            keys[k++] = "DurationType"; values[v++] = new ProjectionInfo("Windows.UI.Xaml", StringHandle.VirtualIndex.Windows_UI_Xaml, StringHandle.VirtualIndex.DurationType, systemRuntimeWindowsUiXaml);
            keys[k++] = "EventHandler`1"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.EventHandler1, systemRuntime);
            keys[k++] = "EventRegistrationToken"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System_Runtime_InteropServices_WindowsRuntime, StringHandle.VirtualIndex.EventRegistrationToken, systemRuntimeInterop);
            keys[k++] = "GeneratorPosition"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Controls.Primitives", StringHandle.VirtualIndex.Windows_UI_Xaml_Controls_Primitives, StringHandle.VirtualIndex.GeneratorPosition, systemRuntimeWindowsUiXaml);
            keys[k++] = "GridLength"; values[v++] = new ProjectionInfo("Windows.UI.Xaml", StringHandle.VirtualIndex.Windows_UI_Xaml, StringHandle.VirtualIndex.GridLength, systemRuntimeWindowsUiXaml);
            keys[k++] = "GridUnitType"; values[v++] = new ProjectionInfo("Windows.UI.Xaml", StringHandle.VirtualIndex.Windows_UI_Xaml, StringHandle.VirtualIndex.GridUnitType, systemRuntimeWindowsUiXaml);
            keys[k++] = "HResult"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.Exception, systemRuntime, TypeDefTreatment.RedirectedToClrType, TypeRefSignatureTreatment.ProjectedToClass);
            keys[k++] = "IBindableIterable"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System_Collections, StringHandle.VirtualIndex.IEnumerable, systemRuntime);
            keys[k++] = "IBindableVector"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System_Collections, StringHandle.VirtualIndex.IList, systemRuntime);
            keys[k++] = "IClosable"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.IDisposable, systemRuntime, TypeDefTreatment.RedirectedToClrType, TypeRefSignatureTreatment.None, true);
            keys[k++] = "ICommand"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Input", StringHandle.VirtualIndex.System_Windows_Input, StringHandle.VirtualIndex.ICommand, systemObjectModel);
            keys[k++] = "IIterable`1"; values[v++] = new ProjectionInfo("Windows.Foundation.Collections", StringHandle.VirtualIndex.System_Collections_Generic, StringHandle.VirtualIndex.IEnumerable1, systemRuntime);
            keys[k++] = "IKeyValuePair`2"; values[v++] = new ProjectionInfo("Windows.Foundation.Collections", StringHandle.VirtualIndex.System_Collections_Generic, StringHandle.VirtualIndex.KeyValuePair2, systemRuntime, TypeDefTreatment.RedirectedToClrType, TypeRefSignatureTreatment.ProjectedToValueType);
            keys[k++] = "IMapView`2"; values[v++] = new ProjectionInfo("Windows.Foundation.Collections", StringHandle.VirtualIndex.System_Collections_Generic, StringHandle.VirtualIndex.IReadOnlyDictionary2, systemRuntime);
            keys[k++] = "IMap`2"; values[v++] = new ProjectionInfo("Windows.Foundation.Collections", StringHandle.VirtualIndex.System_Collections_Generic, StringHandle.VirtualIndex.IDictionary2, systemRuntime);
            keys[k++] = "INotifyCollectionChanged"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System_Collections_Specialized, StringHandle.VirtualIndex.INotifyCollectionChanged, systemObjectModel);
            keys[k++] = "INotifyPropertyChanged"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Data", StringHandle.VirtualIndex.System_ComponentModel, StringHandle.VirtualIndex.INotifyPropertyChanged, systemObjectModel);
            keys[k++] = "IReference`1"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.Nullable1, systemRuntime, TypeDefTreatment.RedirectedToClrType, TypeRefSignatureTreatment.ProjectedToValueType);
            keys[k++] = "IVectorView`1"; values[v++] = new ProjectionInfo("Windows.Foundation.Collections", StringHandle.VirtualIndex.System_Collections_Generic, StringHandle.VirtualIndex.IReadOnlyList1, systemRuntime);
            keys[k++] = "IVector`1"; values[v++] = new ProjectionInfo("Windows.Foundation.Collections", StringHandle.VirtualIndex.System_Collections_Generic, StringHandle.VirtualIndex.IList1, systemRuntime);
            keys[k++] = "KeyTime"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Media.Animation", StringHandle.VirtualIndex.Windows_UI_Xaml_Media_Animation, StringHandle.VirtualIndex.KeyTime, systemRuntimeWindowsUiXaml);
            keys[k++] = "Matrix"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Media", StringHandle.VirtualIndex.Windows_UI_Xaml_Media, StringHandle.VirtualIndex.Matrix, systemRuntimeWindowsUiXaml);
            keys[k++] = "Matrix3D"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Media.Media3D", StringHandle.VirtualIndex.Windows_UI_Xaml_Media_Media3D, StringHandle.VirtualIndex.Matrix3D, systemRuntimeWindowsUiXaml);
            keys[k++] = "Matrix3x2"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Matrix3x2, systemNumericsVectors);
            keys[k++] = "Matrix4x4"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Matrix4x4, systemNumericsVectors);
            keys[k++] = "NotifyCollectionChangedAction"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System_Collections_Specialized, StringHandle.VirtualIndex.NotifyCollectionChangedAction, systemObjectModel);
            keys[k++] = "NotifyCollectionChangedEventArgs"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System_Collections_Specialized, StringHandle.VirtualIndex.NotifyCollectionChangedEventArgs, systemObjectModel);
            keys[k++] = "NotifyCollectionChangedEventHandler"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System_Collections_Specialized, StringHandle.VirtualIndex.NotifyCollectionChangedEventHandler, systemObjectModel);
            keys[k++] = "Plane"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Plane, systemNumericsVectors);
            keys[k++] = "Point"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.Windows_Foundation, StringHandle.VirtualIndex.Point, systemRuntimeWindowsRuntime);
            keys[k++] = "PropertyChangedEventArgs"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Data", StringHandle.VirtualIndex.System_ComponentModel, StringHandle.VirtualIndex.PropertyChangedEventArgs, systemObjectModel);
            keys[k++] = "PropertyChangedEventHandler"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Data", StringHandle.VirtualIndex.System_ComponentModel, StringHandle.VirtualIndex.PropertyChangedEventHandler, systemObjectModel);
            keys[k++] = "Quaternion"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Quaternion, systemNumericsVectors);
            keys[k++] = "Rect"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.Windows_Foundation, StringHandle.VirtualIndex.Rect, systemRuntimeWindowsRuntime);
            keys[k++] = "RepeatBehavior"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Media.Animation", StringHandle.VirtualIndex.Windows_UI_Xaml_Media_Animation, StringHandle.VirtualIndex.RepeatBehavior, systemRuntimeWindowsUiXaml);
            keys[k++] = "RepeatBehaviorType"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Media.Animation", StringHandle.VirtualIndex.Windows_UI_Xaml_Media_Animation, StringHandle.VirtualIndex.RepeatBehaviorType, systemRuntimeWindowsUiXaml);
            keys[k++] = "Size"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.Windows_Foundation, StringHandle.VirtualIndex.Size, systemRuntimeWindowsRuntime);
            keys[k++] = "Thickness"; values[v++] = new ProjectionInfo("Windows.UI.Xaml", StringHandle.VirtualIndex.Windows_UI_Xaml, StringHandle.VirtualIndex.Thickness, systemRuntimeWindowsUiXaml);
            keys[k++] = "TimeSpan"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.TimeSpan, systemRuntime);
            keys[k++] = "TypeName"; values[v++] = new ProjectionInfo("Windows.UI.Xaml.Interop", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.Type, systemRuntime, TypeDefTreatment.RedirectedToClrType, TypeRefSignatureTreatment.ProjectedToClass);
            keys[k++] = "Uri"; values[v++] = new ProjectionInfo("Windows.Foundation", StringHandle.VirtualIndex.System, StringHandle.VirtualIndex.Uri, systemRuntime);
            keys[k++] = "Vector2"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Vector2, systemNumericsVectors);
            keys[k++] = "Vector3"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Vector3, systemNumericsVectors);
            keys[k++] = "Vector4"; values[v++] = new ProjectionInfo("Windows.Foundation.Numerics", StringHandle.VirtualIndex.System_Numerics, StringHandle.VirtualIndex.Vector4, systemNumericsVectors);

            assert(k == keys.length && v == keys.length && k == v);
            // AssertSorted(keys);

            MetadataReader.s_projectedTypeNames = keys;
            MetadataReader.s_projectionInfos = values;
        }
    }

    // [Conditional("DEBUG")]
    // private static void AssertSorted(string[] keys)
    // {
    //     for (int i = 0; i < keys.Length - 1; i++)
    //     {
    //         assert(string.CompareOrdinal(keys[i], keys[i + 1]) < 0);
    //     }
    // }

    // // test only
    // internal static string[] GetProjectedTypeNames()
    // {
    //     InitializeProjectedTypes();
    //     return s_projectedTypeNames!;
    // }

    // #endregion

    private static TreatmentAndRowId(treatment: number, rowId: number): number {
        return (treatment << TokenTypeIds.RowIdBitCount) | rowId;
    }

    // #region TypeDef

    // [MethodImpl(MethodImplOptions.NoInlining)]
    public CalculateTypeDefTreatmentAndRowId(handle: TypeDefinitionHandle): number {
        assert(this._metadataKind != MetadataKind.Ecma335);

        let treatment: TypeDefTreatment;

        const flags = this.TypeDefTable.GetFlags(handle);
        const extns = this.TypeDefTable.GetExtends(handle);

        if ((flags & TypeAttributes.WindowsRuntime) != 0) {
            if (this._metadataKind == MetadataKind.WindowsMetadata) {
                treatment = this.GetWellKnownTypeDefinitionTreatment(handle);
                if (treatment != TypeDefTreatment.None) {
                    return MetadataReader.TreatmentAndRowId(treatment, handle.RowId);
                }

                // Is this an attribute?
                if (extns.Kind == HandleKind.TypeReference && this.IsSystemAttribute(extns as unknown as TypeReferenceHandle)) {
                    treatment = TypeDefTreatment.NormalAttribute;
                }
                else {
                    treatment = TypeDefTreatment.NormalNonAttribute;
                }
            }
            else if (this._metadataKind == MetadataKind.ManagedWindowsMetadata && this.NeedsWinRTPrefix(flags, extns)) {
                // WinMDExp emits two versions of RuntimeClasses and Enums:
                //
                //    public class Foo {}            // the WinRT reference class
                //    internal class <CLR>Foo {}     // the implementation class that we want WinRT consumers to ignore
                //
                // The adapter's job is to undo WinMDExp's transformations. I.e. turn the above into:
                //
                //    internal class <WinRT>Foo {}   // the WinRT reference class that we want CLR consumers to ignore
                //    public class Foo {}            // the implementation class
                //
                // We only add the <WinRT> prefix here since the WinRT view is the only view that is marked WindowsRuntime
                // De-mangling the CLR name is done below.


                // tomat: The CLR adapter implements a back-compat quirk: Enums exported with an older WinMDExp have only one version
                // not marked with tdSpecialName. These enums should *not* be mangled and flipped to private.
                // We don't implement this flag since the WinMDs produced by the older WinMDExp are not used in the wild.

                treatment = TypeDefTreatment.PrefixWinRTName;
            }
            else {
                treatment = TypeDefTreatment.None;
            }

            // Scan through Custom Attributes on type, looking for interesting bits. We only
            // need to do this for RuntimeClasses
            if ((treatment == TypeDefTreatment.PrefixWinRTName || treatment == TypeDefTreatment.NormalNonAttribute)) {
                if ((flags & TypeAttributes.Interface) == 0
                    && this.HasAttribute(handle.ToEntityHandle(), "Windows.UI.Xaml", "TreatAsAbstractComposableClassAttribute")) {
                    treatment |= TypeDefTreatment.MarkAbstractFlag;
                }
            }
        }
        else if (this._metadataKind == MetadataKind.ManagedWindowsMetadata && this.IsClrImplementationType(handle)) {
            // <CLR> implementation classes are not marked WindowsRuntime, but still need to be modified
            // by the adapter.
            treatment = TypeDefTreatment.UnmangleWinRTName;
        }
        else {
            treatment = TypeDefTreatment.None;
        }

        return MetadataReader.TreatmentAndRowId(treatment, handle.RowId);
    }

    private IsClrImplementationType(typeDef: TypeDefinitionHandle): boolean {
        const attrs = this.TypeDefTable.GetFlags(typeDef);

        if ((attrs & (TypeAttributes.VisibilityMask | TypeAttributes.SpecialName)) != TypeAttributes.SpecialName) {
            return false;
        }

        return this.TypeDefTable.GetName(typeDef).GetString(this).startsWith(MetadataReader.ClrPrefix);
    }

    // #endregion

    // #region TypeRef

    public CalculateTypeRefTreatmentAndRowId(handle: TypeReferenceHandle): number {
        assert(this._metadataKind != MetadataKind.Ecma335);

        const projectionIndex = this.GetProjectionIndexForTypeReference(handle);
        if (projectionIndex >= 0) {
            return MetadataReader.TreatmentAndRowId(TypeRefTreatment.UseProjectionInfo, projectionIndex);
        }
        else {
            return MetadataReader.TreatmentAndRowId(this.GetSpecialTypeRefTreatment(handle), handle.RowId);
        }
    }

    private GetSpecialTypeRefTreatment(handle: TypeReferenceHandle): TypeRefTreatment {
        if (this.TypeRefTable.GetNamespace(handle).GetString(this) == "System") {
            const name = this.TypeRefTable.GetName(handle);

            if (name.GetString(this) == "MulticastDelegate") {
                return TypeRefTreatment.SystemDelegate;
            }

            if (name.GetString(this) == "Attribute") {
                return TypeRefTreatment.SystemAttribute;
            }
        }

        return TypeRefTreatment.None;
    }

    private IsSystemAttribute(handle: TypeReferenceHandle): boolean {
        return this.TypeRefTable.GetNamespace(handle).GetString(this) == "System" &&
            this.TypeRefTable.GetName(handle).GetString(this) == "Attribute";
    }

    private NeedsWinRTPrefix(flags: TypeAttributes, extns: EntityHandle): boolean {
        if ((flags & (TypeAttributes.VisibilityMask | TypeAttributes.Interface)) != TypeAttributes.Public) {
            return false;
        }

        if (extns.Kind != HandleKind.TypeReference) {
            return false;
        }

        // Check if the type is a delegate, struct, or attribute
        const extendsRefHandle = extns as unknown as TypeReferenceHandle;
        if (this.TypeRefTable.GetNamespace(extendsRefHandle).GetString(this) == "System") {
            const nameHandle = this.TypeRefTable.GetName(extendsRefHandle);
            const nameHandleString = nameHandle.GetString(this);
            if (nameHandleString == "MulticastDelegate"
                || nameHandleString == "ValueType"
                || nameHandleString == "Attribute") {
                return false;
            }
        }
        return true;
    }

    // #endregion

    // #region MethodDef

    // private uint CalculateMethodDefTreatmentAndRowId(MethodDefinitionHandle methodDef)
    // {
    //     MethodDefTreatment treatment = MethodDefTreatment.Implementation;

    //     TypeDefinitionHandle parentTypeDef = GetDeclaringType(methodDef);
    //     TypeAttributes parentFlags = TypeDefTable.GetFlags(parentTypeDef);

    //     if ((parentFlags & TypeAttributes.WindowsRuntime) != 0)
    //     {
    //         if (IsClrImplementationType(parentTypeDef))
    //         {
    //             treatment = MethodDefTreatment.Implementation;
    //         }
    //         else if (parentFlags.IsNested())
    //         {
    //             treatment = MethodDefTreatment.Implementation;
    //         }
    //         else if ((parentFlags & TypeAttributes.Interface) != 0)
    //         {
    //             treatment = MethodDefTreatment.InterfaceMethod;
    //         }
    //         else if (_metadataKind == MetadataKind.ManagedWindowsMetadata && (parentFlags & TypeAttributes.Public) == 0)
    //         {
    //             treatment = MethodDefTreatment.Implementation;
    //         }
    //         else
    //         {
    //             treatment = MethodDefTreatment.Other;

    //             const parentBaseType = TypeDefTable.GetExtends(parentTypeDef);
    //             if (parentBaseType.Kind == HandleKind.TypeReference)
    //             {
    //                 switch (GetSpecialTypeRefTreatment((TypeReferenceHandle)parentBaseType))
    //                 {
    //                     case TypeRefTreatment.SystemAttribute:
    //                         treatment = MethodDefTreatment.AttributeMethod;
    //                         break;

    //                     case TypeRefTreatment.SystemDelegate:
    //                         treatment = MethodDefTreatment.DelegateMethod | MethodDefTreatment.MarkPublicFlag;
    //                         break;
    //                 }
    //             }
    //         }
    //     }

    //     if (treatment == MethodDefTreatment.Other)
    //     {
    //         // we want to hide the method if it implements
    //         // only redirected interfaces
    //         // We also want to check if the methodImpl is IClosable.Close,
    //         // so we can change the name
    //         bool seenRedirectedInterfaces = false;
    //         bool seenNonRedirectedInterfaces = false;

    //         bool isIClosableClose = false;

    //         foreach (const methodImplHandle in new MethodImplementationHandleCollection(this, parentTypeDef))
    //         {
    //             MethodImplementation methodImpl = GetMethodImplementation(methodImplHandle);
    //             if (methodImpl.MethodBody == methodDef)
    //             {
    //                 EntityHandle declaration = methodImpl.MethodDeclaration;

    //                 // See if this MethodImpl implements a redirected interface
    //                 // In WinMD, MethodImpl will always use MemberRef and TypeRefs to refer to redirected interfaces,
    //                 // even if they are in the same module.
    //                 if (declaration.Kind == HandleKind.MemberReference &&
    //                     ImplementsRedirectedInterface((MemberReferenceHandle)declaration, out isIClosableClose))
    //                 {
    //                     seenRedirectedInterfaces = true;
    //                     if (isIClosableClose)
    //                     {
    //                         // This method implements IClosable.Close
    //                         // Let's rename to IDisposable later
    //                         // Once we know this implements IClosable.Close, we are done
    //                         // looking
    //                         break;
    //                     }
    //                 }
    //                 else
    //                 {
    //                     // Now we know this implements a non-redirected interface
    //                     // But we need to keep looking, just in case we got a methodimpl that
    //                     // implements the IClosable.Close method and needs to be renamed
    //                     seenNonRedirectedInterfaces = true;
    //                 }
    //             }
    //         }

    //         if (isIClosableClose)
    //         {
    //             treatment = MethodDefTreatment.DisposeMethod;
    //         }
    //         else if (seenRedirectedInterfaces && !seenNonRedirectedInterfaces)
    //         {
    //             // Only hide if all the interfaces implemented are redirected
    //             treatment = MethodDefTreatment.HiddenInterfaceImplementation;
    //         }
    //     }

    //     // If treatment is other, then this is a non-managed WinRT runtime class definition
    //     // Find out about various bits that we apply via attributes and name parsing
    //     if (treatment == MethodDefTreatment.Other)
    //     {
    //         treatment |= GetMethodTreatmentFromCustomAttributes(methodDef);
    //     }

    //     return TreatmentAndRowId((byte)treatment, methodDef.RowId);
    // }

    // private MethodDefTreatment GetMethodTreatmentFromCustomAttributes(MethodDefinitionHandle methodDef)
    // {
    //     MethodDefTreatment treatment = 0;

    //     foreach (const caHandle in GetCustomAttributes(methodDef))
    //     {
    //         StringHandle namespaceHandle, nameHandle;
    //         if (!GetAttributeTypeNameRaw(caHandle, out namespaceHandle, out nameHandle))
    //         {
    //             continue;
    //         }

    //         assert(!namespaceHandle.IsVirtual && !nameHandle.IsVirtual);

    //         if (StringHeap.EqualsRaw(namespaceHandle, "Windows.UI.Xaml"))
    //         {
    //             if (StringHeap.EqualsRaw(nameHandle, "TreatAsPublicMethodAttribute"))
    //             {
    //                 treatment |= MethodDefTreatment.MarkPublicFlag;
    //             }

    //             if (StringHeap.EqualsRaw(nameHandle, "TreatAsAbstractMethodAttribute"))
    //             {
    //                 treatment |= MethodDefTreatment.MarkAbstractFlag;
    //             }
    //         }
    //     }

    //     return treatment;
    // }

    // #endregion

    // #region FieldDef

    // /// <summary>
    // /// The backing field of a WinRT enumeration type is not public although the backing fields
    // /// of managed enumerations are. To allow managed languages to directly access this field,
    // /// it is made public by the metadata adapter.
    // /// </summary>
    // private uint CalculateFieldDefTreatmentAndRowId(FieldDefinitionHandle handle)
    // {
    //     const flags = FieldTable.GetFlags(handle);
    //     FieldDefTreatment treatment = FieldDefTreatment.None;

    //     if ((flags & FieldAttributes.RTSpecialName) != 0 && StringHeap.EqualsRaw(FieldTable.GetName(handle), "value__"))
    //     {
    //         TypeDefinitionHandle typeDef = GetDeclaringType(handle);

    //         EntityHandle baseTypeHandle = TypeDefTable.GetExtends(typeDef);
    //         if (baseTypeHandle.Kind == HandleKind.TypeReference)
    //         {
    //             const typeRef = (TypeReferenceHandle)baseTypeHandle;

    //             if (StringHeap.EqualsRaw(TypeRefTable.GetName(typeRef), "Enum") &&
    //                 StringHeap.EqualsRaw(TypeRefTable.GetNamespace(typeRef), "System"))
    //             {
    //                 treatment = FieldDefTreatment.EnumValue;
    //             }
    //         }
    //     }

    //     return TreatmentAndRowId((byte)treatment, handle.RowId);
    // }

    // #endregion

    // #region MemberRef

    // private uint CalculateMemberRefTreatmentAndRowId(MemberReferenceHandle handle)
    // {
    //     MemberRefTreatment treatment;

    //     // We need to rename the MemberRef for IClosable.Close as well
    //     // so that the MethodImpl for the Dispose method can be correctly shown
    //     // as IDisposable.Dispose instead of IDisposable.Close
    //     bool isIDisposable;
    //     if (ImplementsRedirectedInterface(handle, out isIDisposable) && isIDisposable)
    //     {
    //         treatment = MemberRefTreatment.Dispose;
    //     }
    //     else
    //     {
    //         treatment = MemberRefTreatment.None;
    //     }

    //     return TreatmentAndRowId((byte)treatment, handle.RowId);
    // }

    // /// <summary>
    // /// We want to know if a given method implements a redirected interface.
    // /// For example, if we are given the method RemoveAt on a class "A"
    // /// which implements the IVector interface (which is redirected
    // /// to IList in .NET) then this method would return true. The most
    // /// likely reason why we would want to know this is that we wish to hide
    // /// (mark private) all methods which implement methods on a redirected
    // /// interface.
    // /// </summary>
    // /// <param name="memberRef">The declaration token for the method</param>
    // /// <param name="isIDisposable">
    // /// Returns true if the redirected interface is <see cref="IDisposable"/>.
    // /// </param>
    // /// <returns>True if the method implements a method on a redirected interface.
    // /// False otherwise.</returns>
    // private bool ImplementsRedirectedInterface(MemberReferenceHandle memberRef, out bool isIDisposable)
    // {
    //     isIDisposable = false;

    //     EntityHandle parent = MemberRefTable.GetClass(memberRef);

    //     TypeReferenceHandle typeRef;
    //     if (parent.Kind == HandleKind.TypeReference)
    //     {
    //         typeRef = (TypeReferenceHandle)parent;
    //     }
    //     else if (parent.Kind == HandleKind.TypeSpecification)
    //     {
    //         BlobHandle blob = TypeSpecTable.GetSignature((TypeSpecificationHandle)parent);
    //         BlobReader sig = new BlobReader(BlobHeap.GetMemoryBlock(blob));

    //         if (sig.Length < 2 ||
    //             sig.ReadByte() != (byte)CorElementType.ELEMENT_TYPE_GENERICINST ||
    //             sig.ReadByte() != (byte)CorElementType.ELEMENT_TYPE_CLASS)
    //         {
    //             return false;
    //         }

    //         EntityHandle token = sig.ReadTypeHandle();
    //         if (token.Kind != HandleKind.TypeReference)
    //         {
    //             return false;
    //         }

    //         typeRef = (TypeReferenceHandle)token;
    //     }
    //     else
    //     {
    //         return false;
    //     }

    //     return GetProjectionIndexForTypeReference(typeRef, out isIDisposable) >= 0;
    // }

    // #endregion

    // #region AssemblyRef

    private FindMscorlibAssemblyRefNoProjection(): number {
        for (let i = 1; i <= this.AssemblyRefTable.NumberOfNonVirtualRows; i++) {
            if (this.AssemblyRefTable.GetName(i).GetString(this) == "mscorlib") {
                return i;
            }
        }

        Throw.BadImageFormatException("WinMDMissingMscorlibRef");
    }

    // #endregion

    // #region CustomAttribute

    // internal CustomAttributeValueTreatment CalculateCustomAttributeValueTreatment(CustomAttributeHandle handle)
    // {
    //     assert(_metadataKind != MetadataKind.Ecma335);

    //     const parent = CustomAttributeTable.GetParent(handle);

    //     // Check for Windows.Foundation.Metadata.AttributeUsageAttribute.
    //     // WinMD rules:
    //     //   - The attribute is only applicable on TypeDefs.
    //     //   - Constructor must be a MemberRef with TypeRef.
    //     if (!IsWindowsAttributeUsageAttribute(parent, handle))
    //     {
    //         return CustomAttributeValueTreatment.None;
    //     }

    //     const targetTypeDef = (TypeDefinitionHandle)parent;
    //     if (StringHeap.EqualsRaw(TypeDefTable.GetNamespace(targetTypeDef), "Windows.Foundation.Metadata"))
    //     {
    //         if (StringHeap.EqualsRaw(TypeDefTable.GetName(targetTypeDef), "VersionAttribute"))
    //         {
    //             return CustomAttributeValueTreatment.AttributeUsageVersionAttribute;
    //         }

    //         if (StringHeap.EqualsRaw(TypeDefTable.GetName(targetTypeDef), "DeprecatedAttribute"))
    //         {
    //             return CustomAttributeValueTreatment.AttributeUsageDeprecatedAttribute;
    //         }
    //     }

    //     bool allowMultiple = HasAttribute(targetTypeDef, "Windows.Foundation.Metadata", "AllowMultipleAttribute");
    //     return allowMultiple ? CustomAttributeValueTreatment.AttributeUsageAllowMultiple : CustomAttributeValueTreatment.AttributeUsageAllowSingle;
    // }

    // private bool IsWindowsAttributeUsageAttribute(EntityHandle targetType, CustomAttributeHandle attributeHandle)
    // {
    //     // Check for Windows.Foundation.Metadata.AttributeUsageAttribute.
    //     // WinMD rules:
    //     //   - The attribute is only applicable on TypeDefs.
    //     //   - Constructor must be a MemberRef with TypeRef.

    //     if (targetType.Kind != HandleKind.TypeDefinition)
    //     {
    //         return false;
    //     }

    //     const attributeCtor = CustomAttributeTable.GetConstructor(attributeHandle);
    //     if (attributeCtor.Kind != HandleKind.MemberReference)
    //     {
    //         return false;
    //     }

    //     const attributeType = MemberRefTable.GetClass((MemberReferenceHandle)attributeCtor);
    //     if (attributeType.Kind != HandleKind.TypeReference)
    //     {
    //         return false;
    //     }

    //     const attributeTypeRef = (TypeReferenceHandle)attributeType;
    //     return StringHeap.EqualsRaw(TypeRefTable.GetName(attributeTypeRef), "AttributeUsageAttribute") &&
    //            StringHeap.EqualsRaw(TypeRefTable.GetNamespace(attributeTypeRef), "Windows.Foundation.Metadata");
    // }

    private HasAttribute(token: EntityHandle, asciiNamespaceName: string, asciiTypeName: string) {
        for (const caHandle of this.GetCustomAttributes(token).ToArray()) {
            let namespaceName: StringHandle;
            let typeName: StringHandle;
            const out = this.GetAttributeTypeNameRaw(caHandle)
            if (out !== undefined &&
                out.typeName.GetString(this) == asciiTypeName &&
                out.namespaceName.GetString(this) == asciiNamespaceName) {
                return true;
            }
        }

        return false;
    }

    private GetAttributeTypeNameRaw(caHandle: CustomAttributeHandle): { namespaceName: StringHandle, typeName: StringHandle } | undefined {
        let namespaceName: StringHandle;
        let typeName: StringHandle;

        const typeDefOrRef: EntityHandle = this.GetAttributeTypeRaw(caHandle);
        if (typeDefOrRef.IsNil) {
            return undefined;
        }

        if (typeDefOrRef.Kind == HandleKind.TypeReference) {
            const typeRef = TypeReferenceHandle.FromEntityHandle(typeDefOrRef);
            const resolutionScope = this.TypeRefTable.GetResolutionScope(typeRef);

            if (!resolutionScope.IsNil && resolutionScope.Kind == HandleKind.TypeReference) {
                // we don't need to handle nested types
                return undefined;
            }

            // other resolution scopes don't affect full name

            typeName = this.TypeRefTable.GetName(typeRef);
            namespaceName = this.TypeRefTable.GetNamespace(typeRef);
        }
        else if (typeDefOrRef.Kind == HandleKind.TypeDefinition) {
            const typeDef = TypeDefinitionHandle.FromEntityHandle(typeDefOrRef);

            // from MetadataExtensions
            const NestedMask = 0x00000006;
            const IsNested = (flags: TypeAttributes) => (flags & NestedMask) != 0;

            if (IsNested(this.TypeDefTable.GetFlags(typeDef))) {
                // we don't need to handle nested types
                return undefined;
            }

            typeName = this.TypeDefTable.GetName(typeDef);
            namespaceName = this.TypeDefTable.GetNamespace(typeDef);
        }
        else {
            // invalid metadata
            return undefined;
        }

        return { namespaceName, typeName };
    }

    /// <summary>
    /// Returns the type definition or reference handle of the attribute type.
    /// </summary>
    /// <returns><see cref="TypeDefinitionHandle"/> or <see cref="TypeReferenceHandle"/> or nil token if the metadata is invalid and the type can't be determined.</returns>
    private GetAttributeTypeRaw(handle: CustomAttributeHandle): EntityHandle {
        const ctor = this.CustomAttributeTable.GetConstructor(handle);

        if (ctor.Kind == HandleKind.MethodDefinition) {
            return this.GetDeclaringType(MethodDefinitionHandle.FromEntityHandle(ctor)).ToEntityHandle();
        }

        if (ctor.Kind == HandleKind.MemberReference) {
            // In general the parent can be MethodDef, ModuleRef, TypeDef, TypeRef, or TypeSpec.
            // For attributes only TypeDef and TypeRef are applicable.
            const typeDefOrRef = this.MemberRefTable.GetClass(MemberReferenceHandle.FromEntityHandle(ctor));
            const handleType = typeDefOrRef.Kind;

            if (handleType == HandleKind.TypeReference || handleType == HandleKind.TypeDefinition) {
                return typeDefOrRef;
            }
        }

        return new EntityHandle(0);
    }
    // #endregion
}