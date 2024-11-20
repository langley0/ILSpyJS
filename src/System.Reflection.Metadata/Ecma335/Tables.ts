import { sizeof } from "System";
import { MemoryBlock } from "System.Reflection.Internal";


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
    //     Debug.Assert(NumberOfRows > 0);
    //     return this.Block.PeekUInt16(_GenerationOffset);
    // }

    // public StringHandle GetName()
    // {
    //     Debug.Assert(NumberOfRows > 0);
    //     return StringHandle.FromOffset(this.Block.PeekHeapReference(_NameOffset, _IsStringHeapRefSizeSmall));
    // }

    // public GuidHandle GetMvid()
    // {
    //     Debug.Assert(NumberOfRows > 0);
    //     return GuidHandle.FromIndex(this.Block.PeekHeapReference(_MVIdOffset, _IsGUIDHeapRefSizeSmall));
    // }

    // public GuidHandle GetEncId()
    // {
    //     Debug.Assert(NumberOfRows > 0);
    //     return GuidHandle.FromIndex(this.Block.PeekHeapReference(_EnCIdOffset, _IsGUIDHeapRefSizeSmall));
    // }

    // public GuidHandle GetEncBaseId()
    // {
    //     Debug.Assert(NumberOfRows > 0);
    //     return GuidHandle.FromIndex(this.Block.PeekHeapReference(_EnCBaseIdOffset, _IsGUIDHeapRefSizeSmall));
    // }
}

// export class TypeRefTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsResolutionScopeRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _ResolutionScopeOffset;
//     private readonly int _NameOffset;
//     private readonly int _NamespaceOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public TypeRefTableReader(
//         int numberOfRows,
//         int resolutionScopeRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsResolutionScopeRefSizeSmall = resolutionScopeRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _ResolutionScopeOffset = 0;
//         _NameOffset = _ResolutionScopeOffset + resolutionScopeRefSize;
//         _NamespaceOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _NamespaceOffset + stringHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public EntityHandle GetResolutionScope(TypeReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return ResolutionScopeTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ResolutionScopeOffset, _IsResolutionScopeRefSizeSmall));
//     }

//     public StringHandle GetName(TypeReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public StringHandle GetNamespace(TypeReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NamespaceOffset, _IsStringHeapRefSizeSmall));
//     }
// }

// public struct TypeDefTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsFieldRefSizeSmall;
//     private readonly bool _IsMethodRefSizeSmall;
//     private readonly bool _IsTypeDefOrRefRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _NameOffset;
//     private readonly int _NamespaceOffset;
//     private readonly int _ExtendsOffset;
//     private readonly int _FieldListOffset;
//     private readonly int _MethodListOffset;
//     public readonly int RowSize;
//     public MemoryBlock Block;

//     public TypeDefTableReader(
//         int numberOfRows,
//         int fieldRefSize,
//         int methodRefSize,
//         int typeDefOrRefRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsFieldRefSizeSmall = fieldRefSize == 2;
//         _IsMethodRefSizeSmall = methodRefSize == 2;
//         _IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _NameOffset = _FlagsOffset + sizeof(uint);
//         _NamespaceOffset = _NameOffset + stringHeapRefSize;
//         _ExtendsOffset = _NamespaceOffset + stringHeapRefSize;
//         _FieldListOffset = _ExtendsOffset + typeDefOrRefRefSize;
//         _MethodListOffset = _FieldListOffset + fieldRefSize;
//         this.RowSize = _MethodListOffset + methodRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public TypeAttributes GetFlags(TypeDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (TypeAttributes)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
//     }

//     public NamespaceDefinitionHandle GetNamespaceDefinition(TypeDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return NamespaceDefinitionHandle.FromFullNameOffset(this.Block.PeekHeapReference(rowOffset + _NamespaceOffset, _IsStringHeapRefSizeSmall));
//     }

//     public StringHandle GetNamespace(TypeDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NamespaceOffset, _IsStringHeapRefSizeSmall));
//     }

//     public StringHandle GetName(TypeDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public EntityHandle GetExtends(TypeDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ExtendsOffset, _IsTypeDefOrRefRefSizeSmall));
//     }

//     public int GetFieldStart(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekReference(rowOffset + _FieldListOffset, _IsFieldRefSizeSmall);
//     }

//     public int GetMethodStart(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekReference(rowOffset + _MethodListOffset, _IsMethodRefSizeSmall);
//     }

//     public TypeDefinitionHandle FindTypeContainingMethod(int methodDefOrPtrRowId, int numberOfMethods)
//     {
//         int numOfRows = this.NumberOfRows;
//         int slot = this.Block.BinarySearchForSlot(numOfRows, this.RowSize, _MethodListOffset, (uint)methodDefOrPtrRowId, _IsMethodRefSizeSmall);
//         int row = slot + 1;
//         if (row == 0)
//         {
//             return default(TypeDefinitionHandle);
//         }

//         if (row > numOfRows)
//         {
//             if (methodDefOrPtrRowId <= numberOfMethods)
//             {
//                 return TypeDefinitionHandle.FromRowId(numOfRows);
//             }

//             return default(TypeDefinitionHandle);
//         }

//         int value = this.GetMethodStart(row);
//         if (value == methodDefOrPtrRowId)
//         {
//             while (row < numOfRows)
//             {
//                 int newRow = row + 1;
//                 value = this.GetMethodStart(newRow);
//                 if (value == methodDefOrPtrRowId)
//                 {
//                     row = newRow;
//                 }
//                 else
//                 {
//                     break;
//                 }
//             }
//         }

//         return TypeDefinitionHandle.FromRowId(row);
//     }

//     public TypeDefinitionHandle FindTypeContainingField(int fieldDefOrPtrRowId, int numberOfFields)
//     {
//         int numOfRows = this.NumberOfRows;
//         int slot = this.Block.BinarySearchForSlot(numOfRows, this.RowSize, _FieldListOffset, (uint)fieldDefOrPtrRowId, _IsFieldRefSizeSmall);
//         int row = slot + 1;
//         if (row == 0)
//         {
//             return default(TypeDefinitionHandle);
//         }

//         if (row > numOfRows)
//         {
//             if (fieldDefOrPtrRowId <= numberOfFields)
//             {
//                 return TypeDefinitionHandle.FromRowId(numOfRows);
//             }

//             return default(TypeDefinitionHandle);
//         }

//         int value = this.GetFieldStart(row);
//         if (value == fieldDefOrPtrRowId)
//         {
//             while (row < numOfRows)
//             {
//                 int newRow = row + 1;
//                 value = this.GetFieldStart(newRow);
//                 if (value == fieldDefOrPtrRowId)
//                 {
//                     row = newRow;
//                 }
//                 else
//                 {
//                     break;
//                 }
//             }
//         }

//         return TypeDefinitionHandle.FromRowId(row);
//     }
// }

// export class FieldPtrTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsFieldTableRowRefSizeSmall;
//     private readonly int _FieldOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public FieldPtrTableReader(
//         int numberOfRows,
//         int fieldTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsFieldTableRowRefSizeSmall = fieldTableRowRefSize == 2;
//         _FieldOffset = 0;
//         this.RowSize = _FieldOffset + fieldTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public FieldDefinitionHandle GetFieldFor(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return FieldDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _FieldOffset, _IsFieldTableRowRefSizeSmall));
//     }

