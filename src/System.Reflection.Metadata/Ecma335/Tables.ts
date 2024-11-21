import assert from "assert";
import { Throw, sizeof, Version } from "System";
import { AssemblyHashAlgorithm } from "System.Configuration.Assemblies";
import { AssemblyFlags } from "System.Reflection";
import { MemoryBlock } from "System.Reflection.Internal";
import {
    MetadataKind,
    AssemblyReferenceHandle,
    EntityHandle,
    BlobHandle,
    StringHandle,
    GuidHandle,
} from "System.Reflection.Metadata";
import {
    TableIndex,
    MetadataStreamKind,
    HasCustomAttributeTag,
} from "System.Reflection.Metadata.Ecma335";


export class ModuleTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsGUIDHeapRefSizeSmall: boolean;
    private readonly _GenerationOffset: number;
    private readonly _NameOffset: number;
    private readonly _MVIdOffset: number;
    private readonly _EnCIdOffset: number;
    private readonly _EnCBaseIdOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        guidHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsGUIDHeapRefSizeSmall = guidHeapRefSize == 2;
        this._GenerationOffset = 0;
        this._NameOffset = this._GenerationOffset + sizeof('ushort');
        this._MVIdOffset = this._NameOffset + stringHeapRefSize;
        this._EnCIdOffset = this._MVIdOffset + guidHeapRefSize;
        this._EnCBaseIdOffset = this._EnCIdOffset + guidHeapRefSize;
        this.RowSize = this._EnCBaseIdOffset + guidHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public ushort GetGeneration()
    // {
    //     assert(NumberOfRows > 0);
    //     return this.Block.PeekUInt16(_GenerationOffset);
    // }

    // public StringHandle GetName()
    // {
    //     assert(NumberOfRows > 0);
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(_NameOffset, _IsStringHeapRefSizeSmall));
    // }

    public  GetMvid(): GuidHandle
    {
        assert(this.NumberOfRows > 0);
        return GuidHandle.FromIndex(this.Block.PeekHeapReference(this._MVIdOffset, this._IsGUIDHeapRefSizeSmall));
    }

    // public GuidHandle GetEncId()
    // {
    //     assert(NumberOfRows > 0);
    //     return GuidHandle.FromIndex(this.Block.PeekHeapReference(_EnCIdOffset, _IsGUIDHeapRefSizeSmall));
    // }

    // public GuidHandle GetEncBaseId()
    // {
    //     assert(NumberOfRows > 0);
    //     return GuidHandle.FromIndex(this.Block.PeekHeapReference(_EnCBaseIdOffset, _IsGUIDHeapRefSizeSmall));
    // }
}

export class TypeRefTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsResolutionScopeRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _ResolutionScopeOffset: number;
    private readonly _NameOffset: number;
    private readonly _NamespaceOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        resolutionScopeRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number) {
        this.NumberOfRows = numberOfRows;
        this._IsResolutionScopeRefSizeSmall = resolutionScopeRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._ResolutionScopeOffset = 0;
        this._NameOffset = this._ResolutionScopeOffset + resolutionScopeRefSize;
        this._NamespaceOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._NamespaceOffset + stringHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public EntityHandle GetResolutionScope(TypeReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return ResolutionScopeTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ResolutionScopeOffset, _IsResolutionScopeRefSizeSmall));
    // }

    // public StringHandle GetName(TypeReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public StringHandle GetNamespace(TypeReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NamespaceOffset, _IsStringHeapRefSizeSmall));
    // }
}

export class TypeDefTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsFieldRefSizeSmall: boolean;
    private readonly _IsMethodRefSizeSmall: boolean;
    private readonly _IsTypeDefOrRefRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _NamespaceOffset: number;
    private readonly _ExtendsOffset: number;
    private readonly _FieldListOffset: number;
    private readonly _MethodListOffset: number;
    public readonly RowSize: number;
    public Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        fieldRefSize: number,
        methodRefSize: number,
        typeDefOrRefRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number) {
        this.NumberOfRows = numberOfRows;
        this._IsFieldRefSizeSmall = fieldRefSize == 2;
        this._IsMethodRefSizeSmall = methodRefSize == 2;
        this._IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._NameOffset = this._FlagsOffset + sizeof('uint');
        this._NamespaceOffset = this._NameOffset + stringHeapRefSize;
        this._ExtendsOffset = this._NamespaceOffset + stringHeapRefSize;
        this._FieldListOffset = this._ExtendsOffset + typeDefOrRefRefSize;
        this._MethodListOffset = this._FieldListOffset + fieldRefSize;
        this.RowSize = this._MethodListOffset + methodRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public TypeAttributes GetFlags(TypeDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (TypeAttributes)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
    // }

    // public NamespaceDefinitionHandle GetNamespaceDefinition(TypeDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return NamespaceDefinitionHandle.FromFullNameOffset(this.Block.PeekHeapReference(rowOffset + _NamespaceOffset, _IsStringHeapRefSizeSmall));
    // }

    // public StringHandle GetNamespace(TypeDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NamespaceOffset, _IsStringHeapRefSizeSmall));
    // }

    // public StringHandle GetName(TypeDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public EntityHandle GetExtends(TypeDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ExtendsOffset, _IsTypeDefOrRefRefSizeSmall));
    // }

    // public int GetFieldStart(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekReference(rowOffset + _FieldListOffset, _IsFieldRefSizeSmall);
    // }

    // public int GetMethodStart(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekReference(rowOffset + _MethodListOffset, _IsMethodRefSizeSmall);
    // }

    // public TypeDefinitionHandle FindTypeContainingMethod(int methodDefOrPtrRowId, int numberOfMethods)
    // {
    //     int numOfRows = this.NumberOfRows;
    //     int slot = this.Block.BinarySearchForSlot(numOfRows, this.RowSize, _MethodListOffset, (uint)methodDefOrPtrRowId, _IsMethodRefSizeSmall);
    //     int row = slot + 1;
    //     if (row == 0)
    //     {
    //         return default(TypeDefinitionHandle);
    //     }

    //     if (row > numOfRows)
    //     {
    //         if (methodDefOrPtrRowId <= numberOfMethods)
    //         {
    //             return TypeDefinitionHandle.FromRowId(numOfRows);
    //         }

    //         return default(TypeDefinitionHandle);
    //     }

    //     int value = this.GetMethodStart(row);
    //     if (value == methodDefOrPtrRowId)
    //     {
    //         while (row < numOfRows)
    //         {
    //             int newRow = row + 1;
    //             value = this.GetMethodStart(newRow);
    //             if (value == methodDefOrPtrRowId)
    //             {
    //                 row = newRow;
    //             }
    //             else
    //             {
    //                 break;
    //             }
    //         }
    //     }

    //     return TypeDefinitionHandle.FromRowId(row);
    // }

    // public TypeDefinitionHandle FindTypeContainingField(int fieldDefOrPtrRowId, int numberOfFields)
    // {
    //     int numOfRows = this.NumberOfRows;
    //     int slot = this.Block.BinarySearchForSlot(numOfRows, this.RowSize, _FieldListOffset, (uint)fieldDefOrPtrRowId, _IsFieldRefSizeSmall);
    //     int row = slot + 1;
    //     if (row == 0)
    //     {
    //         return default(TypeDefinitionHandle);
    //     }

    //     if (row > numOfRows)
    //     {
    //         if (fieldDefOrPtrRowId <= numberOfFields)
    //         {
    //             return TypeDefinitionHandle.FromRowId(numOfRows);
    //         }

    //         return default(TypeDefinitionHandle);
    //     }

    //     int value = this.GetFieldStart(row);
    //     if (value == fieldDefOrPtrRowId)
    //     {
    //         while (row < numOfRows)
    //         {
    //             int newRow = row + 1;
    //             value = this.GetFieldStart(newRow);
    //             if (value == fieldDefOrPtrRowId)
    //             {
    //                 row = newRow;
    //             }
    //             else
    //             {
    //                 break;
    //             }
    //         }
    //     }

    //     return TypeDefinitionHandle.FromRowId(row);
    // }
}

export class FieldPtrTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsFieldTableRowRefSizeSmall: boolean;
    private readonly _FieldOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        fieldTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsFieldTableRowRefSizeSmall = fieldTableRowRefSize == 2;
        this._FieldOffset = 0;
        this.RowSize = this._FieldOffset + fieldTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public FieldDefinitionHandle GetFieldFor(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return FieldDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _FieldOffset, _IsFieldTableRowRefSizeSmall));
    // }

    // public int GetRowIdForFieldDefRow(int fieldDefRowId)
    // {
    //     return this.Block.LinearSearchReference(this.RowSize, _FieldOffset, (uint)fieldDefRowId, _IsFieldTableRowRefSizeSmall) + 1;
    // }
}

