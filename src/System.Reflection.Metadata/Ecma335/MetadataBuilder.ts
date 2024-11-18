import assert from "assert";
import { Throw } from "System";
import { BlobUtilities } from "System.Reflection";
import { SerializedMetadata } from "./SerializedMetadataHeaps";
import {
    BlobHandle,
    StringHandle,
    GuidHandle,
} from '../TypeSystem/Handles.TypeSystem';
import { BlobBuilder, } from "../BlobBuilder";
import { MetadataSizes } from "./MetadataSizes";
import { MetadataTokens } from "./MetadataTokens";
import { TableIndex } from "./TableIndex";
import { HeapIndex } from "./HeapIndex";
import {
    HeapBlobBuilder,
    StringSort,
    SuffixSort,
} from "./MetadataBuilder.Heaps";
import {
    ModuleRow,
    AssemblyRow,
    AssemblyRefTableRow,
    ClassLayoutRow,
    ConstantRow,
    CustomAttributeRow,
    DeclSecurityRow,
    EncLogRow,
    EncMapRow,
    EventRow,
    EventMapRow,
    ExportedTypeRow,
    FieldLayoutRow,
    FieldMarshalRow,
    FieldRvaRow,
    FieldDefRow,
    FileTableRow,
    GenericParamConstraintRow,
    GenericParamRow,
    ImplMapRow,
    InterfaceImplRow,
    ManifestResourceRow,
    MemberRefRow,
    MethodImplRow,
    MethodSemanticsRow,
    MethodSpecRow,
    MethodRow,
    ModuleRefRow,
    NestedClassRow,
    ParamRow,
    PropertyMapRow,
    PropertyRow,
    StandaloneSigRow,
    TypeDefRow,
    TypeRefRow,
    TypeSpecRow,
} from "./MetadataBuilder.Table";

export class MetadataBuilder {
    public GetSerializedMetadata(externalRowCounts: number[], metadataVersionByteCount: number, isStandaloneDebugMetadata: boolean): SerializedMetadata {
        var stringHeapBuilder = new HeapBlobBuilder(this._stringHeapCapacity);
        var stringMap = MetadataBuilder.SerializeStringHeap(stringHeapBuilder, this._strings, this._stringHeapStartOffset);

        assert(HeapIndex.UserString == 0);
        assert(HeapIndex.String == 1);
        assert(HeapIndex.Blob == 2);
        assert(HeapIndex.Guid == 3);

        // ??????
        var heapSizes = ImmutableArray.Create(
            _userStringBuilder.length,
            stringHeapBuilder.length,
            _blobHeapSize,
            _guidBuilder.length);

        var sizes = new MetadataSizes(this.GetRowCounts(), externalRowCounts, heapSizes, metadataVersionByteCount, isStandaloneDebugMetadata);

        return new SerializedMetadata(sizes, stringHeapBuilder, stringMap);
    }

    // internal static void SerializeMetadataHeader(BlobBuilder builder, string metadataVersion, MetadataSizes sizes)
    // {
    //     int startOffset = builder.length;

    //     // signature
    //     builder.WriteUInt32(0x424A5342);

    //     // major version
    //     builder.WriteUInt16(1);

    //     // minor version
    //     builder.WriteUInt16(1);

    //     // reserved
    //     builder.WriteUInt32(0);

    //     // Spec (section 24.2.1 Metadata Root):
    //     // Length ... Number of bytes allocated to hold version string (including null terminator), call this x.
    //     //            Call the length of the string (including the terminator) m (we require m <= 255);
    //     //            the length x is m rounded up to a multiple of four.
    //     builder.WriteInt32(sizes.MetadataVersionPaddedLength);

    //     int metadataVersionStart = builder.length;
    //     builder.WriteUTF8(metadataVersion);
    //     builder.WriteByte(0);
    //     int metadataVersionEnd = builder.length;

    //     for (int i = 0; i < sizes.MetadataVersionPaddedLength - (metadataVersionEnd - metadataVersionStart); i++)
    //     {
    //         builder.WriteByte(0);
    //     }