//     public int GetRowIdForFieldDefRow(int fieldDefRowId)
//     {
//         return this.Block.LinearSearchReference(this.RowSize, _FieldOffset, (uint)fieldDefRowId, _IsFieldTableRowRefSizeSmall) + 1;
//     }
// }

// export class FieldTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _NameOffset;
//     private readonly int _SignatureOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public FieldTableReader(
//         int numberOfRows,
//         int stringHeapRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _NameOffset = _FlagsOffset + sizeof(ushort);
//         _SignatureOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _SignatureOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public StringHandle GetName(FieldDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public FieldAttributes GetFlags(FieldDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (FieldAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
//     }

//     public BlobHandle GetSignature(FieldDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
//     }
// }

// export class MethodPtrTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsMethodTableRowRefSizeSmall;
//     private readonly int _MethodOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public MethodPtrTableReader(
//         int numberOfRows,
//         int methodTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsMethodTableRowRefSizeSmall = methodTableRowRefSize == 2;
//         _MethodOffset = 0;
//         this.RowSize = _MethodOffset + methodTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     // returns a rid
//     public MethodDefinitionHandle GetMethodFor(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return MethodDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _MethodOffset, _IsMethodTableRowRefSizeSmall));
//     }

//     public int GetRowIdForMethodDefRow(int methodDefRowId)
//     {
//         return this.Block.LinearSearchReference(this.RowSize, _MethodOffset, (uint)methodDefRowId, _IsMethodTableRowRefSizeSmall) + 1;
//     }
// }

// export class MethodTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsParamRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _RvaOffset;
//     private readonly int _ImplFlagsOffset;
//     private readonly int _FlagsOffset;
//     private readonly int _NameOffset;
//     private readonly int _SignatureOffset;
//     private readonly int _ParamListOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public MethodTableReader(
//         int numberOfRows,
//         int paramRefSize,
//         int stringHeapRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsParamRefSizeSmall = paramRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _RvaOffset = 0;
//         _ImplFlagsOffset = _RvaOffset + sizeof(uint);
//         _FlagsOffset = _ImplFlagsOffset + sizeof(ushort);
//         _NameOffset = _FlagsOffset + sizeof(ushort);
//         _SignatureOffset = _NameOffset + stringHeapRefSize;
//         _ParamListOffset = _SignatureOffset + blobHeapRefSize;
//         this.RowSize = _ParamListOffset + paramRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public int GetParamStart(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekReference(rowOffset + _ParamListOffset, _IsParamRefSizeSmall);
//     }

//     public BlobHandle GetSignature(MethodDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public int GetRva(MethodDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return this.Block.PeekInt32(rowOffset + _RvaOffset);
//     }

//     public StringHandle GetName(MethodDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public MethodAttributes GetFlags(MethodDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (MethodAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
//     }

//     public MethodImplAttributes GetImplFlags(MethodDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (MethodImplAttributes)this.Block.PeekUInt16(rowOffset + _ImplFlagsOffset);
//     }
// }

// export class ParamPtrTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsParamTableRowRefSizeSmall;
//     private readonly int _ParamOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ParamPtrTableReader(
//         int numberOfRows,
//         int paramTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsParamTableRowRefSizeSmall = paramTableRowRefSize == 2;
//         _ParamOffset = 0;
//         this.RowSize = _ParamOffset + paramTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public ParameterHandle GetParamFor(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return ParameterHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParamOffset, _IsParamTableRowRefSizeSmall));
//     }
// }

// export class ParamTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _SequenceOffset;
//     private readonly int _NameOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ParamTableReader(
//         int numberOfRows,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _SequenceOffset = _FlagsOffset + sizeof(ushort);
//         _NameOffset = _SequenceOffset + sizeof(ushort);
//         this.RowSize = _NameOffset + stringHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public ParameterAttributes GetFlags(ParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (ParameterAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
//     }

//     public ushort GetSequence(ParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return this.Block.PeekUInt16(rowOffset + _SequenceOffset);
//     }

//     public StringHandle GetName(ParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }
// }

// export class InterfaceImplTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsTypeDefTableRowRefSizeSmall;
//     private readonly bool _IsTypeDefOrRefRefSizeSmall;
//     private readonly int _ClassOffset;
//     private readonly int _InterfaceOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public InterfaceImplTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int typeDefTableRowRefSize,
//         int typeDefOrRefRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
//         _IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
//         _ClassOffset = 0;
//         _InterfaceOffset = _ClassOffset + typeDefTableRowRefSize;
//         this.RowSize = _InterfaceOffset + typeDefOrRefRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.InterfaceImpl);
//         }
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ClassOffset, _IsTypeDefTableRowRefSizeSmall);
//     }

//     public void GetInterfaceImplRange(
//         TypeDefinitionHandle typeDef,
//         out int firstImplRowId,
//         out int lastImplRowId)
//     {
//         int typeDefRid = typeDef.RowId;

//         int startRowNumber, endRowNumber;
//         this.Block.BinarySearchReferenceRange(
//             this.NumberOfRows,
//             this.RowSize,
//             _ClassOffset,
//             (uint)typeDefRid,
//             _IsTypeDefTableRowRefSizeSmall,
//             out startRowNumber,
//             out endRowNumber);

//         if (startRowNumber == -1)
//         {
//             firstImplRowId = 1;
//             lastImplRowId = 0;
//         }
//         else
//         {
//             firstImplRowId = startRowNumber + 1;
//             lastImplRowId = endRowNumber + 1;
//         }
//     }

//     public EntityHandle GetInterface(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _InterfaceOffset, _IsTypeDefOrRefRefSizeSmall));
//     }
// }

// public struct MemberRefTableReader
// {
//     public int NumberOfRows;
//     private readonly bool _IsMemberRefParentRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _ClassOffset;
//     private readonly int _NameOffset;
//     private readonly int _SignatureOffset;
//     public readonly int RowSize;
//     public MemoryBlock Block;

//     public MemberRefTableReader(
//         int numberOfRows,
//         int memberRefParentRefSize,
//         int stringHeapRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsMemberRefParentRefSizeSmall = memberRefParentRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _ClassOffset = 0;
//         _NameOffset = _ClassOffset + memberRefParentRefSize;
//         _SignatureOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _SignatureOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public BlobHandle GetSignature(MemberReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public StringHandle GetName(MemberReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public EntityHandle GetClass(MemberReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return MemberRefParentTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ClassOffset, _IsMemberRefParentRefSizeSmall));
//     }
// }

// export class ConstantTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsHasConstantRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _TypeOffset;
//     private readonly int _ParentOffset;
//     private readonly int _ValueOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ConstantTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int hasConstantRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsHasConstantRefSizeSmall = hasConstantRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _TypeOffset = 0;
//         _ParentOffset = _TypeOffset + sizeof(byte) + 1; // Alignment here (+1)...
//         _ValueOffset = _ParentOffset + hasConstantRefSize;
//         this.RowSize = _ValueOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.Constant);
//         }
//     }

//     public ConstantTypeCode GetType(ConstantHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (ConstantTypeCode)this.Block.PeekByte(rowOffset + _TypeOffset);
//     }

