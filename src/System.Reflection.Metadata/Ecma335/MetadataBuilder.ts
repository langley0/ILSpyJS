import assert from "assert";
import { Throw, Guid } from "System";
import { BlobUtilities } from "System.Reflection.Internal";
import { SerializedMetadata } from "./SerializedMetadataHeaps";
import {
    BlobHandle,
    UserStringHandle,
    StringHandle,
    GuidHandle,
} from '../TypeSystem/Handles.TypeSystem';
import { BlobBuilder, } from "../BlobBuilder";
import { BlobDictionary } from "./BlobDictionary";
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
    DocumentRow,
    MethodDebugInformationRow,
    LocalScopeRow,
    LocalVariableRow,
    LocalConstantRow,
    ImportScopeRow,
    StateMachineMethodRow,
    CustomDebugInformationRow,
} from "./MetadataBuilder.Table";

export class MetadataBuilder {
    public GetSerializedMetadata(externalRowCounts: number[], metadataVersionByteCount: number, isStandaloneDebugMetadata: boolean): SerializedMetadata {
        const stringHeapBuilder = new HeapBlobBuilder(this._stringHeapCapacity);
        const stringMap = MetadataBuilder.SerializeStringHeap(stringHeapBuilder, this._strings, this._stringHeapStartOffset);

        assert(HeapIndex.UserString == 0);
        assert(HeapIndex.String == 1);
        assert(HeapIndex.Blob == 2);
        assert(HeapIndex.Guid == 3);

        const heapSizes: ArrayLike<number> = [
            this._userStringBuilder.Length,
            stringHeapBuilder.Length,
            this._blobHeapSize,
            this._guidBuilder.Length];

        const sizes = new MetadataSizes(this.GetRowCounts(), externalRowCounts, heapSizes, metadataVersionByteCount, isStandaloneDebugMetadata);

        return new SerializedMetadata(sizes, stringHeapBuilder, stringMap);
    }

    public static SerializeMetadataHeader(builder: BlobBuilder, metadataVersion: string, sizes: MetadataSizes) {
        // int startOffset = builder.length;

        // // signature
        // builder.WriteUInt32(0x424A5342);

        // // major version
        // builder.WriteUInt16(1);

        // // minor version
        // builder.WriteUInt16(1);

        // // reserved
        // builder.WriteUInt32(0);

        // // Spec (section 24.2.1 Metadata Root):
        // // Length ... Number of bytes allocated to hold version string (including undefined terminator), call this x.
        // //            Call the length of the string (including the terminator) m (we require m <= 255);
        // //            the length x is m rounded up to a multiple of four.
        // builder.WriteInt32(sizes.MetadataVersionPaddedLength);

        // int metadataVersionStart = builder.length;
        // builder.WriteUTF8(metadataVersion);
        // builder.WriteByte(0);
        // int metadataVersionEnd = builder.length;

        // for (int i = 0; i < sizes.MetadataVersionPaddedLength - (metadataVersionEnd - metadataVersionStart); i++)
        // {
        //     builder.WriteByte(0);
        // }

        // // reserved
        // builder.WriteUInt16(0);

        // // number of streams
        // builder.WriteUInt16((ushort)(5 + (sizes.IsEncDelta ? 1 : 0) + (sizes.IsStandaloneDebugMetadata ? 1 : 0)));

        // // stream headers
        // int offsetFromStartOfMetadata = sizes.MetadataHeaderSize;

        // // emit the #Pdb stream first so that only a single page has to be read in order to find out PDB ID
        // if (sizes.IsStandaloneDebugMetadata)
        // {
        //     SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.StandalonePdbStreamSize, "#Pdb", builder);
        // }

        // // Spec: Some compilers store metadata in a #- stream, which holds an uncompressed, or non-optimized, representation of metadata tables;
        // // this includes extra metadata -Ptr tables. Such PE files do not form part of ECMA-335 standard.
        // //
        // // Note: EnC delta is stored as uncompressed metadata stream.
        // SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.MetadataTableStreamSize, (sizes.IsCompressed ? "#~" : "#-"), builder);

        // SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.String), "#Strings", builder);
        // SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.UserString), "#US", builder);
        // SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.Guid), "#GUID", builder);
        // SerializeStreamHeader(ref offsetFromStartOfMetadata, sizes.GetAlignedHeapSize(HeapIndex.Blob), "#Blob", builder);

        // if (sizes.IsEncDelta)
        // {
        //     SerializeStreamHeader(ref offsetFromStartOfMetadata, 0, "#JTD", builder);
        // }

        // int endOffset = builder.length;
        // assert(endOffset - startOffset == sizes.MetadataHeaderSize);
        throw new Error("Not implemented");
    }