    //     // reserved
    //     builder.WriteUInt16(0);

    //     // number of streams
    //     builder.WriteUInt16((ushort)(5 + (sizes.IsEncDelta ? 1 : 0) + (sizes.IsStandaloneDebugMetadata ? 1 : 0)));

    //     // stream headers
    //     int offsetFromStartOfMetadata = sizes.MetadataHeaderSize;

    //     // emit the #Pdb stream first so that only a single page has to be read in order to find out PDB ID
    //     if (sizes.IsStandaloneDebugMetadata)
    //     {
    //         SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.StandalonePdbStreamSize, "#Pdb", builder);
    //     }

    //     // Spec: Some compilers store metadata in a #- stream, which holds an uncompressed, or non-optimized, representation of metadata tables;
    //     // this includes extra metadata -Ptr tables. Such PE files do not form part of ECMA-335 standard.
    //     //
    //     // Note: EnC delta is stored as uncompressed metadata stream.
    //     SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.MetadataTableStreamSize, (sizes.IsCompressed ? "#~" : "#-"), builder);

    //     SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.String), "#Strings", builder);
    //     SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.UserString), "#US", builder);
    //     SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.Guid), "#GUID", builder);
    //     SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.Blob), "#Blob", builder);

    //     if (sizes.IsEncDelta)
    //     {
    //         SerializeStreamHeader(ref offsetFromStartOfMetadata, 0, "#JTD", builder);
    //     }

    //     int endOffset = builder.length;
    //     Debug.Assert(endOffset - startOffset == sizes.MetadataHeaderSize);
    // }

    // private static void SerializeStreamHeader(ref int offsetFromStartOfMetadata, int alignedStreamSize, string streamName, BlobBuilder builder)
    // {
    //     // 4 for the first uint (offset), 4 for the second uint (padded size), length of stream name + 1 for null terminator (then padded)
    //     int sizeOfStreamHeader = MetadataSizes.GetMetadataStreamHeaderSize(streamName);
    //     builder.WriteInt32(offsetFromStartOfMetadata);
    //     builder.WriteInt32(alignedStreamSize);
    //     foreach (char ch in streamName)
    //     {
    //         builder.WriteByte((byte)ch);
    //     }

    //     // After offset, size, and stream name, write 0-bytes until we reach our padded size.
    //     for (uint i = 8 + (uint)streamName.Length; i < sizeOfStreamHeader; i++)
    //     {
    //         builder.WriteByte(0);
    //     }

    //     offsetFromStartOfMetadata += alignedStreamSize;
    // }

    private readonly _strings = new Map<string, StringHandle>();
    private readonly _stringHeapStartOffset: number = 0;
    private _stringHeapCapacity: number = 4 * 1024;



    private static readonly MetadataFormatMajorVersion = 2;
    private static readonly MetadataFormatMinorVersion = 0;


    private _moduleRow?: ModuleRow;
    private _assemblyRow?: AssemblyRow;
    private readonly _classLayoutTable = new Array<ClassLayoutRow>();

    private readonly _constantTable = new Array<ConstantRow>();
    private _constantTableLastParent: number;
    private _constantTableNeedsSorting: boolean;

    private readonly _customAttributeTable = new Array<CustomAttributeRow>();
    private _customAttributeTableLastParent: number;
    private _customAttributeTableNeedsSorting: boolean;

    private readonly _declSecurityTable = new Array<DeclSecurityRow>();
    private _declSecurityTableLastParent: number;
    private _declSecurityTableNeedsSorting: boolean;

    private readonly _encLogTable = new Array<EncLogRow>();
    private readonly _encMapTable = new Array<EncMapRow>();
    private readonly _eventTable = new Array<EventRow>();
    private readonly _eventMapTable = new Array<EventMapRow>();
    private readonly _exportedTypeTable = new Array<ExportedTypeRow>();
    private readonly _fieldLayoutTable = new Array<FieldLayoutRow>();

    private readonly _fieldMarshalTable = new Array<FieldMarshalRow>();
    private _fieldMarshalTableLastParent: number;
    private _fieldMarshalTableNeedsSorting: boolean;