//     public BlobHandle GetValue(ConstantHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _ValueOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public EntityHandle GetParent(ConstantHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return HasConstantTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasConstantRefSizeSmall));
//     }

//     public ConstantHandle FindConstant(EntityHandle parentHandle)
//     {
//         int foundRowNumber =
//           this.Block.BinarySearchReference(
//             this.NumberOfRows,
//             this.RowSize,
//             _ParentOffset,
//             HasConstantTag.ConvertToTag(parentHandle),
//             _IsHasConstantRefSizeSmall);

//         return ConstantHandle.FromRowId(foundRowNumber + 1);
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ParentOffset, _IsHasConstantRefSizeSmall);
//     }
// }

// export class CustomAttributeTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsHasCustomAttributeRefSizeSmall;
//     private readonly bool _IsCustomAttributeTypeRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _ParentOffset;
//     private readonly int _TypeOffset;
//     private readonly int _ValueOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     // row ids in the CustomAttribute table sorted by parents
//     public readonly int[]? PtrTable;

//     public CustomAttributeTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int hasCustomAttributeRefSize,
//         int customAttributeTypeRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsHasCustomAttributeRefSizeSmall = hasCustomAttributeRefSize == 2;
//         _IsCustomAttributeTypeRefSizeSmall = customAttributeTypeRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _ParentOffset = 0;
//         _TypeOffset = _ParentOffset + hasCustomAttributeRefSize;
//         _ValueOffset = _TypeOffset + customAttributeTypeRefSize;
//         this.RowSize = _ValueOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//         this.PtrTable = undefined;

//         if (!declaredSorted && !CheckSorted())
//         {
//             this.PtrTable = this.Block.BuildPtrTable(
//                 numberOfRows,
//                 this.RowSize,
//                 _ParentOffset,
//                 _IsHasCustomAttributeRefSizeSmall);
//         }
//     }

//     public EntityHandle GetParent(CustomAttributeHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return HasCustomAttributeTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasCustomAttributeRefSizeSmall));
//     }

//     public EntityHandle GetConstructor(CustomAttributeHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return CustomAttributeTypeTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _TypeOffset, _IsCustomAttributeTypeRefSizeSmall));
//     }

//     public BlobHandle GetValue(CustomAttributeHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _ValueOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public void GetAttributeRange(EntityHandle parentHandle, out int firstImplRowId, out int lastImplRowId)
//     {
//         int startRowNumber, endRowNumber;

//         if (this.PtrTable != undefined)
//         {
//             this.Block.BinarySearchReferenceRange(
//                 this.PtrTable,
//                 this.RowSize,
//                 _ParentOffset,
//                 HasCustomAttributeTag.ConvertToTag(parentHandle),
//                 _IsHasCustomAttributeRefSizeSmall,
//                 out startRowNumber,
//                 out endRowNumber
//             );
//         }
//         else
//         {
//             this.Block.BinarySearchReferenceRange(
//                 this.NumberOfRows,
//                 this.RowSize,
//                 _ParentOffset,
//                 HasCustomAttributeTag.ConvertToTag(parentHandle),
//                 _IsHasCustomAttributeRefSizeSmall,
//                 out startRowNumber,
//                 out endRowNumber
//             );
//         }

//         if (startRowNumber == -1)
//         {
//             firstImplRowId = 1;
//             lastImplRowId = 0;
//         }
//         else
//         {
//             firstImplRowId = startRowNumber + 1;
//             lastImplRowId = endRowNumber + 1;
//         }
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ParentOffset, _IsHasCustomAttributeRefSizeSmall);
//     }
// }

// export class FieldMarshalTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsHasFieldMarshalRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _ParentOffset;
//     private readonly int _NativeTypeOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public FieldMarshalTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int hasFieldMarshalRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsHasFieldMarshalRefSizeSmall = hasFieldMarshalRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _ParentOffset = 0;
//         _NativeTypeOffset = _ParentOffset + hasFieldMarshalRefSize;
//         this.RowSize = _NativeTypeOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.FieldMarshal);
//         }
//     }

//     public EntityHandle GetParent(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return HasFieldMarshalTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasFieldMarshalRefSizeSmall));
//     }

//     public BlobHandle GetNativeType(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NativeTypeOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public int FindFieldMarshalRowId(EntityHandle handle)
//     {
//         int foundRowNumber =
//           this.Block.BinarySearchReference(
//             this.NumberOfRows,
//             this.RowSize,
//             _ParentOffset,
//             HasFieldMarshalTag.ConvertToTag(handle),
//             _IsHasFieldMarshalRefSizeSmall);

//         return foundRowNumber + 1;
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ParentOffset, _IsHasFieldMarshalRefSizeSmall);
//     }
// }

// export class DeclSecurityTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsHasDeclSecurityRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _ActionOffset;
//     private readonly int _ParentOffset;
//     private readonly int _PermissionSetOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public DeclSecurityTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int hasDeclSecurityRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsHasDeclSecurityRefSizeSmall = hasDeclSecurityRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _ActionOffset = 0;
//         _ParentOffset = _ActionOffset + sizeof(ushort);
//         _PermissionSetOffset = _ParentOffset + hasDeclSecurityRefSize;
//         this.RowSize = _PermissionSetOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.DeclSecurity);
//         }
//     }

//     public DeclarativeSecurityAction GetAction(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return (DeclarativeSecurityAction)this.Block.PeekUInt16(rowOffset + _ActionOffset);
//     }

//     public EntityHandle GetParent(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return HasDeclSecurityTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ParentOffset, _IsHasDeclSecurityRefSizeSmall));
//     }

//     public BlobHandle GetPermissionSet(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _PermissionSetOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public void GetAttributeRange(EntityHandle parentToken, out int firstImplRowId, out int lastImplRowId)
//     {
//         int startRowNumber, endRowNumber;

//         this.Block.BinarySearchReferenceRange(
//             this.NumberOfRows,
//             this.RowSize,
//             _ParentOffset,
//             HasDeclSecurityTag.ConvertToTag(parentToken),
//             _IsHasDeclSecurityRefSizeSmall,
//             out startRowNumber,
//             out endRowNumber);

//         if (startRowNumber == -1)
//         {
//             firstImplRowId = 1;
//             lastImplRowId = 0;
//         }
//         else
//         {
//             firstImplRowId = startRowNumber + 1;
//             lastImplRowId = endRowNumber + 1;
//         }
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ParentOffset, _IsHasDeclSecurityRefSizeSmall);
//     }
// }

// public struct ClassLayoutTableReader
// {
//     public int NumberOfRows;
//     private readonly bool _IsTypeDefTableRowRefSizeSmall;
//     private readonly int _PackagingSizeOffset;
//     private readonly int _ClassSizeOffset;
//     private readonly int _ParentOffset;
//     public readonly int RowSize;
//     public MemoryBlock Block;

//     public ClassLayoutTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int typeDefTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
//         _PackagingSizeOffset = 0;
//         _ClassSizeOffset = _PackagingSizeOffset + sizeof(ushort);
//         _ParentOffset = _ClassSizeOffset + sizeof(uint);
//         this.RowSize = _ParentOffset + typeDefTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.ClassLayout);
//         }
//     }