export class FieldTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _SignatureOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._NameOffset = this._FlagsOffset + sizeof('ushort');
        this._SignatureOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._SignatureOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public StringHandle GetName(FieldDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public FieldAttributes GetFlags(FieldDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (FieldAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
    // }

    // public BlobHandle GetSignature(FieldDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
    // }
}

export class MethodPtrTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsMethodTableRowRefSizeSmall: boolean;
    private readonly _MethodOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        methodTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsMethodTableRowRefSizeSmall = methodTableRowRefSize == 2;
        this._MethodOffset = 0;
        this.RowSize = this._MethodOffset + methodTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // // returns a rid
    // public MethodDefinitionHandle GetMethodFor(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return MethodDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _MethodOffset, _IsMethodTableRowRefSizeSmall));
    // }

    // public int GetRowIdForMethodDefRow(int methodDefRowId)
    // {
    //     return this.Block.LinearSearchReference(this.RowSize, _MethodOffset, (uint)methodDefRowId, _IsMethodTableRowRefSizeSmall) + 1;
    // }
}

export class MethodTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsParamRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _RvaOffset: number;
    private readonly _ImplFlagsOffset: number;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _SignatureOffset: number;
    private readonly _ParamListOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        paramRefSize: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsParamRefSizeSmall = paramRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._RvaOffset = 0;
        this._ImplFlagsOffset = this._RvaOffset + sizeof('uint');
        this._FlagsOffset = this._ImplFlagsOffset + sizeof('ushort');
        this._NameOffset = this._FlagsOffset + sizeof('ushort');
        this._SignatureOffset = this._NameOffset + stringHeapRefSize;
        this._ParamListOffset = this._SignatureOffset + blobHeapRefSize;
        this.RowSize = this._ParamListOffset + paramRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public int GetParamStart(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekReference(rowOffset + _ParamListOffset, _IsParamRefSizeSmall);
    // }

    // public BlobHandle GetSignature(MethodDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public int GetRva(MethodDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return this.Block.PeekInt32(rowOffset + _RvaOffset);
    // }

    // public StringHandle GetName(MethodDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public MethodAttributes GetFlags(MethodDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (MethodAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
    // }

    // public MethodImplAttributes GetImplFlags(MethodDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (MethodImplAttributes)this.Block.PeekUInt16(rowOffset + _ImplFlagsOffset);
    // }
}

export class ParamPtrTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsParamTableRowRefSizeSmall: boolean;
    private readonly _ParamOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        paramTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsParamTableRowRefSizeSmall = paramTableRowRefSize == 2;
        this._ParamOffset = 0;
        this.RowSize = this._ParamOffset + paramTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public ParameterHandle GetParamFor(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return ParameterHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParamOffset, _IsParamTableRowRefSizeSmall));
    // }
}

export class ParamTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _SequenceOffset: number;
    private readonly _NameOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._SequenceOffset = this._FlagsOffset + sizeof('ushort');
        this._NameOffset = this._SequenceOffset + sizeof('ushort');
        this.RowSize = this._NameOffset + stringHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public ParameterAttributes GetFlags(ParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (ParameterAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
    // }

    // public ushort GetSequence(ParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt16(rowOffset + _SequenceOffset);
    // }

    // public StringHandle GetName(ParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }
}

export class InterfaceImplTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsTypeDefTableRowRefSizeSmall: boolean;
    private readonly _IsTypeDefOrRefRefSizeSmall: boolean;
    private readonly _ClassOffset: number;
    private readonly _InterfaceOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        typeDefTableRowRefSize: number,
        typeDefOrRefRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
        this._IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
        this._ClassOffset = 0;
        this._InterfaceOffset = this._ClassOffset + typeDefTableRowRefSize;
        this.RowSize = this._InterfaceOffset + typeDefOrRefRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.InterfaceImpl);
        }
    }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ClassOffset, this._IsTypeDefTableRowRefSizeSmall);
    }

    // public void GetInterfaceImplRange(
    //     TypeDefinitionHandle typeDef,
    //     out int firstImplRowId,
    //     out int lastImplRowId)
    // {
    //     int typeDefRid = typeDef.RowId;

    //     int startRowNumber, endRowNumber;
    //     this.Block.BinarySearchReferenceRange(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _ClassOffset,
    //         (uint)typeDefRid,
    //         _IsTypeDefTableRowRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber);

    //     if (startRowNumber == -1)
    //     {
    //         firstImplRowId = 1;
    //         lastImplRowId = 0;
    //     }
    //     else
    //     {
    //         firstImplRowId = startRowNumber + 1;
    //         lastImplRowId = endRowNumber + 1;
    //     }
    // }

    // public EntityHandle GetInterface(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _InterfaceOffset, _IsTypeDefOrRefRefSizeSmall));
    // }
}