    // private static void SerializeStreamHeader(ref int offsetFromStartOfMetadata, int alignedStreamSize, string streamName, BlobBuilder builder)
    // {
    //     // 4 for the first uint (offset), 4 for the second uint (padded size), length of stream name + 1 for undefined terminator (then padded)
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

    //=======================================================================================================
    // TABLE SERIALIZATION
    private static readonly MetadataFormatMajorVersion = 2;
    private static readonly MetadataFormatMinorVersion = 0;


    private _moduleRow?: ModuleRow;
    private _assemblyRow?: AssemblyRow;
    private readonly _classLayoutTable = new Array<ClassLayoutRow>();

    private readonly _constantTable = new Array<ConstantRow>();
    private _constantTableLastParent: number = 0;
    private _constantTableNeedsSorting: boolean = false;

    private readonly _customAttributeTable = new Array<CustomAttributeRow>();
    private _customAttributeTableLastParent: number = 0;
    private _customAttributeTableNeedsSorting: boolean = false;

    private readonly _declSecurityTable = new Array<DeclSecurityRow>();
    private _declSecurityTableLastParent: number = 0;
    private _declSecurityTableNeedsSorting: boolean = false;

    private readonly _encLogTable = new Array<EncLogRow>();
    private readonly _encMapTable = new Array<EncMapRow>();
    private readonly _eventTable = new Array<EventRow>();
    private readonly _eventMapTable = new Array<EventMapRow>();
    private readonly _exportedTypeTable = new Array<ExportedTypeRow>();
    private readonly _fieldLayoutTable = new Array<FieldLayoutRow>();

    private readonly _fieldMarshalTable = new Array<FieldMarshalRow>();
    private _fieldMarshalTableLastParent: number = 0;
    private _fieldMarshalTableNeedsSorting: boolean = false;

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
    private _methodSemanticsTableLastAssociation: number = 0;
    private _methodSemanticsTableNeedsSorting: boolean = false;

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
        const rowCounts = new Array<number>(MetadataTokens.TableCount).fill(0);

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

    public SerializeMetadataTables(
        writer: BlobBuilder,
        metadataSizes: MetadataSizes,
        stringMap: ArrayLike<number>,
        methodBodyStreamRva: number,
        mappedFieldDataStreamRva: number) {
        // int startPosition = writer.Count;

        // SerializeTablesHeader(writer, metadataSizes);

        // if (metadataSizes.IsPresent(TableIndex.Module))
        // {
        //     SerializeModuleTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.TypeRef))
        // {
        //     SerializeTypeRefTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.TypeDef))
        // {
        //     SerializeTypeDefTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.Field))
        // {
        //     SerializeFieldTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.MethodDef))
        // {
        //     SerializeMethodDefTable(writer, stringMap, metadataSizes, methodBodyStreamRva);
        // }

        // if (metadataSizes.IsPresent(TableIndex.Param))
        // {
        //     SerializeParamTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.InterfaceImpl))
        // {
        //     SerializeInterfaceImplTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.MemberRef))
        // {
        //     SerializeMemberRefTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.Constant))
        // {
        //     SerializeConstantTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.CustomAttribute))
        // {
        //     SerializeCustomAttributeTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.FieldMarshal))
        // {
        //     SerializeFieldMarshalTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.DeclSecurity))
        // {
        //     SerializeDeclSecurityTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.ClassLayout))
        // {
        //     SerializeClassLayoutTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.FieldLayout))
        // {
        //     SerializeFieldLayoutTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.StandAloneSig))
        // {
        //     SerializeStandAloneSigTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.EventMap))
        // {
        //     SerializeEventMapTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.Event))
        // {
        //     SerializeEventTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.PropertyMap))
        // {
        //     SerializePropertyMapTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.Property))
        // {
        //     SerializePropertyTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.MethodSemantics))
        // {
        //     SerializeMethodSemanticsTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.MethodImpl))
        // {
        //     SerializeMethodImplTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.ModuleRef))
        // {
        //     SerializeModuleRefTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.TypeSpec))
        // {
        //     SerializeTypeSpecTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.ImplMap))
        // {
        //     SerializeImplMapTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.FieldRva))
        // {
        //     SerializeFieldRvaTable(writer, metadataSizes, mappedFieldDataStreamRva);
        // }

        // if (metadataSizes.IsPresent(TableIndex.EncLog))
        // {
        //     SerializeEncLogTable(writer);
        // }

        // if (metadataSizes.IsPresent(TableIndex.EncMap))
        // {
        //     SerializeEncMapTable(writer);
        // }

        // if (metadataSizes.IsPresent(TableIndex.Assembly))
        // {
        //     SerializeAssemblyTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.AssemblyRef))
        // {
        //     SerializeAssemblyRefTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.File))
        // {
        //     SerializeFileTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.ExportedType))
        // {
        //     SerializeExportedTypeTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.ManifestResource))
        // {
        //     SerializeManifestResourceTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.NestedClass))
        // {
        //     SerializeNestedClassTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.GenericParam))
        // {
        //     SerializeGenericParamTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.MethodSpec))
        // {
        //     SerializeMethodSpecTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.GenericParamConstraint))
        // {
        //     SerializeGenericParamConstraintTable(writer, metadataSizes);
        // }

        // // debug tables
        // if (metadataSizes.IsPresent(TableIndex.Document))
        // {
        //     SerializeDocumentTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.MethodDebugInformation))
        // {
        //     SerializeMethodDebugInformationTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.LocalScope))
        // {
        //     SerializeLocalScopeTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.LocalVariable))
        // {
        //     SerializeLocalVariableTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.LocalConstant))
        // {
        //     SerializeLocalConstantTable(writer, stringMap, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.ImportScope))
        // {
        //     SerializeImportScopeTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.StateMachineMethod))
        // {
        //     SerializeStateMachineMethodTable(writer, metadataSizes);
        // }

        // if (metadataSizes.IsPresent(TableIndex.CustomDebugInformation))
        // {
        //     SerializeCustomDebugInformationTable(writer, metadataSizes);
        // }

        // writer.WriteByte(0);
        // writer.Align(4);

        // int endPosition = writer.Count;
        // assert(metadataSizes.MetadataTableStreamSize == endPosition - startPosition);
        throw new Error("Not implemented");
    }