//     public TypeDefinitionHandle GetParent(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParentOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     public ushort GetPackingSize(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekUInt16(rowOffset + _PackagingSizeOffset);
//     }

//     public uint GetClassSize(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekUInt32(rowOffset + _ClassSizeOffset);
//     }

//     // Returns RowId (0 means we there is no record in this table corresponding to the specified type).
//     public int FindRow(TypeDefinitionHandle typeDef)
//     {
//         return 1 + this.Block.BinarySearchReference(
//             this.NumberOfRows,
//             this.RowSize,
//             _ParentOffset,
//             (uint)typeDef.RowId,
//             _IsTypeDefTableRowRefSizeSmall);
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ParentOffset, _IsTypeDefTableRowRefSizeSmall);
//     }
// }

// export class FieldLayoutTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsFieldTableRowRefSizeSmall;
//     private readonly int _OffsetOffset;
//     private readonly int _FieldOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public FieldLayoutTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int fieldTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsFieldTableRowRefSizeSmall = fieldTableRowRefSize == 2;
//         _OffsetOffset = 0;
//         _FieldOffset = _OffsetOffset + sizeof(uint);
//         this.RowSize = _FieldOffset + fieldTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.FieldLayout);
//         }
//     }

//     /// <summary>
//     /// Returns field offset for given field RowId, or -1 if not available.
//     /// </summary>
//     public int FindFieldLayoutRowId(FieldDefinitionHandle handle)
//     {
//         int rowNumber =
//           this.Block.BinarySearchReference(
//             this.NumberOfRows,
//             this.RowSize,
//             _FieldOffset,
//             (uint)handle.RowId,
//             _IsFieldTableRowRefSizeSmall);

//         return rowNumber + 1;
//     }

//     public uint GetOffset(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekUInt32(rowOffset + _OffsetOffset);
//     }

//     public FieldDefinitionHandle GetField(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return FieldDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _FieldOffset, _IsFieldTableRowRefSizeSmall));
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _FieldOffset, _IsFieldTableRowRefSizeSmall);
//     }
// }

// export class StandAloneSigTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _SignatureOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public StandAloneSigTableReader(
//         int numberOfRows,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _SignatureOffset = 0;
//         this.RowSize = _SignatureOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public BlobHandle GetSignature(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
//     }
// }

// export class EventMapTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsTypeDefTableRowRefSizeSmall;
//     private readonly bool _IsEventRefSizeSmall;
//     private readonly int _ParentOffset;
//     private readonly int _EventListOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public EventMapTableReader(
//         int numberOfRows,
//         int typeDefTableRowRefSize,
//         int eventRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
//         _IsEventRefSizeSmall = eventRefSize == 2;
//         _ParentOffset = 0;
//         _EventListOffset = _ParentOffset + typeDefTableRowRefSize;
//         this.RowSize = _EventListOffset + eventRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public int FindEventMapRowIdFor(TypeDefinitionHandle typeDef)
//     {
//         // We do a linear scan here because we don't have these tables sorted
//         // TODO: We can scan the table to see if it is sorted and use binary search if so.
//         // Also, the compilers should make sure it's sorted.
//         int rowNumber = this.Block.LinearSearchReference(
//             this.RowSize,
//             _ParentOffset,
//             (uint)typeDef.RowId,
//             _IsTypeDefTableRowRefSizeSmall);

//         return rowNumber + 1;
//     }

//     public TypeDefinitionHandle GetParentType(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParentOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     public int GetEventListStartFor(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekReference(rowOffset + _EventListOffset, _IsEventRefSizeSmall);
//     }
// }

// export class EventPtrTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsEventTableRowRefSizeSmall;
//     private readonly int _EventOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public EventPtrTableReader(
//         int numberOfRows,
//         int eventTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsEventTableRowRefSizeSmall = eventTableRowRefSize == 2;
//         _EventOffset = 0;
//         this.RowSize = _EventOffset + eventTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public EventDefinitionHandle GetEventFor(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return EventDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _EventOffset, _IsEventTableRowRefSizeSmall));
//     }
// }

// public struct EventTableReader
// {
//     public int NumberOfRows;
//     private readonly bool _IsTypeDefOrRefRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _NameOffset;
//     private readonly int _EventTypeOffset;
//     public readonly int RowSize;
//     public MemoryBlock Block;

//     public EventTableReader(
//         int numberOfRows,
//         int typeDefOrRefRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _NameOffset = _FlagsOffset + sizeof(ushort);
//         _EventTypeOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _EventTypeOffset + typeDefOrRefRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public EventAttributes GetFlags(EventDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (EventAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
//     }

//     public StringHandle GetName(EventDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public EntityHandle GetEventType(EventDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _EventTypeOffset, _IsTypeDefOrRefRefSizeSmall));
//     }
// }

// export class PropertyMapTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsTypeDefTableRowRefSizeSmall;
//     private readonly bool _IsPropertyRefSizeSmall;
//     private readonly int _ParentOffset;
//     private readonly int _PropertyListOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public PropertyMapTableReader(
//         int numberOfRows,
//         int typeDefTableRowRefSize,
//         int propertyRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
//         _IsPropertyRefSizeSmall = propertyRefSize == 2;
//         _ParentOffset = 0;
//         _PropertyListOffset = _ParentOffset + typeDefTableRowRefSize;
//         this.RowSize = _PropertyListOffset + propertyRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public int FindPropertyMapRowIdFor(TypeDefinitionHandle typeDef)
//     {
//         // We do a linear scan here because we don't have these tables sorted.
//         // TODO: We can scan the table to see if it is sorted and use binary search if so.
//         // Also, the compilers should make sure it's sorted.
//         int rowNumber =
//           this.Block.LinearSearchReference(
//             this.RowSize,
//             _ParentOffset,
//             (uint)typeDef.RowId,
//             _IsTypeDefTableRowRefSizeSmall);

//         return rowNumber + 1;
//     }

//     public TypeDefinitionHandle GetParentType(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ParentOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     public int GetPropertyListStartFor(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekReference(rowOffset + _PropertyListOffset, _IsPropertyRefSizeSmall);
//     }
// }

// export class PropertyPtrTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsPropertyTableRowRefSizeSmall;
//     private readonly int _PropertyOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public PropertyPtrTableReader(
//         int numberOfRows,
//         int propertyTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsPropertyTableRowRefSizeSmall = propertyTableRowRefSize == 2;
//         _PropertyOffset = 0;
//         this.RowSize = _PropertyOffset + propertyTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public PropertyDefinitionHandle GetPropertyFor(
//       int rowId
//     )
//     // ^ requires rowId <= this.NumberOfRows;
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return PropertyDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _PropertyOffset, _IsPropertyTableRowRefSizeSmall));
//     }
// }

// export class PropertyTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _NameOffset;
//     private readonly int _SignatureOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public PropertyTableReader(
//         int numberOfRows,
//         int stringHeapRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _NameOffset = _FlagsOffset + sizeof(ushort);
//         _SignatureOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _SignatureOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public PropertyAttributes GetFlags(PropertyDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (PropertyAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
//     }

//     public StringHandle GetName(PropertyDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public BlobHandle GetSignature(PropertyDefinitionHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
//     }
// }

