import assert from "assert";
import { Throw, sizeof } from "System";
import { BitArithmetic } from "System.Reflection";
import { TableIndex } from "./TableIndex";
import { HeapIndex } from "./HeapIndex";
import { MetadataTokens } from "./MetadataTokens";


export class MetadataSizes {
    private static StreamAlignment = 4;

    // // Call the length of the string (including the terminator) m (we require m <= 255);
    public static readonly MaxMetadataVersionByteCount = 0xff - 1;

    public readonly MetadataVersionPaddedLength;

    public static readonly SortedTypeSystemTables =
        BitArithmetic.SetBit64(TableIndex.InterfaceImpl) +
        BitArithmetic.SetBit64(TableIndex.Constant) +
        BitArithmetic.SetBit64(TableIndex.CustomAttribute) +
        BitArithmetic.SetBit64(TableIndex.FieldMarshal) +
        BitArithmetic.SetBit64(TableIndex.DeclSecurity) +
        BitArithmetic.SetBit64(TableIndex.ClassLayout) +
        BitArithmetic.SetBit64(TableIndex.FieldLayout) +
        BitArithmetic.SetBit64(TableIndex.MethodSemantics) +
        BitArithmetic.SetBit64(TableIndex.MethodImpl) +
        BitArithmetic.SetBit64(TableIndex.ImplMap) +
        BitArithmetic.SetBit64(TableIndex.FieldRva) +
        BitArithmetic.SetBit64(TableIndex.NestedClass) +
        BitArithmetic.SetBit64(TableIndex.GenericParam) +
        BitArithmetic.SetBit64(TableIndex.GenericParamConstraint);

    public static readonly SortedDebugTables =
        BitArithmetic.SetBit64(TableIndex.LocalScope) +
        BitArithmetic.SetBit64(TableIndex.StateMachineMethod) +
        BitArithmetic.SetBit64(TableIndex.CustomDebugInformation);

    public readonly IsEncDelta: boolean;
    public readonly IsCompressed: boolean;

    public readonly BlobReferenceIsSmall: boolean;
    public readonly StringReferenceIsSmall: boolean;
    public readonly GuidReferenceIsSmall: boolean;
    public readonly CustomAttributeTypeCodedIndexIsSmall: boolean;
    public readonly DeclSecurityCodedIndexIsSmall: boolean;
    public readonly EventDefReferenceIsSmall: boolean;
    public readonly FieldDefReferenceIsSmall: boolean;
    public readonly GenericParamReferenceIsSmall: boolean;
    public readonly HasConstantCodedIndexIsSmall: boolean;
    public readonly HasCustomAttributeCodedIndexIsSmall: boolean;
    public readonly HasFieldMarshalCodedIndexIsSmall: boolean;
    public readonly HasSemanticsCodedIndexIsSmall: boolean;
    public readonly ImplementationCodedIndexIsSmall: boolean;
    public readonly MemberForwardedCodedIndexIsSmall: boolean;
    public readonly MemberRefParentCodedIndexIsSmall: boolean;
    public readonly MethodDefReferenceIsSmall: boolean;
    public readonly MethodDefOrRefCodedIndexIsSmall: boolean;
    public readonly ModuleRefReferenceIsSmall: boolean;
    public readonly ParameterReferenceIsSmall: boolean;
    public readonly PropertyDefReferenceIsSmall: boolean;
    public readonly ResolutionScopeCodedIndexIsSmall: boolean;
    public readonly TypeDefReferenceIsSmall: boolean;
    public readonly TypeDefOrRefCodedIndexIsSmall: boolean;
    public readonly TypeOrMethodDefCodedIndexIsSmall: boolean;

    public readonly DocumentReferenceIsSmall: boolean;
    public readonly LocalVariableReferenceIsSmall: boolean;
    public readonly LocalConstantReferenceIsSmall: boolean;
    public readonly ImportScopeReferenceIsSmall: boolean;
    public readonly HasCustomDebugInformationCodedIndexIsSmall: boolean;

    /// <summary>
    /// Exact (unaligned) heap sizes.
    /// </summary>
    /// <remarks>Use <see cref="GetAlignedHeapSize(HeapIndex)"/> to get an aligned heap size.</remarks>
    public readonly HeapSizes: ArrayLike<number>;

    /// <summary>
    /// Table row counts.
    /// </summary>
    public readonly RowCounts: ArrayLike<number>;

    /// <summary>
    /// External table row counts.
    /// </summary>
    public readonly ExternalRowCounts: ArrayLike<number>;