export class MemberRefTableReader {
    public NumberOfRows: number;
    private readonly _IsMemberRefParentRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _ClassOffset: number;
    private readonly _NameOffset: number;
    private readonly _SignatureOffset: number;
    public readonly RowSize: number;
    public Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        memberRefParentRefSize: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsMemberRefParentRefSizeSmall = memberRefParentRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._ClassOffset = 0;
        this._NameOffset = this._ClassOffset + memberRefParentRefSize;
        this._SignatureOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._SignatureOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public BlobHandle GetSignature(MemberReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public StringHandle GetName(MemberReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public EntityHandle GetClass(MemberReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return MemberRefParentTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ClassOffset, _IsMemberRefParentRefSizeSmall));
    // }
}

export class ConstantTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsHasConstantRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _TypeOffset: number;
    private readonly _ParentOffset: number;
    private readonly _ValueOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        hasConstantRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsHasConstantRefSizeSmall = hasConstantRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._TypeOffset = 0;
        this._ParentOffset = this._TypeOffset + sizeof('byte') + 1; // Alignment here (+1)...
        this._ValueOffset = this._ParentOffset + hasConstantRefSize;
        this.RowSize = this._ValueOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.Constant);
        }
    }

    // public ConstantTypeCode GetType(ConstantHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (ConstantTypeCode)this.Block.PeekByte(rowOffset + _TypeOffset);
    // }

    // public BlobHandle GetValue(ConstantHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _ValueOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public EntityHandle GetParent(ConstantHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return HasConstantTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasConstantRefSizeSmall));
    // }

    // public ConstantHandle FindConstant(EntityHandle parentHandle)
    // {
    //     int foundRowNumber =
    //       this.Block.BinarySearchReference(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _ParentOffset,
    //         HasConstantTag.ConvertToTag(parentHandle),
    //         _IsHasConstantRefSizeSmall);

    //     return ConstantHandle.FromRowId(foundRowNumber + 1);
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ParentOffset, this._IsHasConstantRefSizeSmall);
    }
}

export class CustomAttributeTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsHasCustomAttributeRefSizeSmall: boolean;
    private readonly _IsCustomAttributeTypeRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _ParentOffset: number;
    private readonly _TypeOffset: number;
    private readonly _ValueOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    // row ids in the CustomAttribute table sorted by parents
    public readonly PtrTable?: number[];

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        hasCustomAttributeRefSize: number,
        customAttributeTypeRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsHasCustomAttributeRefSizeSmall = hasCustomAttributeRefSize == 2;
        this._IsCustomAttributeTypeRefSizeSmall = customAttributeTypeRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._ParentOffset = 0;
        this._TypeOffset = this._ParentOffset + hasCustomAttributeRefSize;
        this._ValueOffset = this._TypeOffset + customAttributeTypeRefSize;
        this.RowSize = this._ValueOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
        this.PtrTable = undefined;

        if (!declaredSorted && !this.CheckSorted()) {
            this.PtrTable = this.Block.BuildPtrTable(
                numberOfRows,
                this.RowSize,
                this._ParentOffset,
                this._IsHasCustomAttributeRefSizeSmall);
        }
    }

    // public EntityHandle GetParent(CustomAttributeHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return HasCustomAttributeTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasCustomAttributeRefSizeSmall));
    // }

    // public EntityHandle GetConstructor(CustomAttributeHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return CustomAttributeTypeTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _TypeOffset, _IsCustomAttributeTypeRefSizeSmall));
    // }

    // public BlobHandle GetValue(CustomAttributeHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _ValueOffset, _IsBlobHeapRefSizeSmall));
    // }

    public GetAttributeRange(parentHandle: EntityHandle): { firstImplRowId: number, lastImplRowId: number } {
        let startRowNumber: number;
        let endRowNumber: number;

        if (this.PtrTable != undefined) {
            const out = this.Block.BinarySearchReferenceRange(
                this.PtrTable,
                this.RowSize,
                this._ParentOffset,
                HasCustomAttributeTag.ConvertToTag(parentHandle),
                this._IsHasCustomAttributeRefSizeSmall,
            );

            startRowNumber = out.startRowNumber;
            endRowNumber = out.endRowNumber;
        }
        else {
            const out = this.Block.BinarySearchReferenceRange(
                this.NumberOfRows,
                this.RowSize,
                this._ParentOffset,
                HasCustomAttributeTag.ConvertToTag(parentHandle),
                this._IsHasCustomAttributeRefSizeSmall,
            );

            startRowNumber = out.startRowNumber;
            endRowNumber = out.endRowNumber;
        }

        const firstImplRowId = startRowNumber == -1 ? 1 : startRowNumber + 1;
        const lastImplRowId = startRowNumber == -1 ? 0 : endRowNumber + 1;

        return { firstImplRowId, lastImplRowId };
    }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ParentOffset, this._IsHasCustomAttributeRefSizeSmall);
    }
}

export class FieldMarshalTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsHasFieldMarshalRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _ParentOffset: number;
    private readonly _NativeTypeOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        hasFieldMarshalRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsHasFieldMarshalRefSizeSmall = hasFieldMarshalRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._ParentOffset = 0;
        this._NativeTypeOffset = this._ParentOffset + hasFieldMarshalRefSize;
        this.RowSize = this._NativeTypeOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.FieldMarshal);
        }
    }

    // public EntityHandle GetParent(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return HasFieldMarshalTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasFieldMarshalRefSizeSmall));
    // }

    // public BlobHandle GetNativeType(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NativeTypeOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public int FindFieldMarshalRowId(EntityHandle handle)
    // {
    //     int foundRowNumber =
    //       this.Block.BinarySearchReference(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _ParentOffset,
    //         HasFieldMarshalTag.ConvertToTag(handle),
    //         _IsHasFieldMarshalRefSizeSmall);

    //     return foundRowNumber + 1;
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ParentOffset, this._IsHasFieldMarshalRefSizeSmall);
    }
}

export class DeclSecurityTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsHasDeclSecurityRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _ActionOffset: number;
    private readonly _ParentOffset: number;
    private readonly _PermissionSetOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        hasDeclSecurityRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsHasDeclSecurityRefSizeSmall = hasDeclSecurityRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._ActionOffset = 0;
        this._ParentOffset = this._ActionOffset + sizeof('ushort');
        this._PermissionSetOffset = this._ParentOffset + hasDeclSecurityRefSize;
        this.RowSize = this._PermissionSetOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.DeclSecurity);
        }
    }

    // public DeclarativeSecurityAction GetAction(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return (DeclarativeSecurityAction)this.Block.PeekUInt16(rowOffset + _ActionOffset);
    // }

    // public EntityHandle GetParent(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return HasDeclSecurityTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasDeclSecurityRefSizeSmall));
    // }

    // public BlobHandle GetPermissionSet(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _PermissionSetOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public void GetAttributeRange(EntityHandle parentToken, out int firstImplRowId, out int lastImplRowId)
    // {
    //     int startRowNumber, endRowNumber;

    //     this.Block.BinarySearchReferenceRange(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _ParentOffset,
    //         HasDeclSecurityTag.ConvertToTag(parentToken),
    //         _IsHasDeclSecurityRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber);

    //     if (startRowNumber == -1)
    //     {
    //         firstImplRowId = 1;
    //         lastImplRowId = 0;
    //     }
    //     else
    //     {
    //         firstImplRowId = startRowNumber + 1;
    //         lastImplRowId = endRowNumber + 1;
    //     }
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ParentOffset, this._IsHasDeclSecurityRefSizeSmall);
    }
}