// export class MethodSemanticsTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsMethodTableRowRefSizeSmall;
//     private readonly bool _IsHasSemanticRefSizeSmall;
//     private readonly int _SemanticsFlagOffset;
//     private readonly int _MethodOffset;
//     private readonly int _AssociationOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public MethodSemanticsTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int methodTableRowRefSize,
//         int hasSemanticRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsMethodTableRowRefSizeSmall = methodTableRowRefSize == 2;
//         _IsHasSemanticRefSizeSmall = hasSemanticRefSize == 2;
//         _SemanticsFlagOffset = 0;
//         _MethodOffset = _SemanticsFlagOffset + sizeof(ushort);
//         _AssociationOffset = _MethodOffset + methodTableRowRefSize;
//         this.RowSize = _AssociationOffset + hasSemanticRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.MethodSemantics);
//         }
//     }

//     public MethodDefinitionHandle GetMethod(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return MethodDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _MethodOffset, _IsMethodTableRowRefSizeSmall));
//     }

//     public MethodSemanticsAttributes GetSemantics(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return (MethodSemanticsAttributes)this.Block.PeekUInt16(rowOffset + _SemanticsFlagOffset);
//     }

//     public EntityHandle GetAssociation(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return HasSemanticsTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _AssociationOffset, _IsHasSemanticRefSizeSmall));
//     }

//     // returns rowID
//     public int FindSemanticMethodsForEvent(EventDefinitionHandle eventDef, out ushort methodCount)
//     {
//         methodCount = 0;
//         uint searchCodedTag = HasSemanticsTag.ConvertEventHandleToTag(eventDef);
//         return this.BinarySearchTag(searchCodedTag, ref methodCount);
//     }

//     public int FindSemanticMethodsForProperty(PropertyDefinitionHandle propertyDef, out ushort methodCount)
//     {
//         methodCount = 0;
//         uint searchCodedTag = HasSemanticsTag.ConvertPropertyHandleToTag(propertyDef);
//         return this.BinarySearchTag(searchCodedTag, ref methodCount);
//     }

//     private int BinarySearchTag(uint searchCodedTag, ref ushort methodCount)
//     {
//         int startRowNumber, endRowNumber;
//         this.Block.BinarySearchReferenceRange(
//             this.NumberOfRows,
//             this.RowSize,
//             _AssociationOffset,
//             searchCodedTag,
//             _IsHasSemanticRefSizeSmall,
//             out startRowNumber,
//             out endRowNumber
//         );

//         if (startRowNumber == -1)
//         {
//             methodCount = 0;
//             return 0;
//         }

//         methodCount = (ushort)(endRowNumber - startRowNumber + 1);
//         return startRowNumber + 1;
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _AssociationOffset, _IsHasSemanticRefSizeSmall);
//     }
// }

// export class MethodImplTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsTypeDefTableRowRefSizeSmall;
//     private readonly bool _IsMethodDefOrRefRefSizeSmall;
//     private readonly int _ClassOffset;
//     private readonly int _MethodBodyOffset;
//     private readonly int _MethodDeclarationOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public MethodImplTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int typeDefTableRowRefSize,
//         int methodDefOrRefRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
//         _IsMethodDefOrRefRefSizeSmall = methodDefOrRefRefSize == 2;
//         _ClassOffset = 0;
//         _MethodBodyOffset = _ClassOffset + typeDefTableRowRefSize;
//         _MethodDeclarationOffset = _MethodBodyOffset + methodDefOrRefRefSize;
//         this.RowSize = _MethodDeclarationOffset + methodDefOrRefRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.MethodImpl);
//         }
//     }

//     public TypeDefinitionHandle GetClass(MethodImplementationHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _ClassOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     public EntityHandle GetMethodBody(MethodImplementationHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return MethodDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _MethodBodyOffset, _IsMethodDefOrRefRefSizeSmall));
//     }

//     public EntityHandle GetMethodDeclaration(MethodImplementationHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return MethodDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _MethodDeclarationOffset, _IsMethodDefOrRefRefSizeSmall));
//     }

//     public void GetMethodImplRange(
//         TypeDefinitionHandle typeDef,
//         out int firstImplRowId,
//         out int lastImplRowId)
//     {
//         int startRowNumber, endRowNumber;
//         this.Block.BinarySearchReferenceRange(
//             this.NumberOfRows,
//             this.RowSize,
//             _ClassOffset,
//             (uint)typeDef.RowId,
//             _IsTypeDefTableRowRefSizeSmall,
//             out startRowNumber,
//             out endRowNumber);

//         if (startRowNumber == -1)
//         {
//             firstImplRowId = 1;
//             lastImplRowId = 0;
//         }
//         else
//         {
//             firstImplRowId = startRowNumber + 1;
//             lastImplRowId = endRowNumber + 1;
//         }
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _ClassOffset, _IsTypeDefTableRowRefSizeSmall);
//     }
// }

// export class ModuleRefTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _NameOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ModuleRefTableReader(
//         int numberOfRows,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _NameOffset = 0;
//         this.RowSize = _NameOffset + stringHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public StringHandle GetName(ModuleReferenceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }
// }

// export class TypeSpecTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _SignatureOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public TypeSpecTableReader(
//         int numberOfRows,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _SignatureOffset = 0;
//         this.RowSize = _SignatureOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public BlobHandle GetSignature(TypeSpecificationHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _SignatureOffset, _IsBlobHeapRefSizeSmall));
//     }
// }

// export class ImplMapTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsModuleRefTableRowRefSizeSmall;
//     private readonly bool _IsMemberForwardRowRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _MemberForwardedOffset;
//     private readonly int _ImportNameOffset;
//     private readonly int _ImportScopeOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ImplMapTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int moduleRefTableRowRefSize,
//         int memberForwardedRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsModuleRefTableRowRefSizeSmall = moduleRefTableRowRefSize == 2;
//         _IsMemberForwardRowRefSizeSmall = memberForwardedRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _MemberForwardedOffset = _FlagsOffset + sizeof(ushort);
//         _ImportNameOffset = _MemberForwardedOffset + memberForwardedRefSize;
//         _ImportScopeOffset = _ImportNameOffset + stringHeapRefSize;
//         this.RowSize = _ImportScopeOffset + moduleRefTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.ImplMap);
//         }
//     }

//     public MethodImport GetImport(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         var pInvokeMapFlags = (MethodImportAttributes)Block.PeekUInt16(rowOffset + _FlagsOffset);
//         var importName = StringHandle.FromOffset(Block.PeekHeapReference(rowOffset + _ImportNameOffset, _IsStringHeapRefSizeSmall));
//         var importScope = ModuleReferenceHandle.FromRowId(Block.PeekReference(rowOffset + _ImportScopeOffset, _IsModuleRefTableRowRefSizeSmall));
//         return new MethodImport(pInvokeMapFlags, importName, importScope);
//     }

//     public EntityHandle GetMemberForwarded(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return MemberForwardedTag.ConvertToHandle(Block.PeekTaggedReference(rowOffset + _MemberForwardedOffset, _IsMemberForwardRowRefSizeSmall));
//     }

//     public int FindImplForMethod(MethodDefinitionHandle methodDef)
//     {
//         uint searchCodedTag = MemberForwardedTag.ConvertMethodDefToTag(methodDef);
//         return this.BinarySearchTag(searchCodedTag);
//     }