    /// <summary>
    /// Non-empty tables that are emitted into the metadata table stream.
    /// </summary>
    public readonly PresentTablesMask: bigint;

    /// <summary>
    /// Non-empty tables stored in an external metadata table stream that might be referenced from the metadata table stream being emitted.
    /// </summary>
    public readonly ExternalTablesMask: bigint;

    /// <summary>
    /// Overall size of metadata stream storage (stream headers, table stream, heaps, additional streams).
    /// Aligned to <see cref="StreamAlignment"/>.
    /// </summary>
    public readonly MetadataStreamStorageSize: number;

    /// <summary>
    /// The size of metadata stream (#- or #~). Aligned.
    /// Aligned to <see cref="StreamAlignment"/>.
    /// </summary>
    public readonly MetadataTableStreamSize: number;

    /// <summary>
    /// The size of #Pdb stream. Aligned.
    /// </summary>
    public readonly StandalonePdbStreamSize: number;

    public constructor(
        rowCounts: ArrayLike<number>,
        externalRowCounts: ArrayLike<number>,
        heapSizes: ArrayLike<number>,
        metadataVersionByteCount: number,
        isStandaloneDebugMetadata: boolean) {
        assert(rowCounts.length == MetadataTokens.TableCount);
        assert(externalRowCounts.length == MetadataTokens.TableCount);
        assert(heapSizes.length == MetadataTokens.HeapCount);

        this.RowCounts = rowCounts;
        this.ExternalRowCounts = externalRowCounts;
        this.HeapSizes = heapSizes;

        // +1 for NUL terminator
        this.MetadataVersionPaddedLength = BitArithmetic.Align32(metadataVersionByteCount + 1, 4);

        this.PresentTablesMask = this.ComputeNonEmptyTableMask(rowCounts);
        this.ExternalTablesMask = this.ComputeNonEmptyTableMask(externalRowCounts);

        // Auto-detect EnC delta from presence of EnC tables.
        // EnC delta tables are stored as uncompressed metadata table stream, other metadata use compressed stream.
        // We could support uncompress non-EnC metadata in future if we needed to.
        const isEncDelta = this.IsPresent(TableIndex.EncLog) || this.IsPresent(TableIndex.EncMap);
        const isCompressed = !isEncDelta;

        this.IsEncDelta = isEncDelta;
        this.IsCompressed = isCompressed;

        const ushort_MaxValue = 65535;

        this.BlobReferenceIsSmall = isCompressed && heapSizes[HeapIndex.Blob] <= ushort_MaxValue;
        this.StringReferenceIsSmall = isCompressed && heapSizes[HeapIndex.String] <= ushort_MaxValue;
        this.GuidReferenceIsSmall = isCompressed && heapSizes[HeapIndex.Guid] <= ushort_MaxValue;

        // table can either be present or external, it can't be both:
        assert(BitArithmetic.And64(this.PresentTablesMask, this.ExternalTablesMask) == BigInt(0));

        this.CustomAttributeTypeCodedIndexIsSmall = this.IsReferenceSmall(3, TableIndex.MethodDef, TableIndex.MemberRef);
        this.DeclSecurityCodedIndexIsSmall = this.IsReferenceSmall(2, TableIndex.MethodDef, TableIndex.TypeDef);
        this.EventDefReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.Event);
        this.FieldDefReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.Field);
        this.GenericParamReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.GenericParam);
        this.HasConstantCodedIndexIsSmall = this.IsReferenceSmall(2, TableIndex.Field, TableIndex.Param, TableIndex.Property);

        this.HasCustomAttributeCodedIndexIsSmall = this.IsReferenceSmall(5,
            TableIndex.MethodDef,
            TableIndex.Field,
            TableIndex.TypeRef,
            TableIndex.TypeDef,
            TableIndex.Param,
            TableIndex.InterfaceImpl,
            TableIndex.MemberRef,
            TableIndex.Module,
            TableIndex.DeclSecurity,
            TableIndex.Property,
            TableIndex.Event,
            TableIndex.StandAloneSig,
            TableIndex.ModuleRef,
            TableIndex.TypeSpec,
            TableIndex.Assembly,
            TableIndex.AssemblyRef,
            TableIndex.File,
            TableIndex.ExportedType,
            TableIndex.ManifestResource,
            TableIndex.GenericParam,
            TableIndex.GenericParamConstraint,
            TableIndex.MethodSpec);

        this.HasFieldMarshalCodedIndexIsSmall = this.IsReferenceSmall(1, TableIndex.Field, TableIndex.Param);
        this.HasSemanticsCodedIndexIsSmall = this.IsReferenceSmall(1, TableIndex.Event, TableIndex.Property);
        this.ImplementationCodedIndexIsSmall = this.IsReferenceSmall(2, TableIndex.File, TableIndex.AssemblyRef, TableIndex.ExportedType);
        this.MemberForwardedCodedIndexIsSmall = this.IsReferenceSmall(1, TableIndex.Field, TableIndex.MethodDef);
        this.MemberRefParentCodedIndexIsSmall = this.IsReferenceSmall(3, TableIndex.TypeDef, TableIndex.TypeRef, TableIndex.ModuleRef, TableIndex.MethodDef, TableIndex.TypeSpec);
        this.MethodDefReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.MethodDef);
        this.MethodDefOrRefCodedIndexIsSmall = this.IsReferenceSmall(1, TableIndex.MethodDef, TableIndex.MemberRef);
        this.ModuleRefReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.ModuleRef);
        this.ParameterReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.Param);
        this.PropertyDefReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.Property);
        this.ResolutionScopeCodedIndexIsSmall = this.IsReferenceSmall(2, TableIndex.Module, TableIndex.ModuleRef, TableIndex.AssemblyRef, TableIndex.TypeRef);
        this.TypeDefReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.TypeDef);
        this.TypeDefOrRefCodedIndexIsSmall = this.IsReferenceSmall(2, TableIndex.TypeDef, TableIndex.TypeRef, TableIndex.TypeSpec);
        this.TypeOrMethodDefCodedIndexIsSmall = this.IsReferenceSmall(1, TableIndex.TypeDef, TableIndex.MethodDef);

        this.DocumentReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.Document);
        this.LocalVariableReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.LocalVariable);
        this.LocalConstantReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.LocalConstant);
        this.ImportScopeReferenceIsSmall = this.IsReferenceSmall(0, TableIndex.ImportScope);

        this.HasCustomDebugInformationCodedIndexIsSmall = this.IsReferenceSmall(5,
            TableIndex.MethodDef,
            TableIndex.Field,
            TableIndex.TypeRef,
            TableIndex.TypeDef,
            TableIndex.Param,
            TableIndex.InterfaceImpl,
            TableIndex.MemberRef,
            TableIndex.Module,
            TableIndex.DeclSecurity,
            TableIndex.Property,
            TableIndex.Event,
            TableIndex.StandAloneSig,
            TableIndex.ModuleRef,
            TableIndex.TypeSpec,
            TableIndex.Assembly,
            TableIndex.AssemblyRef,
            TableIndex.File,
            TableIndex.ExportedType,
            TableIndex.ManifestResource,
            TableIndex.GenericParam,
            TableIndex.GenericParamConstraint,
            TableIndex.MethodSpec,
            TableIndex.Document,
            TableIndex.LocalScope,
            TableIndex.LocalVariable,
            TableIndex.LocalConstant,
            TableIndex.ImportScope);

        let size = this.CalculateTableStreamHeaderSize();

        const small = 2;
        const large = 4;

        const blobReferenceSize = this.BlobReferenceIsSmall ? small : large;
        const stringReferenceSize = this.StringReferenceIsSmall ? small : large;
        const guidReferenceSize = this.GuidReferenceIsSmall ? small : large;
        const customAttributeTypeCodedIndexSize = this.CustomAttributeTypeCodedIndexIsSmall ? small : large;
        const declSecurityCodedIndexSize = this.DeclSecurityCodedIndexIsSmall ? small : large;
        const eventDefReferenceSize = this.EventDefReferenceIsSmall ? small : large;
        const fieldDefReferenceSize = this.FieldDefReferenceIsSmall ? small : large;
        const genericParamReferenceSize = this.GenericParamReferenceIsSmall ? small : large;
        const hasConstantCodedIndexSize = this.HasConstantCodedIndexIsSmall ? small : large;
        const hasCustomAttributeCodedIndexSize = this.HasCustomAttributeCodedIndexIsSmall ? small : large;
        const hasFieldMarshalCodedIndexSize = this.HasFieldMarshalCodedIndexIsSmall ? small : large;
        const hasSemanticsCodedIndexSize = this.HasSemanticsCodedIndexIsSmall ? small : large;
        const implementationCodedIndexSize = this.ImplementationCodedIndexIsSmall ? small : large;
        const memberForwardedCodedIndexSize = this.MemberForwardedCodedIndexIsSmall ? small : large;
        const memberRefParentCodedIndexSize = this.MemberRefParentCodedIndexIsSmall ? small : large;
        const methodDefReferenceSize = this.MethodDefReferenceIsSmall ? small : large;
        const methodDefOrRefCodedIndexSize = this.MethodDefOrRefCodedIndexIsSmall ? small : large;
        const moduleRefReferenceSize = this.ModuleRefReferenceIsSmall ? small : large;
        const parameterReferenceSize = this.ParameterReferenceIsSmall ? small : large;
        const propertyDefReferenceSize = this.PropertyDefReferenceIsSmall ? small : large;
        const resolutionScopeCodedIndexSize = this.ResolutionScopeCodedIndexIsSmall ? small : large;
        const typeDefReferenceSize = this.TypeDefReferenceIsSmall ? small : large;
        const typeDefOrRefCodedIndexSize = this.TypeDefOrRefCodedIndexIsSmall ? small : large;
        const typeOrMethodDefCodedIndexSize = this.TypeOrMethodDefCodedIndexIsSmall ? small : large;
        const documentReferenceSize = this.DocumentReferenceIsSmall ? small : large;
        const localVariableReferenceSize = this.LocalVariableReferenceIsSmall ? small : large;
        const localConstantReferenceSize = this.LocalConstantReferenceIsSmall ? small : large;
        const importScopeReferenceSize = this.ImportScopeReferenceIsSmall ? small : large;
        const hasCustomDebugInformationCodedIndexSize = this.HasCustomDebugInformationCodedIndexIsSmall ? small : large;

        size += this.GetTableSize(TableIndex.Module, 2 + 3 * guidReferenceSize + stringReferenceSize);
        size += this.GetTableSize(TableIndex.TypeRef, resolutionScopeCodedIndexSize + stringReferenceSize + stringReferenceSize);
        size += this.GetTableSize(TableIndex.TypeDef, 4 + stringReferenceSize + stringReferenceSize + typeDefOrRefCodedIndexSize + fieldDefReferenceSize + methodDefReferenceSize);
        assert(rowCounts[TableIndex.FieldPtr] == 0);
        size += this.GetTableSize(TableIndex.Field, 2 + stringReferenceSize + blobReferenceSize);
        assert(rowCounts[TableIndex.MethodPtr] == 0);
        size += this.GetTableSize(TableIndex.MethodDef, 8 + stringReferenceSize + blobReferenceSize + parameterReferenceSize);
        assert(rowCounts[TableIndex.ParamPtr] == 0);
        size += this.GetTableSize(TableIndex.Param, 4 + stringReferenceSize);
        size += this.GetTableSize(TableIndex.InterfaceImpl, typeDefReferenceSize + typeDefOrRefCodedIndexSize);
        size += this.GetTableSize(TableIndex.MemberRef, memberRefParentCodedIndexSize + stringReferenceSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.Constant, 2 + hasConstantCodedIndexSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.CustomAttribute, hasCustomAttributeCodedIndexSize + customAttributeTypeCodedIndexSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.FieldMarshal, hasFieldMarshalCodedIndexSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.DeclSecurity, 2 + declSecurityCodedIndexSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.ClassLayout, 6 + typeDefReferenceSize);
        size += this.GetTableSize(TableIndex.FieldLayout, 4 + fieldDefReferenceSize);
        size += this.GetTableSize(TableIndex.StandAloneSig, blobReferenceSize);
        size += this.GetTableSize(TableIndex.EventMap, typeDefReferenceSize + eventDefReferenceSize);
        assert(rowCounts[TableIndex.EventPtr] == 0);
        size += this.GetTableSize(TableIndex.Event, 2 + stringReferenceSize + typeDefOrRefCodedIndexSize);
        size += this.GetTableSize(TableIndex.PropertyMap, typeDefReferenceSize + propertyDefReferenceSize);
        assert(rowCounts[TableIndex.PropertyPtr] == 0);
        size += this.GetTableSize(TableIndex.Property, 2 + stringReferenceSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.MethodSemantics, 2 + methodDefReferenceSize + hasSemanticsCodedIndexSize);
        size += this.GetTableSize(TableIndex.MethodImpl, typeDefReferenceSize + methodDefOrRefCodedIndexSize + methodDefOrRefCodedIndexSize);
        size += this.GetTableSize(TableIndex.ModuleRef, stringReferenceSize);
        size += this.GetTableSize(TableIndex.TypeSpec, blobReferenceSize);
        size += this.GetTableSize(TableIndex.ImplMap, 2 + memberForwardedCodedIndexSize + stringReferenceSize + moduleRefReferenceSize);
        size += this.GetTableSize(TableIndex.FieldRva, 4 + fieldDefReferenceSize);
        size += this.GetTableSize(TableIndex.EncLog, 8);
        size += this.GetTableSize(TableIndex.EncMap, 4);
        size += this.GetTableSize(TableIndex.Assembly, 16 + blobReferenceSize + stringReferenceSize + stringReferenceSize);
        assert(rowCounts[TableIndex.AssemblyProcessor] == 0);
        assert(rowCounts[TableIndex.AssemblyOS] == 0);
        size += this.GetTableSize(TableIndex.AssemblyRef, 12 + blobReferenceSize + stringReferenceSize + stringReferenceSize + blobReferenceSize);
        assert(rowCounts[TableIndex.AssemblyRefProcessor] == 0);
        assert(rowCounts[TableIndex.AssemblyRefOS] == 0);
        size += this.GetTableSize(TableIndex.File, 4 + stringReferenceSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.ExportedType, 8 + stringReferenceSize + stringReferenceSize + implementationCodedIndexSize);
        size += this.GetTableSize(TableIndex.ManifestResource, 8 + stringReferenceSize + implementationCodedIndexSize);
        size += this.GetTableSize(TableIndex.NestedClass, typeDefReferenceSize + typeDefReferenceSize);
        size += this.GetTableSize(TableIndex.GenericParam, 4 + typeOrMethodDefCodedIndexSize + stringReferenceSize);
        size += this.GetTableSize(TableIndex.MethodSpec, methodDefOrRefCodedIndexSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.GenericParamConstraint, genericParamReferenceSize + typeDefOrRefCodedIndexSize);

        size += this.GetTableSize(TableIndex.Document, blobReferenceSize + guidReferenceSize + blobReferenceSize + guidReferenceSize);
        size += this.GetTableSize(TableIndex.MethodDebugInformation, documentReferenceSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.LocalScope, methodDefReferenceSize + importScopeReferenceSize + localVariableReferenceSize + localConstantReferenceSize + 4 + 4);
        size += this.GetTableSize(TableIndex.LocalVariable, 2 + 2 + stringReferenceSize);
        size += this.GetTableSize(TableIndex.LocalConstant, stringReferenceSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.ImportScope, importScopeReferenceSize + blobReferenceSize);
        size += this.GetTableSize(TableIndex.StateMachineMethod, methodDefReferenceSize + methodDefReferenceSize);
        size += this.GetTableSize(TableIndex.CustomDebugInformation, hasCustomDebugInformationCodedIndexSize + guidReferenceSize + blobReferenceSize);

        // +1 for terminating 0 byte
        size = BitArithmetic.Align32(size + 1, MetadataSizes.StreamAlignment);

        this.MetadataTableStreamSize = size;

        size += this.GetAlignedHeapSize(HeapIndex.String);
        size += this.GetAlignedHeapSize(HeapIndex.UserString);
        size += this.GetAlignedHeapSize(HeapIndex.Guid);
        size += this.GetAlignedHeapSize(HeapIndex.Blob);

        this.StandalonePdbStreamSize = isStandaloneDebugMetadata ? this.CalculateStandalonePdbStreamSize() : 0;
        size += this.StandalonePdbStreamSize;

        this.MetadataStreamStorageSize = size;
    }

    public get IsStandaloneDebugMetadata(): boolean {
        return this.StandalonePdbStreamSize > 0;
    }

    public IsPresent(table: TableIndex): boolean {
        return BitArithmetic.And64(this.PresentTablesMask, BitArithmetic.SetBit64(table)) != BigInt(0);
    }

    /// <summary>
    /// Metadata header size.
    /// Includes:
    /// - metadata storage signature
    /// - storage header
    /// - stream headers
    /// </summary>
    public get MetadataHeaderSize(): number {
        const RegularStreamHeaderSizes = 76;
        const EncDeltaMarkerStreamHeaderSize = 16;
        const StandalonePdbStreamHeaderSize = 16;

        assert(RegularStreamHeaderSizes ==
            MetadataSizes.GetMetadataStreamHeaderSize("#~") +
            MetadataSizes.GetMetadataStreamHeaderSize("#Strings") +
            MetadataSizes.GetMetadataStreamHeaderSize("#US") +
            MetadataSizes.GetMetadataStreamHeaderSize("#GUID") +
            MetadataSizes.GetMetadataStreamHeaderSize("#Blob"));

        assert(EncDeltaMarkerStreamHeaderSize == MetadataSizes.GetMetadataStreamHeaderSize("#JTD"));
        assert(StandalonePdbStreamHeaderSize == MetadataSizes.GetMetadataStreamHeaderSize("#Pdb"));

        return sizeof('uint') +                 // signature
            sizeof('ushort') +               // major version
            sizeof('ushort') +               // minor version
            sizeof('uint') +                 // reserved
            sizeof('uint') +                 // padded metadata version length
            this.MetadataVersionPaddedLength +  // metadata version
            sizeof('ushort') +               // storage header: reserved
            sizeof('ushort') +               // stream count
            (this.IsStandaloneDebugMetadata ? StandalonePdbStreamHeaderSize : 0) +
            RegularStreamHeaderSizes +
            (this.IsEncDelta ? EncDeltaMarkerStreamHeaderSize : 0);

    }

    public static GetMetadataStreamHeaderSize(streamName: string): number {
        return sizeof('int') + // offset
            sizeof('int') + // size
            BitArithmetic.Align32(streamName.length + 1, 4); // zero-terminated name, padding
    }

    /// <summary>
    /// Total size of metadata (header and all streams).
    /// </summary>
    public get MetadataSize() {
        return this.MetadataHeaderSize + this.MetadataStreamStorageSize;
    }

    /// <summary>
    /// Returns aligned size of the specified heap.
    /// </summary>
    public GetAlignedHeapSize(index: HeapIndex): number {
        const i = index;
        if (i < 0 || i > this.HeapSizes.length) {
            Throw.ArgumentOutOfRange('index');
        }

        return BitArithmetic.Align32(this.HeapSizes[i], MetadataSizes.StreamAlignment);
    }

    public CalculateTableStreamHeaderSize(): number {
        let result = sizeof('int') +        // Reserved
            sizeof('short') +      // Version (major, minor)
            sizeof('byte') +       // Heap index sizes
            sizeof('byte') +       // Bit width of RowId
            sizeof('long') +       // Valid table mask
            sizeof('long');        // Sorted table mask

        // present table row counts
        for (let i = 0; i < this.RowCounts.length; i++) {
            if (BitArithmetic.And64(BitArithmetic.SetBit64(i), this.PresentTablesMask) != BigInt(0)) {
                result += sizeof('int');
            }
        }
        return result;
    }

    public static readonly PdbIdSize = 20;

    public CalculateStandalonePdbStreamSize(): number {
        const result =
            MetadataSizes.PdbIdSize +                                                         // PDB ID
            sizeof('int') +                                                       // EntryPoint
            sizeof('long') +                                                      // ReferencedTypeSystemTables
            BitArithmetic.Count64Bits(this.ExternalTablesMask) * sizeof('int'); // External row counts

        assert(result % MetadataSizes.StreamAlignment == 0);
        return result;
    }

    private ComputeNonEmptyTableMask(rowCounts: ArrayLike<number>): bigint {
        assert(rowCounts.length <= 64);

        let highBits = 0;
        let lowBits = 0;

        if (rowCounts.length > 32) {
            // high bits:
            for (let i = 0; i < rowCounts.length - 32; i++) {
                if (rowCounts[i + 32] > 0) {
                    highBits += (1 << i);
                }
            }
        }
        for (let i = 0; i < Math.min(32, rowCounts.length); i++) {
            if (rowCounts[i] > 0) {
                lowBits += (1 << i);
            }
        }

        // hightbits << 32 + lowbits
        let mask = BigInt(highBits) * BigInt(0x100000000) + BigInt(lowBits);
        return mask;
    }

    private GetTableSize(index: TableIndex, rowSize: number): number {
        return this.RowCounts[index] * rowSize;
    }

    private IsReferenceSmall(tagBitSize: number, ...tables: TableIndex[]): boolean {
        const smallBitCount = 16;
        return this.IsCompressed && this.ReferenceFits(smallBitCount - tagBitSize, tables);
    }

    private ReferenceFits(bitCount: number, tables: TableIndex[]): boolean {
        const maxIndex = (1 << bitCount) - 1;
        for (const table of tables) {
            // table can be either local or external, but not both:
            assert(this.RowCounts[table] == 0 || this.ExternalRowCounts[table] == 0);

            if (this.RowCounts[table] + this.ExternalRowCounts[table] > maxIndex) {
                return false;
            }
        }

        return true;
    }
}