    private readonly _fieldRvaTable = new Array<FieldRvaRow>();
    private readonly _fieldTable = new Array<FieldDefRow>();
    private readonly _fileTable = new Array<FileTableRow>();
    private readonly _genericParamConstraintTable = new Array<GenericParamConstraintRow>();
    private readonly _genericParamTable = new Array<GenericParamRow>();
    private readonly _implMapTable = new Array<ImplMapRow>();
    private readonly _interfaceImplTable = new Array<InterfaceImplRow>();
    private readonly _manifestResourceTable = new Array<ManifestResourceRow>();
    private readonly _memberRefTable = new Array<MemberRefRow>();
    private readonly _methodImplTable = new Array<MethodImplRow>();

    private readonly _methodSemanticsTable = new Array<MethodSemanticsRow>();
    private _methodSemanticsTableLastAssociation: number;
    private _methodSemanticsTableNeedsSorting: boolean;

    private readonly _methodSpecTable = new Array<MethodSpecRow>();
    private readonly _methodDefTable = new Array<MethodRow>();
    private readonly _moduleRefTable = new Array<ModuleRefRow>();
    private readonly _nestedClassTable = new Array<NestedClassRow>();
    private readonly _paramTable = new Array<ParamRow>();
    private readonly _propertyMapTable = new Array<PropertyMapRow>();
    private readonly _propertyTable = new Array<PropertyRow>();
    private readonly _typeDefTable = new Array<TypeDefRow>();
    private readonly _typeRefTable = new Array<TypeRefRow>();
    private readonly _typeSpecTable = new Array<TypeSpecRow>();
    private readonly _assemblyRefTable = new Array<AssemblyRefTableRow>();
    private readonly _standAloneSigTable = new Array<StandaloneSigRow>();

    // debug tables:
    private readonly _documentTable = new Array<DocumentRow>();
    private readonly _methodDebugInformationTable = new Array<MethodDebugInformationRow>();
    private readonly _localScopeTable = new Array<LocalScopeRow>();
    private readonly _localVariableTable = new Array<LocalVariableRow>();
    private readonly _localConstantTable = new Array<LocalConstantRow>();
    private readonly _importScopeTable = new Array<ImportScopeRow>();
    private readonly _stateMachineMethodTable = new Array<StateMachineMethodRow>();
    private readonly _customDebugInformationTable = new Array<CustomDebugInformationRow>();