//     private int BinarySearchTag(uint searchCodedTag)
//     {
//         int foundRowNumber =
//           this.Block.BinarySearchReference(
//             this.NumberOfRows,
//             this.RowSize,
//             _MemberForwardedOffset,
//             searchCodedTag,
//             _IsMemberForwardRowRefSizeSmall);

//         return foundRowNumber + 1;
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _MemberForwardedOffset, _IsMemberForwardRowRefSizeSmall);
//     }
// }

// export class FieldRVATableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsFieldTableRowRefSizeSmall;
//     private readonly int _RvaOffset;
//     private readonly int _FieldOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public FieldRVATableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int fieldTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsFieldTableRowRefSizeSmall = fieldTableRowRefSize == 2;
//         _RvaOffset = 0;
//         _FieldOffset = _RvaOffset + sizeof(uint);
//         this.RowSize = _FieldOffset + fieldTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.FieldRva);
//         }
//     }

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

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _FieldOffset, _IsFieldTableRowRefSizeSmall);
//     }
// }

// export class EnCLogTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly int _TokenOffset;
//     private readonly int _FuncCodeOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public EnCLogTableReader(
//         int numberOfRows,
//         MemoryBlock containingBlock,
//         int containingBlockOffset,
//         MetadataStreamKind metadataStreamKind)
//     {
//         // EnC tables are not allowed in a compressed stream.
//         // However when asked for a snapshot of the current metadata after an EnC change has been applied
//         // the CLR includes the EnCLog table into the snapshot (but not EnCMap). We pretend EnCLog is empty.
//         this.NumberOfRows = (metadataStreamKind == MetadataStreamKind.Compressed) ? 0 : numberOfRows;