export class ClassLayoutTableReader {
    public NumberOfRows: number;
    private readonly _IsTypeDefTableRowRefSizeSmall: boolean;
    private readonly _PackagingSizeOffset: number;
    private readonly _ClassSizeOffset: number;
    private readonly _ParentOffset: number;
    public readonly RowSize: number;
    public Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        typeDefTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
        this._PackagingSizeOffset = 0;
        this._ClassSizeOffset = this._PackagingSizeOffset + sizeof('ushort');
        this._ParentOffset = this._ClassSizeOffset + sizeof('uint');
        this.RowSize = this._ParentOffset + typeDefTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.ClassLayout);
        }
    }

    // public TypeDefinitionHandle GetParent(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParentOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    // public ushort GetPackingSize(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt16(rowOffset + _PackagingSizeOffset);
    // }

    // public uint GetClassSize(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt32(rowOffset + _ClassSizeOffset);
    // }

    // // Returns RowId (0 means we there is no record in this table corresponding to the specified type).
    // public int FindRow(TypeDefinitionHandle typeDef)
    // {
    //     return 1 + this.Block.BinarySearchReference(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _ParentOffset,
    //         (uint)typeDef.RowId,
    //         _IsTypeDefTableRowRefSizeSmall);
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ParentOffset, this._IsTypeDefTableRowRefSizeSmall);
    }
}

export class FieldLayoutTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsFieldTableRowRefSizeSmall: boolean;
    private readonly _OffsetOffset: number;
    private readonly _FieldOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        fieldTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsFieldTableRowRefSizeSmall = fieldTableRowRefSize == 2;
        this._OffsetOffset = 0;
        this._FieldOffset = this._OffsetOffset + sizeof('uint');
        this.RowSize = this._FieldOffset + fieldTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.FieldLayout);
        }
    }

    // /// <summary>
    // /// Returns field offset for given field RowId, or -1 if not available.
    // /// </summary>
    // public int FindFieldLayoutRowId(FieldDefinitionHandle handle)
    // {
    //     int rowNumber =
    //       this.Block.BinarySearchReference(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _FieldOffset,
    //         (uint)handle.RowId,
    //         _IsFieldTableRowRefSizeSmall);

    //     return rowNumber + 1;
    // }

    // public uint GetOffset(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt32(rowOffset + _OffsetOffset);
    // }

    // public FieldDefinitionHandle GetField(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return FieldDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + this._FieldOffset, this._IsFieldTableRowRefSizeSmall));
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._FieldOffset, this._IsFieldTableRowRefSizeSmall);
    }
}

export class StandAloneSigTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _SignatureOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._SignatureOffset = 0;
        this.RowSize = this._SignatureOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public BlobHandle GetSignature(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
    // }
}

export class EventMapTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsTypeDefTableRowRefSizeSmall: boolean;
    private readonly _IsEventRefSizeSmall: boolean;
    private readonly _ParentOffset: number;
    private readonly _EventListOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        typeDefTableRowRefSize: number,
        eventRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
        this._IsEventRefSizeSmall = eventRefSize == 2;
        this._ParentOffset = 0;
        this._EventListOffset = this._ParentOffset + typeDefTableRowRefSize;
        this.RowSize = this._EventListOffset + eventRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public int FindEventMapRowIdFor(TypeDefinitionHandle typeDef)
    // {
    //     // We do a linear scan here because we don't have these tables sorted
    //     // TODO: We can scan the table to see if it is sorted and use binary search if so.
    //     // Also, the compilers should make sure it's sorted.
    //     int rowNumber = this.Block.LinearSearchReference(
    //         this.RowSize,
    //         _ParentOffset,
    //         (uint)typeDef.RowId,
    //         _IsTypeDefTableRowRefSizeSmall);

    //     return rowNumber + 1;
    // }

    // public TypeDefinitionHandle GetParentType(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParentOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    // public int GetEventListStartFor(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekReference(rowOffset + _EventListOffset, _IsEventRefSizeSmall);
    // }
}

export class EventPtrTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsEventTableRowRefSizeSmall: boolean;
    private readonly _EventOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        eventTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsEventTableRowRefSizeSmall = eventTableRowRefSize == 2;
        this._EventOffset = 0;
        this.RowSize = this._EventOffset + eventTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public EventDefinitionHandle GetEventFor(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return EventDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _EventOffset, _IsEventTableRowRefSizeSmall));
    // }
}

export class EventTableReader {
    public NumberOfRows: number;
    private readonly _IsTypeDefOrRefRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _EventTypeOffset: number;
    public readonly RowSize: number;
    public Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        typeDefOrRefRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._NameOffset = this._FlagsOffset + sizeof('ushort');
        this._EventTypeOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._EventTypeOffset + typeDefOrRefRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public EventAttributes GetFlags(EventDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (EventAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
    // }

    // public StringHandle GetName(EventDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public EntityHandle GetEventType(EventDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _EventTypeOffset, _IsTypeDefOrRefRefSizeSmall));
    // }
}

export class PropertyMapTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsTypeDefTableRowRefSizeSmall: boolean;
    private readonly _IsPropertyRefSizeSmall: boolean;
    private readonly _ParentOffset: number;
    private readonly _PropertyListOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        typeDefTableRowRefSize: number,
        propertyRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
        this._IsPropertyRefSizeSmall = propertyRefSize == 2;
        this._ParentOffset = 0;
        this._PropertyListOffset = this._ParentOffset + typeDefTableRowRefSize;
        this.RowSize = this._PropertyListOffset + propertyRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public int FindPropertyMapRowIdFor(TypeDefinitionHandle typeDef)
    // {
    //     // We do a linear scan here because we don't have these tables sorted.
    //     // TODO: We can scan the table to see if it is sorted and use binary search if so.
    //     // Also, the compilers should make sure it's sorted.
    //     int rowNumber =
    //       this.Block.LinearSearchReference(
    //         this.RowSize,
    //         _ParentOffset,
    //         (uint)typeDef.RowId,
    //         _IsTypeDefTableRowRefSizeSmall);

    //     return rowNumber + 1;
    // }

    // public TypeDefinitionHandle GetParentType(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParentOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    // public int GetPropertyListStartFor(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekReference(rowOffset + _PropertyListOffset, _IsPropertyRefSizeSmall);
    // }
}

export class PropertyPtrTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsPropertyTableRowRefSizeSmall: boolean;
    private readonly _PropertyOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        propertyTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsPropertyTableRowRefSizeSmall = propertyTableRowRefSize == 2;
        this._PropertyOffset = 0;
        this.RowSize = this._PropertyOffset + propertyTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public PropertyDefinitionHandle GetPropertyFor(
    //   int rowId
    // )
    // // ^ requires rowId <= this.NumberOfRows;
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return PropertyDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _PropertyOffset, _IsPropertyTableRowRefSizeSmall));
    // }
}