    //=======================================================================================================
    // HEAP MANAGEMENT

    private readonly _strings = new Map<string, StringHandle>();
    private readonly _stringHeapStartOffset: number = 0;
    private _stringHeapCapacity: number = 4 * 1024;

    private static readonly UserStringHeapSizeLimit = 0x01000000;
    private readonly _userStrings = new Map<string, UserStringHandle>();
    private readonly _userStringBuilder = new HeapBlobBuilder(4 * 1024);
    private readonly _userStringHeapStartOffset: number = 0;

    // #String heap
    // #Blob heap
    private readonly _blobs = new BlobDictionary(1024);
    private readonly _blobHeapStartOffset: number = 0;
    private _blobHeapSize: number = 0;

    // #GUID heap
    private readonly _guids = new Map<Guid, GuidHandle>();
    private readonly _guidBuilder = new HeapBlobBuilder(16); // full metadata has just a single guid

    public WriteHeapsTo(builder: BlobBuilder, stringHeap: BlobBuilder) {
        // WriteAligned(stringHeap, builder);
        // WriteAligned(_userStringBuilder, builder);
        // WriteAligned(_guidBuilder, builder);
        // WriteAlignedBlobHeap(builder);
        throw new Error("Not implemented");
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
        const stringVirtualIndexToHeapOffsetMap = new Array(totalCount).fill(0);
        stringVirtualIndexToHeapOffsetMap[0] = 0;
        heapBuilder.WriteByte(0);

        // Find strings that can be folded
        let prev = "";
        for (const entry of sorted) {
            const [Key, Value] = entry;
            const position = stringHeapStartOffset + heapBuilder.Length;

            // It is important to use ordinal comparison otherwise we'll use the current culture!
            if (prev.endsWith(Key) && !BlobUtilities.IsLowSurrogateChar(Key.charCodeAt(0))) {
                // Map over the tail of prev string. Watch for undefined-terminator of prev string.
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

    //=======================================================================================================
    // VALIDATION
    public ValidateOrder() {
        // Certain tables are required to be sorted by a primary key, as follows:
        //
        // Table                    Keys                                Auto-ordered
        // --------------------------------------------------------------------------
        // ClassLayout              Parent                              No*
        // Constant                 Parent                              Yes
        // CustomAttribute          Parent                              Yes
        // DeclSecurity             Parent                              Yes
        // FieldLayout              Field                               No*
        // FieldMarshal             Parent                              Yes
        // FieldRVA                 Field                               No*
        // GenericParam             Owner, Number                       No**
        // GenericParamConstraint   Owner                               No**
        // ImplMap                  MemberForwarded                     No*
        // InterfaceImpl            Class                               No**
        // MethodImpl               Class                               No*
        // MethodSemantics          Association                         Yes
        // NestedClass              NestedClass                         No*
        // LocalScope               Method, StartOffset, Length (desc)  No**
        // StateMachineMethod       MoveNextMethod                      No*
        // CustomDebugInformation   Parent                              Yes
        //
        // Tables of entities that can't be referenced from other tables or blobs
        // are automatically ordered during serialization and thus don't require validation.
        //
        // * We could potentially auto-order these. These tables are adding extra (optional)
        // information to a primary entity (TypeDef, FiledDef, etc.) and are thus easily emitted
        // in the same order as the parent entity. Hence they would usually be ordered already and
        // it would be extra overhead to order them. Let's just required them ordered.
        //
        // ** We can't easily automatically order these since they represent entities that can be referenced
        // by other tables/blobs (e.g. CustomAttribute and CustomDebugInformation). Ordering these tables
        // would require updating all references.

        this.ValidateClassLayoutTable();
        this.ValidateFieldLayoutTable();
        this.ValidateFieldRvaTable();
        this.ValidateGenericParamTable();
        this.ValidateGenericParamConstaintTable();
        this.ValidateImplMapTable();
        this.ValidateInterfaceImplTable();
        this.ValidateMethodImplTable();
        this.ValidateNestedClassTable();
        this.ValidateLocalScopeTable();
        this.ValidateStateMachineMethodTable();
    }

    private ValidateClassLayoutTable() {
        for (let i = 1; i < this._classLayoutTable.length; i++) {
            if (this._classLayoutTable[i - 1].Parent >= this._classLayoutTable[i].Parent) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.ClassLayout);
            }
        }
    }

    private ValidateFieldLayoutTable() {
        for (let i = 1; i < this._fieldLayoutTable.length; i++) {
            if (this._fieldLayoutTable[i - 1].Field >= this._fieldLayoutTable[i].Field) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.FieldLayout);
            }
        }
    }

    private ValidateFieldRvaTable() {
        for (let i = 1; i < this._fieldRvaTable.length; i++) {
            // Spec: each row in the FieldRVA table is an extension to exactly one row in the Field table
            if (this._fieldRvaTable[i - 1].Field >= this._fieldRvaTable[i].Field) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.FieldRva);
            }
        }
    }

    private ValidateGenericParamTable() {
        if (this._genericParamTable.length == 0) {
            return;
        }

        let current = this._genericParamTable[0];
        let previous = current;

        for (let i = 1; i < this._genericParamTable.length; i++, previous = current) {
            current = this._genericParamTable[i];

            if (current.Owner > previous.Owner) {
                continue;
            }

            if (previous.Owner == current.Owner && current.Number > previous.Number) {
                continue;
            }

            Throw.InvalidOperation_TableNotSorted(TableIndex.GenericParam);
        }
    }

    private ValidateGenericParamConstaintTable() {
        for (let i = 1; i < this._genericParamConstraintTable.length; i++) {
            if (this._genericParamConstraintTable[i - 1].Owner > this._genericParamConstraintTable[i].Owner) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.GenericParamConstraint);
            }
        }
    }

    private ValidateImplMapTable() {
        for (let i = 1; i < this._implMapTable.length; i++) {
            if (this._implMapTable[i - 1].MemberForwarded >= this._implMapTable[i].MemberForwarded) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.ImplMap);
            }
        }
    }

    private ValidateInterfaceImplTable() {
        for (let i = 1; i < this._interfaceImplTable.length; i++) {
            if (this._interfaceImplTable[i - 1].Class > this._interfaceImplTable[i].Class) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.InterfaceImpl);
            }
        }
    }

    private ValidateMethodImplTable() {
        for (let i = 1; i < this._methodImplTable.length; i++) {
            if (this._methodImplTable[i - 1].Class > this._methodImplTable[i].Class) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.MethodImpl);
            }
        }
    }

    private ValidateNestedClassTable() {
        for (let i = 1; i < this._nestedClassTable.length; i++) {
            if (this._nestedClassTable[i - 1].NestedClass >= this._nestedClassTable[i].NestedClass) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.NestedClass);
            }
        }
    }

    private ValidateLocalScopeTable() {
        if (this._localScopeTable.length == 0) {
            return;
        }

        // Spec: The table is required to be sorted first by Method in ascending order,
        // then by StartOffset in ascending order, then by Length in descending order.
        let current = this._localScopeTable[0];
        let previous = current;
        for (let i = 1; i < this._localScopeTable.length; i++, previous = current) {
            current = this._localScopeTable[i];

            if (current.Method > previous.Method) {
                continue;
            }

            if (current.Method == previous.Method) {
                if (current.StartOffset > previous.StartOffset) {
                    continue;
                }

                if (current.StartOffset == previous.StartOffset && previous.Length >= current.Length) {
                    continue;
                }
            }

            Throw.InvalidOperation_TableNotSorted(TableIndex.LocalScope);
        }
    }

    private ValidateStateMachineMethodTable() {
        for (let i = 1; i < this._stateMachineMethodTable.length; i++) {
            if (this._stateMachineMethodTable[i - 1].MoveNextMethod >= this._stateMachineMethodTable[i].MoveNextMethod) {
                Throw.InvalidOperation_TableNotSorted(TableIndex.StateMachineMethod);
            }
        }
    }
}