//         _TokenOffset = 0;
//         _FuncCodeOffset = _TokenOffset + sizeof(uint);
//         this.RowSize = _FuncCodeOffset + sizeof(uint);
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public uint GetToken(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekUInt32(rowOffset + _TokenOffset);
//     }

//     public EditAndContinueOperation GetFuncCode(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return (EditAndContinueOperation)this.Block.PeekUInt32(rowOffset + _FuncCodeOffset);
//     }
// }

// export class EnCMapTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly int _TokenOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public EnCMapTableReader(
//         int numberOfRows,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _TokenOffset = 0;
//         this.RowSize = _TokenOffset + sizeof(uint);
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public uint GetToken(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekUInt32(rowOffset + _TokenOffset);
//     }
// }

// export class AssemblyTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _HashAlgIdOffset;
//     private readonly int _MajorVersionOffset;
//     private readonly int _MinorVersionOffset;
//     private readonly int _BuildNumberOffset;
//     private readonly int _RevisionNumberOffset;
//     private readonly int _FlagsOffset;
//     private readonly int _PublicKeyOffset;
//     private readonly int _NameOffset;
//     private readonly int _CultureOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public AssemblyTableReader(
//         int numberOfRows,
//         int stringHeapRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         // NOTE: obfuscated assemblies may have more than one row in Assembly table,
//         //       we ignore all rows but the first one
//         this.NumberOfRows = numberOfRows > 1 ? 1 : numberOfRows;

//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _HashAlgIdOffset = 0;
//         _MajorVersionOffset = _HashAlgIdOffset + sizeof(uint);
//         _MinorVersionOffset = _MajorVersionOffset + sizeof(ushort);
//         _BuildNumberOffset = _MinorVersionOffset + sizeof(ushort);
//         _RevisionNumberOffset = _BuildNumberOffset + sizeof(ushort);
//         _FlagsOffset = _RevisionNumberOffset + sizeof(ushort);
//         _PublicKeyOffset = _FlagsOffset + sizeof(uint);
//         _NameOffset = _PublicKeyOffset + blobHeapRefSize;
//         _CultureOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _CultureOffset + stringHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public AssemblyHashAlgorithm GetHashAlgorithm()
//     {
//         Debug.Assert(NumberOfRows == 1);
//         return (AssemblyHashAlgorithm)this.Block.PeekUInt32(_HashAlgIdOffset);
//     }

//     public Version GetVersion()
//     {
//         Debug.Assert(NumberOfRows == 1);
//         return new Version(
//             this.Block.PeekUInt16(_MajorVersionOffset),
//             this.Block.PeekUInt16(_MinorVersionOffset),
//             this.Block.PeekUInt16(_BuildNumberOffset),
//             this.Block.PeekUInt16(_RevisionNumberOffset));
//     }

//     public AssemblyFlags GetFlags()
//     {
//         Debug.Assert(NumberOfRows == 1);
//         return (AssemblyFlags)this.Block.PeekUInt32(_FlagsOffset);
//     }

//     public BlobHandle GetPublicKey()
//     {
//         Debug.Assert(NumberOfRows == 1);
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(_PublicKeyOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public StringHandle GetName()
//     {
//         Debug.Assert(NumberOfRows == 1);
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(_NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public StringHandle GetCulture()
//     {
//         Debug.Assert(NumberOfRows == 1);
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(_CultureOffset, _IsStringHeapRefSizeSmall));
//     }
// }

// export class AssemblyProcessorTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly int _ProcessorOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public AssemblyProcessorTableReader(
//         int numberOfRows,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _ProcessorOffset = 0;
//         this.RowSize = _ProcessorOffset + sizeof(uint);
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }
// }

// export class AssemblyOSTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly int _OSPlatformIdOffset;
//     private readonly int _OSMajorVersionIdOffset;
//     private readonly int _OSMinorVersionIdOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public AssemblyOSTableReader(
//         int numberOfRows,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _OSPlatformIdOffset = 0;
//         _OSMajorVersionIdOffset = _OSPlatformIdOffset + sizeof(uint);
//         _OSMinorVersionIdOffset = _OSMajorVersionIdOffset + sizeof(uint);
//         this.RowSize = _OSMinorVersionIdOffset + sizeof(uint);
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }
// }

// export class AssemblyRefTableReader
// {
//     /// <summary>
//     /// In CLI metadata equal to the actual number of entries in AssemblyRef table.
//     /// In WinMD metadata it includes synthesized AssemblyRefs in addition.
//     /// </summary>
//     public readonly int NumberOfNonVirtualRows;
//     public readonly int NumberOfVirtualRows;

//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _MajorVersionOffset;
//     private readonly int _MinorVersionOffset;
//     private readonly int _BuildNumberOffset;
//     private readonly int _RevisionNumberOffset;
//     private readonly int _FlagsOffset;
//     private readonly int _PublicKeyOrTokenOffset;
//     private readonly int _NameOffset;
//     private readonly int _CultureOffset;
//     private readonly int _HashValueOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public AssemblyRefTableReader(
//         int numberOfRows,
//         int stringHeapRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset,
//         MetadataKind metadataKind)
//     {
//         this.NumberOfNonVirtualRows = numberOfRows;
//         this.NumberOfVirtualRows = (metadataKind == MetadataKind.Ecma335) ? 0 : AssemblyReferenceHandle.VirtualIndex.Count;

//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _MajorVersionOffset = 0;
//         _MinorVersionOffset = _MajorVersionOffset + sizeof(ushort);
//         _BuildNumberOffset = _MinorVersionOffset + sizeof(ushort);
//         _RevisionNumberOffset = _BuildNumberOffset + sizeof(ushort);
//         _FlagsOffset = _RevisionNumberOffset + sizeof(ushort);
//         _PublicKeyOrTokenOffset = _FlagsOffset + sizeof(uint);
//         _NameOffset = _PublicKeyOrTokenOffset + blobHeapRefSize;
//         _CultureOffset = _NameOffset + stringHeapRefSize;
//         _HashValueOffset = _CultureOffset + stringHeapRefSize;
//         this.RowSize = _HashValueOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public Version GetVersion(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return new Version(
//             this.Block.PeekUInt16(rowOffset + _MajorVersionOffset),
//             this.Block.PeekUInt16(rowOffset + _MinorVersionOffset),
//             this.Block.PeekUInt16(rowOffset + _BuildNumberOffset),
//             this.Block.PeekUInt16(rowOffset + _RevisionNumberOffset));
//     }

//     public AssemblyFlags GetFlags(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return (AssemblyFlags)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
//     }

//     public BlobHandle GetPublicKeyOrToken(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _PublicKeyOrTokenOffset, _IsBlobHeapRefSizeSmall));
//     }

//     public StringHandle GetName(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public StringHandle GetCulture(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _CultureOffset, _IsStringHeapRefSizeSmall));
//     }

//     public BlobHandle GetHashValue(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _HashValueOffset, _IsBlobHeapRefSizeSmall));
//     }
// }

// export class AssemblyRefProcessorTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsAssemblyRefTableRowSizeSmall;
//     private readonly int _ProcessorOffset;
//     private readonly int _AssemblyRefOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public AssemblyRefProcessorTableReader(
//         int numberOfRows,
//         int assemblyRefTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsAssemblyRefTableRowSizeSmall = assemblyRefTableRowRefSize == 2;
//         _ProcessorOffset = 0;
//         _AssemblyRefOffset = _ProcessorOffset + sizeof(uint);
//         this.RowSize = _AssemblyRefOffset + assemblyRefTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }
// }

// export class AssemblyRefOSTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsAssemblyRefTableRowRefSizeSmall;
//     private readonly int _OSPlatformIdOffset;
//     private readonly int _OSMajorVersionIdOffset;
//     private readonly int _OSMinorVersionIdOffset;
//     private readonly int _AssemblyRefOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public AssemblyRefOSTableReader(
//         int numberOfRows,
//         int assemblyRefTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsAssemblyRefTableRowRefSizeSmall = assemblyRefTableRowRefSize == 2;
//         _OSPlatformIdOffset = 0;
//         _OSMajorVersionIdOffset = _OSPlatformIdOffset + sizeof(uint);
//         _OSMinorVersionIdOffset = _OSMajorVersionIdOffset + sizeof(uint);
//         _AssemblyRefOffset = _OSMinorVersionIdOffset + sizeof(uint);
//         this.RowSize = _AssemblyRefOffset + assemblyRefTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }
// }

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

// export class ExportedTypeTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsImplementationRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _FlagsOffset;
//     private readonly int _TypeDefIdOffset;
//     private readonly int _TypeNameOffset;
//     private readonly int _TypeNamespaceOffset;
//     private readonly int _ImplementationOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ExportedTypeTableReader(
//         int numberOfRows,
//         int implementationRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsImplementationRefSizeSmall = implementationRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _FlagsOffset = 0;
//         _TypeDefIdOffset = _FlagsOffset + sizeof(uint);
//         _TypeNameOffset = _TypeDefIdOffset + sizeof(uint);
//         _TypeNamespaceOffset = _TypeNameOffset + stringHeapRefSize;
//         _ImplementationOffset = _TypeNamespaceOffset + stringHeapRefSize;
//         this.RowSize = _ImplementationOffset + implementationRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public StringHandle GetTypeName(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _TypeNameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public StringHandle GetTypeNamespaceString(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _TypeNamespaceOffset, _IsStringHeapRefSizeSmall));
//     }

//     public NamespaceDefinitionHandle GetTypeNamespace(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return NamespaceDefinitionHandle.FromFullNameOffset(this.Block.PeekHeapReference(rowOffset + _TypeNamespaceOffset, _IsStringHeapRefSizeSmall));
//     }

//     public EntityHandle GetImplementation(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return ImplementationTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ImplementationOffset, _IsImplementationRefSizeSmall));
//     }

//     public TypeAttributes GetFlags(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return (TypeAttributes)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
//     }

//     public int GetTypeDefId(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekInt32(rowOffset + _TypeDefIdOffset);
//     }

//     public int GetNamespace(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return this.Block.PeekReference(rowOffset + _TypeNamespaceOffset, _IsStringHeapRefSizeSmall);
//     }
// }

// export class ManifestResourceTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsImplementationRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _OffsetOffset;
//     private readonly int _FlagsOffset;
//     private readonly int _NameOffset;
//     private readonly int _ImplementationOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public ManifestResourceTableReader(
//         int numberOfRows,
//         int implementationRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsImplementationRefSizeSmall = implementationRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _OffsetOffset = 0;
//         _FlagsOffset = _OffsetOffset + sizeof(uint);
//         _NameOffset = _FlagsOffset + sizeof(uint);
//         _ImplementationOffset = _NameOffset + stringHeapRefSize;
//         this.RowSize = _ImplementationOffset + implementationRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public StringHandle GetName(ManifestResourceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public EntityHandle GetImplementation(ManifestResourceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return ImplementationTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ImplementationOffset, _IsImplementationRefSizeSmall));
//     }

//     public uint GetOffset(ManifestResourceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return this.Block.PeekUInt32(rowOffset + _OffsetOffset);
//     }

//     public ManifestResourceAttributes GetFlags(ManifestResourceHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (ManifestResourceAttributes)this.Block.PeekUInt32(rowOffset + _FlagsOffset);
//     }
// }

// export class NestedClassTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsTypeDefTableRowRefSizeSmall;
//     private readonly int _NestedClassOffset;
//     private readonly int _EnclosingClassOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public NestedClassTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int typeDefTableRowRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset
//     )
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeDefTableRowRefSizeSmall = typeDefTableRowRefSize == 2;
//         _NestedClassOffset = 0;
//         _EnclosingClassOffset = _NestedClassOffset + typeDefTableRowRefSize;
//         this.RowSize = _EnclosingClassOffset + typeDefTableRowRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.NestedClass);
//         }
//     }

//     public TypeDefinitionHandle GetNestedClass(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _NestedClassOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     public TypeDefinitionHandle GetEnclosingClass(int rowId)
//     {
//         int rowOffset = (rowId - 1) * this.RowSize;
//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowOffset + _EnclosingClassOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     public TypeDefinitionHandle FindEnclosingType(TypeDefinitionHandle nestedTypeDef)
//     {
//         int rowNumber =
//           this.Block.BinarySearchReference(
//             this.NumberOfRows,
//             this.RowSize,
//             _NestedClassOffset,
//             (uint)nestedTypeDef.RowId,
//             _IsTypeDefTableRowRefSizeSmall);

//         if (rowNumber == -1)
//         {
//             return default(TypeDefinitionHandle);
//         }

//         return TypeDefinitionHandle.FromRowId(this.Block.PeekReference(rowNumber * this.RowSize + _EnclosingClassOffset, _IsTypeDefTableRowRefSizeSmall));
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _NestedClassOffset, _IsTypeDefTableRowRefSizeSmall);
//     }
// }