export class PropertyTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _SignatureOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._NameOffset = this._FlagsOffset + sizeof('ushort');
        this._SignatureOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._SignatureOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public PropertyAttributes GetFlags(PropertyDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (PropertyAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
    // }

    // public StringHandle GetName(PropertyDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public BlobHandle GetSignature(PropertyDefinitionHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
    // }
}

export class MethodSemanticsTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsMethodTableRowRefSizeSmall: boolean;
    private readonly _IsHasSemanticRefSizeSmall: boolean;
    private readonly _SemanticsFlagOffset: number;
    private readonly _MethodOffset: number;
    private readonly _AssociationOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        methodTableRowRefSize: number,
        hasSemanticRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsMethodTableRowRefSizeSmall = methodTableRowRefSize == 2;
        this._IsHasSemanticRefSizeSmall = hasSemanticRefSize == 2;
        this._SemanticsFlagOffset = 0;
        this._MethodOffset = this._SemanticsFlagOffset + sizeof('ushort');
        this._AssociationOffset = this._MethodOffset + methodTableRowRefSize;
        this.RowSize = this._AssociationOffset + hasSemanticRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.MethodSemantics);
        }
    }

    // public MethodDefinitionHandle GetMethod(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return MethodDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _MethodOffset, _IsMethodTableRowRefSizeSmall));
    // }

    // public MethodSemanticsAttributes GetSemantics(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return (MethodSemanticsAttributes)this.Block.PeekUInt16(rowOffset + _SemanticsFlagOffset);
    // }

    // public EntityHandle GetAssociation(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return HasSemanticsTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _AssociationOffset, _IsHasSemanticRefSizeSmall));
    // }

    // // returns rowID
    // public int FindSemanticMethodsForEvent(EventDefinitionHandle eventDef, out ushort methodCount)
    // {
    //     methodCount = 0;
    //     uint searchCodedTag = HasSemanticsTag.ConvertEventHandleToTag(eventDef);
    //     return this.BinarySearchTag(searchCodedTag, ref methodCount);
    // }

    // public int FindSemanticMethodsForProperty(PropertyDefinitionHandle propertyDef, out ushort methodCount)
    // {
    //     methodCount = 0;
    //     uint searchCodedTag = HasSemanticsTag.ConvertPropertyHandleToTag(propertyDef);
    //     return this.BinarySearchTag(searchCodedTag, ref methodCount);
    // }

    // private int BinarySearchTag(uint searchCodedTag, ref ushort methodCount)
    // {
    //     int startRowNumber, endRowNumber;
    //     this.Block.BinarySearchReferenceRange(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _AssociationOffset,
    //         searchCodedTag,
    //         _IsHasSemanticRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber
    //     );

    //     if (startRowNumber == -1)
    //     {
    //         methodCount = 0;
    //         return 0;
    //     }

    //     methodCount = (ushort)(endRowNumber - startRowNumber + 1);
    //     return startRowNumber + 1;
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._AssociationOffset, this._IsHasSemanticRefSizeSmall);
    }
}

export class MethodImplTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsTypeDefTableRowRefSizeSmall: boolean;
    private readonly _IsMethodDefOrRefRefSizeSmall: boolean;
    private readonly _ClassOffset: number;
    private readonly _MethodBodyOffset: number;
    private readonly _MethodDeclarationOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        typeDefTableRowRefSize: number,
        methodDefOrRefRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
        this._IsMethodDefOrRefRefSizeSmall = methodDefOrRefRefSize == 2;
        this._ClassOffset = 0;
        this._MethodBodyOffset = this._ClassOffset + typeDefTableRowRefSize;
        this._MethodDeclarationOffset = this._MethodBodyOffset + methodDefOrRefRefSize;
        this.RowSize = this._MethodDeclarationOffset + methodDefOrRefRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.MethodImpl);
        }
    }

    // public TypeDefinitionHandle GetClass(MethodImplementationHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ClassOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    // public EntityHandle GetMethodBody(MethodImplementationHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return MethodDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _MethodBodyOffset, _IsMethodDefOrRefRefSizeSmall));
    // }

    // public EntityHandle GetMethodDeclaration(MethodImplementationHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return MethodDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _MethodDeclarationOffset, _IsMethodDefOrRefRefSizeSmall));
    // }

    // public void GetMethodImplRange(
    //     TypeDefinitionHandle typeDef,
    //     out int firstImplRowId,
    //     out int lastImplRowId)
    // {
    //     int startRowNumber, endRowNumber;
    //     this.Block.BinarySearchReferenceRange(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _ClassOffset,
    //         (uint)typeDef.RowId,
    //         _IsTypeDefTableRowRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber);

    //     if (startRowNumber == -1)
    //     {
    //         firstImplRowId = 1;
    //         lastImplRowId = 0;
    //     }
    //     else
    //     {
    //         firstImplRowId = startRowNumber + 1;
    //         lastImplRowId = endRowNumber + 1;
    //     }
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._ClassOffset, this._IsTypeDefTableRowRefSizeSmall);
    }
}

export class ModuleRefTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _NameOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._NameOffset = 0;
        this.RowSize = this._NameOffset + stringHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public StringHandle GetName(ModuleReferenceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }
}

export class TypeSpecTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _SignatureOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._SignatureOffset = 0;
        this.RowSize = this._SignatureOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public BlobHandle GetSignature(TypeSpecificationHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
    // }
}

export class ImplMapTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsModuleRefTableRowRefSizeSmall: boolean;
    private readonly _IsMemberForwardRowRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _MemberForwardedOffset: number;
    private readonly _ImportNameOffset: number;
    private readonly _ImportScopeOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        moduleRefTableRowRefSize: number,
        memberForwardedRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsModuleRefTableRowRefSizeSmall = moduleRefTableRowRefSize == 2;
        this._IsMemberForwardRowRefSizeSmall = memberForwardedRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._MemberForwardedOffset = this._FlagsOffset + sizeof('ushort');
        this._ImportNameOffset = this._MemberForwardedOffset + memberForwardedRefSize;
        this._ImportScopeOffset = this._ImportNameOffset + stringHeapRefSize;
        this.RowSize = this._ImportScopeOffset + moduleRefTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.ImplMap);
        }
    }

    // public MethodImport GetImport(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     var pInvokeMapFlags = (MethodImportAttributes)Block.PeekUInt16(rowOffset + _FlagsOffset);
    //     var importName = StringHandle.FromOffset(Block.PeekHeapReference(rowOffset + _ImportNameOffset, _IsStringHeapRefSizeSmall));
    //     var importScope = ModuleReferenceHandle.FromRowId(Block.PeekReference(rowOffset + _ImportScopeOffset, _IsModuleRefTableRowRefSizeSmall));
    //     return new MethodImport(pInvokeMapFlags, importName, importScope);
    // }

    // public EntityHandle GetMemberForwarded(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return MemberForwardedTag.ConvertToHandle(Block.PeekTaggedReference(rowOffset + _MemberForwardedOffset, _IsMemberForwardRowRefSizeSmall));
    // }

    // public int FindImplForMethod(MethodDefinitionHandle methodDef)
    // {
    //     uint searchCodedTag = MemberForwardedTag.ConvertMethodDefToTag(methodDef);
    //     return this.BinarySearchTag(searchCodedTag);
    // }

    // private int BinarySearchTag(uint searchCodedTag)
    // {
    //     int foundRowNumber =
    //       this.Block.BinarySearchReference(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _MemberForwardedOffset,
    //         searchCodedTag,
    //         _IsMemberForwardRowRefSizeSmall);

    //     return foundRowNumber + 1;
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._MemberForwardedOffset, this._IsMemberForwardRowRefSizeSmall);
    }
}