    public GetRowCount(table: TableIndex): number {
        switch (table) {
            case TableIndex.Assembly: return this._assemblyRow !== undefined ? 1 : 0;
            case TableIndex.AssemblyRef: return this._assemblyRefTable.length;
            case TableIndex.ClassLayout: return this._classLayoutTable.length;
            case TableIndex.Constant: return this._constantTable.length;
            case TableIndex.CustomAttribute: return this._customAttributeTable.length;
            case TableIndex.DeclSecurity: return this._declSecurityTable.length;
            case TableIndex.EncLog: return this._encLogTable.length;
            case TableIndex.EncMap: return this._encMapTable.length;
            case TableIndex.EventMap: return this._eventMapTable.length;
            case TableIndex.Event: return this._eventTable.length;
            case TableIndex.ExportedType: return this._exportedTypeTable.length;
            case TableIndex.FieldLayout: return this._fieldLayoutTable.length;
            case TableIndex.FieldMarshal: return this._fieldMarshalTable.length;
            case TableIndex.FieldRva: return this._fieldRvaTable.length;
            case TableIndex.Field: return this._fieldTable.length;
            case TableIndex.File: return this._fileTable.length;
            case TableIndex.GenericParamConstraint: return this._genericParamConstraintTable.length;
            case TableIndex.GenericParam: return this._genericParamTable.length;
            case TableIndex.ImplMap: return this._implMapTable.length;
            case TableIndex.InterfaceImpl: return this._interfaceImplTable.length;
            case TableIndex.ManifestResource: return this._manifestResourceTable.length;
            case TableIndex.MemberRef: return this._memberRefTable.length;
            case TableIndex.MethodImpl: return this._methodImplTable.length;
            case TableIndex.MethodSemantics: return this._methodSemanticsTable.length;
            case TableIndex.MethodSpec: return this._methodSpecTable.length;
            case TableIndex.MethodDef: return this._methodDefTable.length;
            case TableIndex.ModuleRef: return this._moduleRefTable.length;
            case TableIndex.Module: return this._moduleRow !== undefined ? 1 : 0;
            case TableIndex.NestedClass: return this._nestedClassTable.length;
            case TableIndex.Param: return this._paramTable.length;
            case TableIndex.PropertyMap: return this._propertyMapTable.length;
            case TableIndex.Property: return this._propertyTable.length;
            case TableIndex.StandAloneSig: return this._standAloneSigTable.length;
            case TableIndex.TypeDef: return this._typeDefTable.length;
            case TableIndex.TypeRef: return this._typeRefTable.length;
            case TableIndex.TypeSpec: return this._typeSpecTable.length;
            case TableIndex.Document: return this._documentTable.length;
            case TableIndex.MethodDebugInformation: return this._methodDebugInformationTable.length;
            case TableIndex.LocalScope: return this._localScopeTable.length;
            case TableIndex.LocalVariable: return this._localVariableTable.length;
            case TableIndex.LocalConstant: return this._localConstantTable.length;
            case TableIndex.StateMachineMethod: return this._stateMachineMethodTable.length;
            case TableIndex.ImportScope: return this._importScopeTable.length;
            case TableIndex.CustomDebugInformation: return this._customDebugInformationTable.length;

            case TableIndex.AssemblyOS:
            case TableIndex.AssemblyProcessor:
            case TableIndex.AssemblyRefOS:
            case TableIndex.AssemblyRefProcessor:
            case TableIndex.EventPtr:
            case TableIndex.FieldPtr:
            case TableIndex.MethodPtr:
            case TableIndex.ParamPtr:
            case TableIndex.PropertyPtr:
                return 0;

            default:
                Throw.ArgumentOutOfRange("table");
        }
    }