// export class GenericParamTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsTypeOrMethodDefRefSizeSmall;
//     private readonly bool _IsStringHeapRefSizeSmall;
//     private readonly int _NumberOffset;
//     private readonly int _FlagsOffset;
//     private readonly int _OwnerOffset;
//     private readonly int _NameOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public GenericParamTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int typeOrMethodDefRefSize,
//         int stringHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsTypeOrMethodDefRefSizeSmall = typeOrMethodDefRefSize == 2;
//         _IsStringHeapRefSizeSmall = stringHeapRefSize == 2;
//         _NumberOffset = 0;
//         _FlagsOffset = _NumberOffset + sizeof(ushort);
//         _OwnerOffset = _FlagsOffset + sizeof(ushort);
//         _NameOffset = _OwnerOffset + typeOrMethodDefRefSize;
//         this.RowSize = _NameOffset + stringHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.GenericParam);
//         }
//     }

//     public ushort GetNumber(GenericParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return this.Block.PeekUInt16(rowOffset + _NumberOffset);
//     }

//     public GenericParameterAttributes GetFlags(GenericParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return (GenericParameterAttributes)this.Block.PeekUInt16(rowOffset + _FlagsOffset);
//     }

//     public StringHandle GetName(GenericParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return StringHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _NameOffset, _IsStringHeapRefSizeSmall));
//     }

//     public EntityHandle GetOwner(GenericParameterHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return TypeOrMethodDefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _OwnerOffset, _IsTypeOrMethodDefRefSizeSmall));
//     }

//     public GenericParameterHandleCollection FindGenericParametersForType(TypeDefinitionHandle typeDef)
//     {
//         ushort count = 0;
//         uint searchCodedTag = TypeOrMethodDefTag.ConvertTypeDefRowIdToTag(typeDef);
//         int startRid = this.BinarySearchTag(searchCodedTag, ref count);

//         return new GenericParameterHandleCollection(startRid, count);
//     }

//     public GenericParameterHandleCollection FindGenericParametersForMethod(MethodDefinitionHandle methodDef)
//     {
//         ushort count = 0;
//         uint searchCodedTag = TypeOrMethodDefTag.ConvertMethodDefToTag(methodDef);
//         int startRid = this.BinarySearchTag(searchCodedTag, ref count);

//         return new GenericParameterHandleCollection(startRid, count);
//     }

//     private int BinarySearchTag(uint searchCodedTag, ref ushort genericParamCount)
//     {
//         int startRowNumber, endRowNumber;
//         this.Block.BinarySearchReferenceRange(
//             this.NumberOfRows,
//             this.RowSize,
//             _OwnerOffset,
//             searchCodedTag,
//             _IsTypeOrMethodDefRefSizeSmall,
//             out startRowNumber,
//             out endRowNumber);

//         if (startRowNumber == -1)
//         {
//             genericParamCount = 0;
//             return 0;
//         }

//         genericParamCount = (ushort)(endRowNumber - startRowNumber + 1);
//         return startRowNumber + 1;
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _OwnerOffset, _IsTypeOrMethodDefRefSizeSmall);
//     }
// }

// export class MethodSpecTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsMethodDefOrRefRefSizeSmall;
//     private readonly bool _IsBlobHeapRefSizeSmall;
//     private readonly int _MethodOffset;
//     private readonly int _InstantiationOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public MethodSpecTableReader(
//         int numberOfRows,
//         int methodDefOrRefRefSize,
//         int blobHeapRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsMethodDefOrRefRefSizeSmall = methodDefOrRefRefSize == 2;
//         _IsBlobHeapRefSizeSmall = blobHeapRefSize == 2;
//         _MethodOffset = 0;
//         _InstantiationOffset = _MethodOffset + methodDefOrRefRefSize;
//         this.RowSize = _InstantiationOffset + blobHeapRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
//     }

//     public EntityHandle GetMethod(MethodSpecificationHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return MethodDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _MethodOffset, _IsMethodDefOrRefRefSizeSmall));
//     }

//     public BlobHandle GetInstantiation(MethodSpecificationHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return BlobHandle.FromOffset(this.Block.PeekHeapReference(rowOffset + _InstantiationOffset, _IsBlobHeapRefSizeSmall));
//     }
// }

// export class GenericParamConstraintTableReader
// {
//     public readonly int NumberOfRows;
//     private readonly bool _IsGenericParamTableRowRefSizeSmall;
//     private readonly bool _IsTypeDefOrRefRefSizeSmall;
//     private readonly int _OwnerOffset;
//     private readonly int _ConstraintOffset;
//     public readonly int RowSize;
//     public readonly MemoryBlock Block;

//     public GenericParamConstraintTableReader(
//         int numberOfRows,
//         bool declaredSorted,
//         int genericParamTableRowRefSize,
//         int typeDefOrRefRefSize,
//         MemoryBlock containingBlock,
//         int containingBlockOffset)
//     {
//         this.NumberOfRows = numberOfRows;
//         _IsGenericParamTableRowRefSizeSmall = genericParamTableRowRefSize == 2;
//         _IsTypeDefOrRefRefSizeSmall = typeDefOrRefRefSize == 2;
//         _OwnerOffset = 0;
//         _ConstraintOffset = _OwnerOffset + genericParamTableRowRefSize;
//         this.RowSize = _ConstraintOffset + typeDefOrRefRefSize;
//         this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

//         if (!declaredSorted && !CheckSorted())
//         {
//             Throw.TableNotSorted(TableIndex.GenericParamConstraint);
//         }
//     }

//     public GenericParameterConstraintHandleCollection FindConstraintsForGenericParam(GenericParameterHandle genericParameter)
//     {
//         int startRowNumber, endRowNumber;
//         this.Block.BinarySearchReferenceRange(
//             this.NumberOfRows,
//             this.RowSize,
//             _OwnerOffset,
//             (uint)genericParameter.RowId,
//             _IsGenericParamTableRowRefSizeSmall,
//             out startRowNumber,
//             out endRowNumber);

//         if (startRowNumber == -1)
//         {
//             return default(GenericParameterConstraintHandleCollection);
//         }

//         return new GenericParameterConstraintHandleCollection(
//             firstRowId: startRowNumber + 1,
//             count: (ushort)(endRowNumber - startRowNumber + 1));
//     }

//     private bool CheckSorted()
//     {
//         return this.Block.IsOrderedByReferenceAscending(this.RowSize, _OwnerOffset, _IsGenericParamTableRowRefSizeSmall);
//     }

//     public EntityHandle GetConstraint(GenericParameterConstraintHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return TypeDefOrRefTag.ConvertToHandle(this.Block.PeekTaggedReference(rowOffset + _ConstraintOffset, _IsTypeDefOrRefRefSizeSmall));
//     }

//     public GenericParameterHandle GetOwner(GenericParameterConstraintHandle handle)
//     {
//         int rowOffset = (handle.RowId - 1) * this.RowSize;
//         return GenericParameterHandle.FromRowId(this.Block.PeekReference(rowOffset + _OwnerOffset, _IsGenericParamTableRowRefSizeSmall));
//     }
// }