export class FieldRVATableReader {
    public readonly NumberOfRows: number;
    private readonly _IsFieldTableRowRefSizeSmall: boolean;
    private readonly _RvaOffset: number;
    private readonly _FieldOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        fieldTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number) {
        this.NumberOfRows = numberOfRows;
        this._IsFieldTableRowRefSizeSmall = fieldTableRowRefSize == 2;
        this._RvaOffset = 0;
        this._FieldOffset = this._RvaOffset + sizeof('uint');
        this.RowSize = this._FieldOffset + fieldTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.FieldRva);
        }
    }

    //     public int GetRva(int rowId)
    //     {
    //         int rowOffset = (rowId - 1) * this.RowSize;
    //         return Block.PeekInt32(rowOffset + _RvaOffset);
    //     }

    //     public int FindFieldRvaRowId(int fieldDefRowId)
    //     {
    //         int foundRowNumber = Block.BinarySearchReference(
    //             this.NumberOfRows,
    //             this.RowSize,
    //             _FieldOffset,
    //             (uint)fieldDefRowId,
    //             _IsFieldTableRowRefSizeSmall);

    //         return foundRowNumber + 1;
    //     }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._FieldOffset, this._IsFieldTableRowRefSizeSmall);
    }
}

export class EnCLogTableReader {
    public readonly NumberOfRows: number;
    private readonly _TokenOffset: number;
    private readonly _FuncCodeOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
        metadataStreamKind: MetadataStreamKind
    ) {
        // EnC tables are not allowed in a compressed stream.
        // However when asked for a snapshot of the current metadata after an EnC change has been applied
        // the CLR includes the EnCLog table into the snapshot (but not EnCMap). We pretend EnCLog is empty.
        this.NumberOfRows = (metadataStreamKind == MetadataStreamKind.Compressed) ? 0 : numberOfRows;

        this._TokenOffset = 0;
        this._FuncCodeOffset = this._TokenOffset + sizeof('uint');
        this.RowSize = this._FuncCodeOffset + sizeof('uint');
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public uint GetToken(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt32(rowOffset + _TokenOffset);
    // }

    // public EditAndContinueOperation GetFuncCode(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return (EditAndContinueOperation)this.Block.PeekUInt32(rowOffset + _FuncCodeOffset);
    // }
}

export class EnCMapTableReader {
    public readonly NumberOfRows: number;
    private readonly _TokenOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._TokenOffset = 0;
        this.RowSize = this._TokenOffset + sizeof('uint');
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    public GetToken(rowId: number): number {
        const rowOffset = (rowId - 1) * this.RowSize;
        return this.Block.PeekUInt32(rowOffset + this._TokenOffset);
    }
}

export class AssemblyTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _HashAlgIdOffset: number;
    private readonly _MajorVersionOffset: number;
    private readonly _MinorVersionOffset: number;
    private readonly _BuildNumberOffset: number;
    private readonly _RevisionNumberOffset: number;
    private readonly _FlagsOffset: number;
    private readonly _PublicKeyOffset: number;
    private readonly _NameOffset: number;
    private readonly _CultureOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        // NOTE: obfuscated assemblies may have more than one row in Assembly table,
        //       we ignore all rows but the first one
        this.NumberOfRows = numberOfRows > 1 ? 1 : numberOfRows;

        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._HashAlgIdOffset = 0;
        this._MajorVersionOffset = this._HashAlgIdOffset + sizeof('uint');
        this._MinorVersionOffset = this._MajorVersionOffset + sizeof('ushort');
        this._BuildNumberOffset = this._MinorVersionOffset + sizeof('ushort');
        this._RevisionNumberOffset = this._BuildNumberOffset + sizeof('ushort');
        this._FlagsOffset = this._RevisionNumberOffset + sizeof('ushort');
        this._PublicKeyOffset = this._FlagsOffset + sizeof('uint');
        this._NameOffset = this._PublicKeyOffset + blobHeapRefSize;
        this._CultureOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._CultureOffset + stringHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    public GetHashAlgorithm(): AssemblyHashAlgorithm {
        assert(this.NumberOfRows == 1);
        return this.Block.PeekUInt32(this._HashAlgIdOffset);
    }

    public GetVersion(): Version {
        assert(this.NumberOfRows == 1);
        return new Version(
            this.Block.PeekUInt16(this._MajorVersionOffset),
            this.Block.PeekUInt16(this._MinorVersionOffset),
            this.Block.PeekUInt16(this._BuildNumberOffset),
            this.Block.PeekUInt16(this._RevisionNumberOffset));
    }

    public GetFlags(): AssemblyFlags {
        assert(this.NumberOfRows == 1);
        return this.Block.PeekUInt32(this._FlagsOffset);
    }

    public GetPublicKey(): BlobHandle {
        assert(this.NumberOfRows == 1);
        return BlobHandle.FromOffset(this.Block.PeekHeapReference(this._PublicKeyOffset, this._IsBlobHeapRefSizeSmall));
    }

    public GetName(): StringHandle {
        assert(this.NumberOfRows == 1);
        return StringHandle.FromOffset(this.Block.PeekHeapReference(this._NameOffset, this._IsStringHeapRefSizeSmall));
    }

    public GetCulture(): StringHandle {
        assert(this.NumberOfRows == 1);
        return StringHandle.FromOffset(this.Block.PeekHeapReference(this._CultureOffset, this._IsStringHeapRefSizeSmall));
    }
}

export class AssemblyProcessorTableReader {
    public readonly NumberOfRows: number;
    private readonly _ProcessorOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._ProcessorOffset = 0;
        this.RowSize = this._ProcessorOffset + sizeof('uint');
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }
}

export class AssemblyOSTableReader {
    public readonly NumberOfRows: number;
    private readonly _OSPlatformIdOffset: number;
    private readonly _OSMajorVersionIdOffset: number;
    private readonly _OSMinorVersionIdOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._OSPlatformIdOffset = 0;
        this._OSMajorVersionIdOffset = this._OSPlatformIdOffset + sizeof('uint');
        this._OSMinorVersionIdOffset = this._OSMajorVersionIdOffset + sizeof('uint');
        this.RowSize = this._OSMinorVersionIdOffset + sizeof('uint');
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }
}