    /// <summary>
    /// Returns the current number of entries in each table.
    /// </summary>
    /// <returns>
    /// An array of size <see cref="MetadataTokens.TableCount"/> with each item filled with the current row count of the corresponding table.
    /// </returns>
    public GetRowCounts(): ArrayLike<number> {
        const rowCounts = new Array<number>(MetadataTokens.TableCount);

        rowCounts[TableIndex.Assembly] = this._assemblyRow !== undefined ? 1 : 0;
        rowCounts[TableIndex.AssemblyRef] = this._assemblyRefTable.length;
        rowCounts[TableIndex.ClassLayout] = this._classLayoutTable.length;
        rowCounts[TableIndex.Constant] = this._constantTable.length;
        rowCounts[TableIndex.CustomAttribute] = this._customAttributeTable.length;
        rowCounts[TableIndex.DeclSecurity] = this._declSecurityTable.length;
        rowCounts[TableIndex.EncLog] = this._encLogTable.length;
        rowCounts[TableIndex.EncMap] = this._encMapTable.length;
        rowCounts[TableIndex.EventMap] = this._eventMapTable.length;
        rowCounts[TableIndex.Event] = this._eventTable.length;
        rowCounts[TableIndex.ExportedType] = this._exportedTypeTable.length;
        rowCounts[TableIndex.FieldLayout] = this._fieldLayoutTable.length;
        rowCounts[TableIndex.FieldMarshal] = this._fieldMarshalTable.length;
        rowCounts[TableIndex.FieldRva] = this._fieldRvaTable.length;
        rowCounts[TableIndex.Field] = this._fieldTable.length;
        rowCounts[TableIndex.File] = this._fileTable.length;
        rowCounts[TableIndex.GenericParamConstraint] = this._genericParamConstraintTable.length;
        rowCounts[TableIndex.GenericParam] = this._genericParamTable.length;
        rowCounts[TableIndex.ImplMap] = this._implMapTable.length;
        rowCounts[TableIndex.InterfaceImpl] = this._interfaceImplTable.length;
        rowCounts[TableIndex.ManifestResource] = this._manifestResourceTable.length;
        rowCounts[TableIndex.MemberRef] = this._memberRefTable.length;
        rowCounts[TableIndex.MethodImpl] = this._methodImplTable.length;
        rowCounts[TableIndex.MethodSemantics] = this._methodSemanticsTable.length;
        rowCounts[TableIndex.MethodSpec] = this._methodSpecTable.length;
        rowCounts[TableIndex.MethodDef] = this._methodDefTable.length;
        rowCounts[TableIndex.ModuleRef] = this._moduleRefTable.length;
        rowCounts[TableIndex.Module] = this._moduleRow !== undefined ? 1 : 0;
        rowCounts[TableIndex.NestedClass] = this._nestedClassTable.length;
        rowCounts[TableIndex.Param] = this._paramTable.length;
        rowCounts[TableIndex.PropertyMap] = this._propertyMapTable.length;
        rowCounts[TableIndex.Property] = this._propertyTable.length;
        rowCounts[TableIndex.StandAloneSig] = this._standAloneSigTable.length;
        rowCounts[TableIndex.TypeDef] = this._typeDefTable.length;
        rowCounts[TableIndex.TypeRef] = this._typeRefTable.length;
        rowCounts[TableIndex.TypeSpec] = this._typeSpecTable.length;

        rowCounts[TableIndex.Document] = this._documentTable.length;
        rowCounts[TableIndex.MethodDebugInformation] = this._methodDebugInformationTable.length;
        rowCounts[TableIndex.LocalScope] = this._localScopeTable.length;
        rowCounts[TableIndex.LocalVariable] = this._localVariableTable.length;
        rowCounts[TableIndex.LocalConstant] = this._localConstantTable.length;
        rowCounts[TableIndex.StateMachineMethod] = this._stateMachineMethodTable.length;
        rowCounts[TableIndex.ImportScope] = this._importScopeTable.length;
        rowCounts[TableIndex.CustomDebugInformation] = this._customDebugInformationTable.length;

        return rowCounts;
    }

    /// <summary>
    /// Fills in stringIndexMap with data from stringIndex and write to stringWriter.
    /// Releases stringIndex as the stringTable is sealed after this point.
    /// </summary>
    static SerializeStringHeap(
        heapBuilder: BlobBuilder,
        strings: Map<string, StringHandle>,
        stringHeapStartOffset: number): number[] {
        // Sort by suffix and remove stringIndex
        const sorted: [string, StringHandle][] = Object.keys(strings)
            .sort(StringSort)
            .sort(SuffixSort)
            .map((key: string) => [key, strings.get(key)!]);

        // Create VirtIdx to Idx map and add entry for empty string
        const totalCount = sorted.length + 1;
        var stringVirtualIndexToHeapOffsetMap = new Array(totalCount).fill(0);
        stringVirtualIndexToHeapOffsetMap[0] = 0;
        heapBuilder.WriteByte(0);

        // Find strings that can be folded
        let prev = "";
        for (const entry of sorted) {
            const [Key, Value] = entry;
            const position = stringHeapStartOffset + heapBuilder.Length;

            // It is important to use ordinal comparison otherwise we'll use the current culture!
            if (prev.endsWith(Key) && !BlobUtilities.IsLowSurrogateChar(Key[0])) {
                // Map over the tail of prev string. Watch for null-terminator of prev string.
                stringVirtualIndexToHeapOffsetMap[Value.GetWriterVirtualIndex()] = position - (BlobUtilities.GetUTF8ByteCount(Key) + 1);
            }
            else {
                stringVirtualIndexToHeapOffsetMap[Value.GetWriterVirtualIndex()] = position;
                heapBuilder.WriteUTF8(Key, false);
                heapBuilder.WriteByte(0);
            }

            prev = Key;
        }

        return stringVirtualIndexToHeapOffsetMap;
    }
}