export class AssemblyRefTableReader {
    /// <summary>
    /// In CLI metadata equal to the actual number of entries in AssemblyRef table.
    /// In WinMD metadata it includes synthesized AssemblyRefs in addition.
    /// </summary>
    public readonly NumberOfNonVirtualRows: number;
    public readonly NumberOfVirtualRows: number;

    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _MajorVersionOffset: number;
    private readonly _MinorVersionOffset: number;
    private readonly _BuildNumberOffset: number;
    private readonly _RevisionNumberOffset: number;
    private readonly _FlagsOffset: number;
    private readonly _PublicKeyOrTokenOffset: number;
    private readonly _NameOffset: number;
    private readonly _CultureOffset: number;
    private readonly _HashValueOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
        metadataKind: MetadataKind,
    ) {
        this.NumberOfNonVirtualRows = numberOfRows;
        this.NumberOfVirtualRows = (metadataKind == MetadataKind.Ecma335) ? 0 : AssemblyReferenceHandle.VirtualIndex.Count;

        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._MajorVersionOffset = 0;
        this._MinorVersionOffset = this._MajorVersionOffset + sizeof('ushort');
        this._BuildNumberOffset = this._MinorVersionOffset + sizeof('ushort');
        this._RevisionNumberOffset = this._BuildNumberOffset + sizeof('ushort');
        this._FlagsOffset = this._RevisionNumberOffset + sizeof('ushort');
        this._PublicKeyOrTokenOffset = this._FlagsOffset + sizeof('uint');
        this._NameOffset = this._PublicKeyOrTokenOffset + blobHeapRefSize;
        this._CultureOffset = this._NameOffset + stringHeapRefSize;
        this._HashValueOffset = this._CultureOffset + stringHeapRefSize;
        this.RowSize = this._HashValueOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public Version GetVersion(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return new Version(
    //         this.Block.PeekUInt16(rowOffset + _MajorVersionOffset),
    //         this.Block.PeekUInt16(rowOffset + _MinorVersionOffset),
    //         this.Block.PeekUInt16(rowOffset + _BuildNumberOffset),
    //         this.Block.PeekUInt16(rowOffset + _RevisionNumberOffset));
    // }

    // public AssemblyFlags GetFlags(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return (AssemblyFlags)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
    // }

    // public BlobHandle GetPublicKeyOrToken(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _PublicKeyOrTokenOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public StringHandle GetName(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public StringHandle GetCulture(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _CultureOffset, _IsStringHeapRefSizeSmall));
    // }

    // public BlobHandle GetHashValue(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _HashValueOffset, _IsBlobHeapRefSizeSmall));
    // }
}

export class AssemblyRefProcessorTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsAssemblyRefTableRowSizeSmall: boolean;
    private readonly _ProcessorOffset: number;
    private readonly _AssemblyRefOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        assemblyRefTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsAssemblyRefTableRowSizeSmall = assemblyRefTableRowRefSize == 2;
        this._ProcessorOffset = 0;
        this._AssemblyRefOffset = this._ProcessorOffset + sizeof('uint');
        this.RowSize = this._AssemblyRefOffset + assemblyRefTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }
}

export class AssemblyRefOSTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsAssemblyRefTableRowRefSizeSmall: boolean;
    private readonly _OSPlatformIdOffset: number;
    private readonly _OSMajorVersionIdOffset: number;
    private readonly _OSMinorVersionIdOffset: number;
    private readonly _AssemblyRefOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        assemblyRefTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsAssemblyRefTableRowRefSizeSmall = assemblyRefTableRowRefSize == 2;
        this._OSPlatformIdOffset = 0;
        this._OSMajorVersionIdOffset = this._OSPlatformIdOffset + sizeof('uint');
        this._OSMinorVersionIdOffset = this._OSMajorVersionIdOffset + sizeof('uint');
        this._AssemblyRefOffset = this._OSMinorVersionIdOffset + sizeof('uint');
        this.RowSize = this._AssemblyRefOffset + assemblyRefTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }
}

export class FileTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _HashValueOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number) {
        this.NumberOfRows = numberOfRows;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._NameOffset = this._FlagsOffset + sizeof('uint');
        this._HashValueOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._HashValueOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public BlobHandle GetHashValue(AssemblyFileHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _HashValueOffset, _IsBlobHeapRefSizeSmall));
    // }

    // public uint GetFlags(AssemblyFileHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt32(rowOffset + _FlagsOffset);
    // }

    // public StringHandle GetName(AssemblyFileHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }
}

export class ExportedTypeTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsImplementationRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _FlagsOffset: number;
    private readonly _TypeDefIdOffset: number;
    private readonly _TypeNameOffset: number;
    private readonly _TypeNamespaceOffset: number;
    private readonly _ImplementationOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        implementationRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsImplementationRefSizeSmall = implementationRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._FlagsOffset = 0;
        this._TypeDefIdOffset = this._FlagsOffset + sizeof('uint');
        this._TypeNameOffset = this._TypeDefIdOffset + sizeof('uint');
        this._TypeNamespaceOffset = this._TypeNameOffset + stringHeapRefSize;
        this._ImplementationOffset = this._TypeNamespaceOffset + stringHeapRefSize;
        this.RowSize = this._ImplementationOffset + implementationRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public StringHandle GetTypeName(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _TypeNameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public StringHandle GetTypeNamespaceString(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _TypeNamespaceOffset, _IsStringHeapRefSizeSmall));
    // }

    // public NamespaceDefinitionHandle GetTypeNamespace(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return NamespaceDefinitionHandle.FromFullNameOffset(this.Block.PeekHeapReference(rowOffset + _TypeNamespaceOffset, _IsStringHeapRefSizeSmall));
    // }

    // public EntityHandle GetImplementation(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return ImplementationTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ImplementationOffset, _IsImplementationRefSizeSmall));
    // }

    // public TypeAttributes GetFlags(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return (TypeAttributes)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
    // }

    // public int GetTypeDefId(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekInt32(rowOffset + _TypeDefIdOffset);
    // }

    // public int GetNamespace(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return this.Block.PeekReference(rowOffset + _TypeNamespaceOffset, _IsStringHeapRefSizeSmall);
    // }
}

export class ManifestResourceTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsImplementationRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _OffsetOffset: number;
    private readonly _FlagsOffset: number;
    private readonly _NameOffset: number;
    private readonly _ImplementationOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        implementationRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsImplementationRefSizeSmall = implementationRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._OffsetOffset = 0;
        this._FlagsOffset = this._OffsetOffset + sizeof('uint');
        this._NameOffset = this._FlagsOffset + sizeof('uint');
        this._ImplementationOffset = this._NameOffset + stringHeapRefSize;
        this.RowSize = this._ImplementationOffset + implementationRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public StringHandle GetName(ManifestResourceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public EntityHandle GetImplementation(ManifestResourceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return ImplementationTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ImplementationOffset, _IsImplementationRefSizeSmall));
    // }

    // public uint GetOffset(ManifestResourceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt32(rowOffset + _OffsetOffset);
    // }

    // public ManifestResourceAttributes GetFlags(ManifestResourceHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (ManifestResourceAttributes)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
    // }
}

export class NestedClassTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsTypeDefTableRowRefSizeSmall: boolean;
    private readonly _NestedClassOffset: number;
    private readonly _EnclosingClassOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        typeDefTableRowRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
        this._NestedClassOffset = 0;
        this._EnclosingClassOffset = this._NestedClassOffset + typeDefTableRowRefSize;
        this.RowSize = this._EnclosingClassOffset + typeDefTableRowRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.NestedClass);
        }
    }

    // public TypeDefinitionHandle GetNestedClass(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _NestedClassOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    // public TypeDefinitionHandle GetEnclosingClass(int rowId)
    // {
    //     int rowOffset = (rowId - 1) * this.RowSize;
    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _EnclosingClassOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    // public TypeDefinitionHandle FindEnclosingType(TypeDefinitionHandle nestedTypeDef)
    // {
    //     int rowNumber =
    //       this.Block.BinarySearchReference(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _NestedClassOffset,
    //         (uint)nestedTypeDef.RowId,
    //         _IsTypeDefTableRowRefSizeSmall);

    //     if (rowNumber == -1)
    //     {
    //         return default(TypeDefinitionHandle);
    //     }

    //     return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowNumber * this.RowSize + _EnclosingClassOffset, _IsTypeDefTableRowRefSizeSmall));
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._NestedClassOffset, this._IsTypeDefTableRowRefSizeSmall);
    }
}

export class GenericParamTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsTypeOrMethodDefRefSizeSmall: boolean;
    private readonly _IsStringHeapRefSizeSmall: boolean;
    private readonly _NumberOffset: number;
    private readonly _FlagsOffset: number;
    private readonly _OwnerOffset: number;
    private readonly _NameOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        typeOrMethodDefRefSize: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsTypeOrMethodDefRefSizeSmall = typeOrMethodDefRefSize == 2;
        this._IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._NumberOffset = 0;
        this._FlagsOffset = this._NumberOffset + sizeof('ushort');
        this._OwnerOffset = this._FlagsOffset + sizeof('ushort');
        this._NameOffset = this._OwnerOffset + typeOrMethodDefRefSize;
        this.RowSize = this._NameOffset + stringHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.GenericParam);
        }
    }

    // public ushort GetNumber(GenericParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return this.Block.PeekUInt16(rowOffset + _NumberOffset);
    // }

    // public GenericParameterAttributes GetFlags(GenericParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return (GenericParameterAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
    // }

    // public StringHandle GetName(GenericParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public EntityHandle GetOwner(GenericParameterHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return TypeOrMethodDefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _OwnerOffset, _IsTypeOrMethodDefRefSizeSmall));
    // }

    // public GenericParameterHandleCollection FindGenericParametersForType(TypeDefinitionHandle typeDef)
    // {
    //     ushort count = 0;
    //     uint searchCodedTag = TypeOrMethodDefTag.ConvertTypeDefRowIdToTag(typeDef);
    //     int startRid = this.BinarySearchTag(searchCodedTag, ref count);

    //     return new GenericParameterHandleCollection(startRid, count);
    // }

    // public GenericParameterHandleCollection FindGenericParametersForMethod(MethodDefinitionHandle methodDef)
    // {
    //     ushort count = 0;
    //     uint searchCodedTag = TypeOrMethodDefTag.ConvertMethodDefToTag(methodDef);
    //     int startRid = this.BinarySearchTag(searchCodedTag, ref count);

    //     return new GenericParameterHandleCollection(startRid, count);
    // }

    // private int BinarySearchTag(uint searchCodedTag, ref ushort genericParamCount)
    // {
    //     int startRowNumber, endRowNumber;
    //     this.Block.BinarySearchReferenceRange(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _OwnerOffset,
    //         searchCodedTag,
    //         _IsTypeOrMethodDefRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber);

    //     if (startRowNumber == -1)
    //     {
    //         genericParamCount = 0;
    //         return 0;
    //     }

    //     genericParamCount = (ushort)(endRowNumber - startRowNumber + 1);
    //     return startRowNumber + 1;
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._OwnerOffset, this._IsTypeOrMethodDefRefSizeSmall);
    }
}

export class MethodSpecTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsMethodDefOrRefRefSizeSmall: boolean;
    private readonly _IsBlobHeapRefSizeSmall: boolean;
    private readonly _MethodOffset: number;
    private readonly _InstantiationOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        methodDefOrRefRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsMethodDefOrRefRefSizeSmall = methodDefOrRefRefSize == 2;
        this._IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
        this._MethodOffset = 0;
        this._InstantiationOffset = this._MethodOffset + methodDefOrRefRefSize;
        this.RowSize = this._InstantiationOffset + blobHeapRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public EntityHandle GetMethod(MethodSpecificationHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return MethodDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _MethodOffset, _IsMethodDefOrRefRefSizeSmall));
    // }

    // public BlobHandle GetInstantiation(MethodSpecificationHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _InstantiationOffset, _IsBlobHeapRefSizeSmall));
    // }
}

export class GenericParamConstraintTableReader {
    public readonly NumberOfRows: number;
    private readonly _IsGenericParamTableRowRefSizeSmall: boolean;
    private readonly _IsTypeDefOrRefRefSizeSmall: boolean;
    private readonly _OwnerOffset: number;
    private readonly _ConstraintOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        genericParamTableRowRefSize: number,
        typeDefOrRefRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._IsGenericParamTableRowRefSizeSmall = genericParamTableRowRefSize == 2;
        this._IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
        this._OwnerOffset = 0;
        this._ConstraintOffset = this._OwnerOffset + genericParamTableRowRefSize;
        this.RowSize = this._ConstraintOffset + typeDefOrRefRefSize;
        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (!declaredSorted && !this.CheckSorted()) {
            Throw.TableNotSorted(TableIndex.GenericParamConstraint);
        }
    }

    // public GenericParameterConstraintHandleCollection FindConstraintsForGenericParam(GenericParameterHandle genericParameter)
    // {
    //     int startRowNumber, endRowNumber;
    //     this.Block.BinarySearchReferenceRange(
    //         this.NumberOfRows,
    //         this.RowSize,
    //         _OwnerOffset,
    //         (uint)genericParameter.RowId,
    //         _IsGenericParamTableRowRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber);

    //     if (startRowNumber == -1)
    //     {
    //         return default(GenericParameterConstraintHandleCollection);
    //     }

    //     return new GenericParameterConstraintHandleCollection(
    //         firstRowId: startRowNumber + 1,
    //         count: (ushort)(endRowNumber - startRowNumber + 1));
    // }

    private CheckSorted(): boolean {
        return this.Block.IsOrderedByReferenceAscending(this.RowSize, this._OwnerOffset, this._IsGenericParamTableRowRefSizeSmall);
    }

    // public EntityHandle GetConstraint(GenericParameterConstraintHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ConstraintOffset, _IsTypeDefOrRefRefSizeSmall));
    // }

    // public GenericParameterHandle GetOwner(GenericParameterConstraintHandle handle)
    // {
    //     int rowOffset = (handle.RowId - 1) * this.RowSize;
    //     return GenericParameterHandle.FromRowId(this.Block.PeekReference(rowOffset + _OwnerOffset, _IsGenericParamTableRowRefSizeSmall));
    // }
}