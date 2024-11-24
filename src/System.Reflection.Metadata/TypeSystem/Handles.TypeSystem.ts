import assert from "assert";
import {
    StringHandleType,
    HeapHandleType,
    StringKind,
    TokenTypeIds,
    HandleType,
} from "../Internal/MetadataFlags";

import { Handle } from "../Handle";
import { EntityHandle } from "../EntityHandle";
import { MetadataReader } from "System.Reflection.Metadata/MetadataReader";

export class ModuleDefinitionHandle {
    private static readonly tokenType = TokenTypeIds.Module;
    private static readonly tokenTypeSmall = HandleType.Module;
    private readonly _rowId: number;

    public constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    // internal static ModuleDefinitionHandle FromRowId(int rowId)
    // {
    //     return new ModuleDefinitionHandle(rowId);
    // }

    public ToHandle(): Handle {
        return new Handle(ModuleDefinitionHandle.tokenTypeSmall, this._rowId);
    }

    public ToEntityHandle(): EntityHandle {
        return new EntityHandle(ModuleDefinitionHandle.tokenType | this._rowId);
    }

    // public static explicit operator ModuleDefinitionHandle(Handle handle)
    // {
    //     if (handle.VType != tokenTypeSmall)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new ModuleDefinitionHandle(handle.RowId);
    // }

    // public static explicit operator ModuleDefinitionHandle(EntityHandle handle)
    // {
    //     if (handle.VType != tokenType)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new ModuleDefinitionHandle(handle.RowId);
    // }

    // public bool IsNil
    // {
    //     get
    //     {
    //         return RowId == 0;
    //     }
    // }

    // internal int RowId { get { return _rowId; } }

    // public static bool operator ==(ModuleDefinitionHandle left, ModuleDefinitionHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is ModuleDefinitionHandle moduleDefinition && moduleDefinition._rowId == _rowId;
    // }

    // public bool Equals(ModuleDefinitionHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(ModuleDefinitionHandle left, ModuleDefinitionHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

export class AssemblyDefinitionHandle {
    private static readonly tokenType = TokenTypeIds.Assembly;
    private static readonly tokenTypeSmall = HandleType.Assembly;
    private readonly _rowId: number;

    public constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    // internal static AssemblyDefinitionHandle FromRowId(int rowId)
    // {
    //     return new AssemblyDefinitionHandle(rowId);
    // }

    public ToHandle(): Handle {
        return new Handle(AssemblyDefinitionHandle.tokenTypeSmall, this._rowId);
    }

    public ToEntityHandle(): EntityHandle {
        return new EntityHandle(AssemblyDefinitionHandle.tokenType | this._rowId);
    }

    // public static explicit operator AssemblyDefinitionHandle(Handle handle)
    // {
    //     if (handle.VType != tokenTypeSmall)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new AssemblyDefinitionHandle(handle.RowId);
    // }

    // public static explicit operator AssemblyDefinitionHandle(EntityHandle handle)
    // {
    //     if (handle.VType != tokenType)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new AssemblyDefinitionHandle(handle.RowId);
    // }

    // public bool IsNil
    // {
    //     get
    //     {
    //         return RowId == 0;
    //     }
    // }

    // internal int RowId { get { return _rowId; } }

    // public static bool operator ==(AssemblyDefinitionHandle left, AssemblyDefinitionHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is AssemblyDefinitionHandle && ((AssemblyDefinitionHandle)obj)._rowId == _rowId;
    // }

    // public bool Equals(AssemblyDefinitionHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(AssemblyDefinitionHandle left, AssemblyDefinitionHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

export class MethodDefinitionHandle {
    private static readonly tokenType = TokenTypeIds.MethodDef;
    private static readonly tokenTypeSmall = HandleType.MethodDef;
    private readonly _rowId: number;

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId(rowId: number): MethodDefinitionHandle {
        return new MethodDefinitionHandle(rowId);
    }

    public get Handle(): Handle {
        return new Handle(MethodDefinitionHandle.tokenTypeSmall, this._rowId);
    }

    public get EntityHandle(): EntityHandle {
        return new EntityHandle(MethodDefinitionHandle.tokenType | this._rowId);
    }

    public static FromHandle(handle: Handle) {
        if (handle.VType != MethodDefinitionHandle.tokenTypeSmall) {
            throw new Error("Invalid cast");
        }

        return new MethodDefinitionHandle(handle.RowId);
    }

    public static FromEntityHandle(handle: EntityHandle) {
        if (handle.VType != MethodDefinitionHandle.tokenType) {
            throw new Error("Invalid cast");
        }

        return new MethodDefinitionHandle(handle.RowId);
    }

    public get IsNil(): boolean {
        return this.RowId == 0;

    }

    public get RowId(): number {
        return this._rowId;
    }

    // public static bool operator ==(MethodDefinitionHandle left, MethodDefinitionHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is MethodDefinitionHandle && ((MethodDefinitionHandle)obj)._rowId == _rowId;
    // }

    // public bool Equals(MethodDefinitionHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override number GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(MethodDefinitionHandle left, MethodDefinitionHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }

    // /// <summary>
    // /// Returns a handle to <see cref="MethodDebugInformation"/> corresponding to this handle.
    // /// </summary>
    // /// <remarks>
    // /// The resulting handle is only valid within the context of a <see cref="MetadataReader"/> open on the Portable PDB blob,
    // /// which in case of standalone PDB file is a different reader than the one containing this method definition.
    // /// </remarks>
    // public MethodDebugInformationHandle ToDebugInformationHandle()
    // {
    //     return MethodDebugInformationHandle.FromRowId(_rowId);
    // }
}

export class BlobHandle {
    // bits:
    //     31: IsVirtual
    // 29..30: 0
    //  0..28: Heap offset or Virtual Value (16 bits) + Virtual Index (8 bits)
    private readonly _value: number;


    private constructor(value: number) {
        this._value = value;
    }

    public static FromOffset(heapOffset: number): BlobHandle {
        return new BlobHandle(heapOffset);
    }

    public GetBlobBytes(reader: MetadataReader): Uint8Array {
        return reader.BlobHeap.GetBytes(this);
    }

    //         public static BlobHandle FromVirtualIndex(VirtualIndex virtualIndex, ushort virtualValue) {
    //         assert(virtualIndex < VirtualIndex.Count);
    //         return new BlobHandle(TokenTypeIds.VirtualBit | (uint)(virtualValue << 8) | (uint)virtualIndex);
    //     }

    public static readonly TemplateParameterOffset_AttributeUsageTarget = 2;

    public SubstituteTemplateParameters(blob: Uint8Array) {
        assert(blob.length >= BlobHandle.TemplateParameterOffset_AttributeUsageTarget + 4);
        // VirtualValue is short type 
        blob[BlobHandle.TemplateParameterOffset_AttributeUsageTarget] = (this.VirtualValue & 0xff);
        blob[BlobHandle.TemplateParameterOffset_AttributeUsageTarget + 1] = (this.VirtualValue >> 8);
        blob[BlobHandle.TemplateParameterOffset_AttributeUsageTarget + 2] = 0;
        blob[BlobHandle.TemplateParameterOffset_AttributeUsageTarget + 3] = 0;



        // fixed(byte * ptr = & blob[BlobHandle.TemplateParameterOffset_AttributeUsageTarget])
        // {
        //             * ((uint *)ptr) = VirtualValue;
        // }
    }

    //         public static implicit operator Handle(BlobHandle handle)
    // {
    //     // V... -> V111 0001
    //     return new Handle(
    //         (byte)((handle._value & HeapHandleType.VirtualBit) >> 24 | HandleType.Blob),
    //         (number)(handle._value & HeapHandleType.OffsetMask));
    // }

    //         public static explicit operator BlobHandle(Handle handle)
    // {
    //     if ((handle.VType & HandleType.TypeMask) != HandleType.Blob) {
    //         throw new Error("Invalid cast");
    //     }

    //     return new BlobHandle(
    //         (handle.VType & HandleType.VirtualBit) << TokenTypeIds.RowIdBitCount |
    //         (uint)handle.Offset);
    // }

    public get RawValue(): number {
        return this._value;
    }

    public get IsNil(): boolean {
        return this._value == 0;
    }

    public GetHeapOffset(): number {
        assert(!this.IsVirtual);
        return this._value;
    }

    public GetVirtualIndex(): BlobHandle.VirtualIndex {
        assert(this.IsVirtual);
        return (this._value & 0xff);
    }

    public get IsVirtual(): boolean {
        return (this._value & TokenTypeIds.VirtualBit) != 0;
    }

    private get VirtualValue(): number // short
    {
        return this._value >> 8;
    }

    //         public override bool Equals([NotNullWhen(true)] object ? obj)
    // {
    //     return obj is BlobHandle bh && Equals(bh);
    // }

    //         public bool Equals(BlobHandle other)
    // {
    //     return _value == other._value;
    // }

    //         public override number GetHashCode()
    // {
    //     return unchecked((number)_value);
    // }

    //         public static bool operator == (BlobHandle left, BlobHandle right)
    // {
    //     return left.Equals(right);
    // }

    //         public static bool operator != (BlobHandle left, BlobHandle right)
    // {
    //     return !left.Equals(right);
    // }
}

export namespace BlobHandle {
    export enum VirtualIndex {
        Nil,
        // B0 3F 5F 7F 11 D5 0A 3A
        ContractPublicKeyToken,

        // 00, 24, 00, 00, 04, ...
        ContractPublicKey,

        // Template for projected AttributeUsage attribute blob
        AttributeUsage_AllowSingle,

        // Template for projected AttributeUsage attribute blob with AllowMultiple=true
        AttributeUsage_AllowMultiple,

        Count
    }
}

export enum StringVirtualIndex {
    System_Runtime_WindowsRuntime,
    System_Runtime,
    System_ObjectModel,
    System_Runtime_WindowsRuntime_UI_Xaml,
    System_Runtime_InteropServices_WindowsRuntime,
    System_Numerics_Vectors,

    Dispose,

    AttributeTargets,
    AttributeUsageAttribute,
    Color,
    CornerRadius,
    DateTimeOffset,
    Duration,
    DurationType,
    EventHandler1,
    EventRegistrationToken,
    Exception,
    GeneratorPosition,
    GridLength,
    GridUnitType,
    ICommand,
    IDictionary2,
    IDisposable,
    IEnumerable,
    IEnumerable1,
    IList,
    IList1,
    INotifyCollectionChanged,
    INotifyPropertyChanged,
    IReadOnlyDictionary2,
    IReadOnlyList1,
    KeyTime,
    KeyValuePair2,
    Matrix,
    Matrix3D,
    Matrix3x2,
    Matrix4x4,
    NotifyCollectionChangedAction,
    NotifyCollectionChangedEventArgs,
    NotifyCollectionChangedEventHandler,
    Nullable1,
    Plane,
    Point,
    PropertyChangedEventArgs,
    PropertyChangedEventHandler,
    Quaternion,
    Rect,
    RepeatBehavior,
    RepeatBehaviorType,
    Size,
    System,
    System_Collections,
    System_Collections_Generic,
    System_Collections_Specialized,
    System_ComponentModel,
    System_Numerics,
    System_Windows_Input,
    Thickness,
    TimeSpan,
    Type,
    Uri,
    Vector2,
    Vector3,
    Vector4,
    Windows_Foundation,
    Windows_UI,
    Windows_UI_Xaml,
    Windows_UI_Xaml_Controls_Primitives,
    Windows_UI_Xaml_Media,
    Windows_UI_Xaml_Media_Animation,
    Windows_UI_Xaml_Media_Media3D,

    Count
}


export class GuidHandle {
    // The Guid heap is an array of GUIDs, each 16 bytes wide.
    // Its first element is numbered 1, its second 2, and so on.
    private readonly _index: number

    private constructor(index: number) {
        this._index = index;
    }

    public static FromIndex(heapIndex: number): GuidHandle {
        return new GuidHandle(heapIndex);
    }

    // public static implicit operator Handle(GuidHandle handle)
    // {
    //     return new Handle((byte)HandleType.Guid, handle._index);
    // }

    // public static explicit operator GuidHandle(Handle handle)
    // {
    //     if (handle.VType != HandleType.Guid)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new GuidHandle(handle.Offset);
    // }

    public get IsNil(): boolean {
        return this._index == 0;
    }

    public get Index(): number {
        return this._index;
    }

    // public override bool Equals([NotNullWhen(true)] object? obj)
    // {
    //     return obj is GuidHandle gh && Equals(gh);
    // }

    // public bool Equals(GuidHandle other)
    // {
    //     return _index == other._index;
    // }

    // public override number GetHashCode()
    // {
    //     return _index;
    // }

    // public static bool operator ==(GuidHandle left, GuidHandle right)
    // {
    //     return left.Equals(right);
    // }

    // public static bool operator !=(GuidHandle left, GuidHandle right)
    // {
    //     return !left.Equals(right);
    // }
}

export class UserStringHandle {
    // bits:
    //     31: 0
    // 24..30: 0
    //  0..23: index
    private readonly _offset: number;

    private constructor(offset: number) {
        // #US string indices must fit into 24bits since they are used in IL stream tokens
        assert((offset & 0xFF000000) == 0);
        this._offset = offset;
    }

    public static FromOffset(heapOffset: number): UserStringHandle {
        return new UserStringHandle(heapOffset);
    }

    // public static implicit operator Handle(UserStringHandle handle)
    // {
    //     return new Handle((byte)HandleType.UserString, handle._offset);
    // }

    // public static explicit operator UserStringHandle(Handle handle)
    // {
    //     if (handle.VType != HandleType.UserString)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new UserStringHandle(handle.Offset);
    // }

    public get IsNil(): boolean {
        return this._offset == 0;
    }

    public GetHeapOffset(): number {
        return this._offset;
    }

    // public static bool operator ==(UserStringHandle left, UserStringHandle right)
    // {
    //     return left._offset == right._offset;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is UserStringHandle && ((UserStringHandle)obj)._offset == _offset;
    // }

    // public bool Equals(UserStringHandle other)
    // {
    //     return _offset == other._offset;
    // }

    // public override int GetHashCode()
    // {
    //     return _offset.GetHashCode();
    // }

    // public static bool operator !=(UserStringHandle left, UserStringHandle right)
    // {
    //     return left._offset != right._offset;
    // }
}

export class TypeDefinitionHandle {
    private static readonly tokenType = TokenTypeIds.TypeDef;
    private static readonly tokenTypeSmall = HandleType.TypeDef;
    private readonly _rowId: number;

    public static Default: TypeDefinitionHandle = new TypeDefinitionHandle(0);

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId(rowId: number): TypeDefinitionHandle {
        return new TypeDefinitionHandle(rowId);
    }

    public ToHandle(): Handle {
        return new Handle(TypeDefinitionHandle.tokenTypeSmall, this._rowId);
    }

    public ToEntityHandle(): EntityHandle {
        return new EntityHandle(TypeDefinitionHandle.tokenType | this._rowId);
    }

    public static FromHandle(handle: Handle): TypeDefinitionHandle {

        if (handle.VType != TypeDefinitionHandle.tokenTypeSmall) {
            throw new Error("Invalid cast");
        }

        return new TypeDefinitionHandle(handle.RowId);
    }

    public static FromEntityHandle(handle: EntityHandle): TypeDefinitionHandle {
        if (handle.VType != TypeDefinitionHandle.tokenType) {
            throw new Error("Invalid cast");
        }

        return new TypeDefinitionHandle(handle.RowId);
    }

    public get IsNil(): boolean {
        return this.RowId == 0;
    }

    public get RowId(): number { return this._rowId; }

    // public static bool operator ==(TypeDefinitionHandle left, TypeDefinitionHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is TypeDefinitionHandle && ((TypeDefinitionHandle)obj)._rowId == _rowId;
    // }

    // public bool Equals(TypeDefinitionHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(TypeDefinitionHandle left, TypeDefinitionHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

export class ExportedTypeHandle {
    private static readonly tokenType = TokenTypeIds.ExportedType;
    private static readonly tokenTypeSmall = HandleType.ExportedType;
    private readonly _rowId: number;

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId(rowId: number): ExportedTypeHandle {
        return new ExportedTypeHandle(rowId);
    }

    // public static implicit operator Handle(ExportedTypeHandle handle)
    // {
    //     return new Handle(tokenTypeSmall, handle._rowId);
    // }

    // public static implicit operator EntityHandle(ExportedTypeHandle handle)
    // {
    //     return new EntityHandle((uint)(tokenType | handle._rowId));
    // }

    // public static explicit operator ExportedTypeHandle(Handle handle)
    // {
    //     if (handle.VType != tokenTypeSmall)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new ExportedTypeHandle(handle.RowId);
    // }

    // public static explicit operator ExportedTypeHandle(EntityHandle handle)
    // {
    //     if (handle.VType != tokenType)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new ExportedTypeHandle(handle.RowId);
    // }

    public get IsNil(): boolean {

        return this.RowId == 0;

    }

    public get RowId(): number { return this._rowId; }

    // public static bool operator ==(ExportedTypeHandle left, ExportedTypeHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is ExportedTypeHandle && ((ExportedTypeHandle)obj)._rowId == _rowId;
    // }

    // public bool Equals(ExportedTypeHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(ExportedTypeHandle left, ExportedTypeHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

export class TypeReferenceHandle {
    private static readonly tokenType = TokenTypeIds.TypeRef;
    private static readonly tokenTypeSmall = HandleType.TypeRef;
    private readonly _rowId: number

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId(rowId: number): TypeReferenceHandle {
        return new TypeReferenceHandle(rowId);
    }

    // public static implicit operator Handle(TypeReferenceHandle handle)
    // {
    //     return new Handle(tokenTypeSmall, handle._rowId);
    // }

    // public static implicit operator EntityHandle(TypeReferenceHandle handle)
    // {
    //     return new EntityHandle((uint)(tokenType | handle._rowId));
    // }

    // public static explicit operator TypeReferenceHandle(Handle handle)
    // {
    //     if (handle.VType != tokenTypeSmall)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     return new TypeReferenceHandle(handle.RowId);
    // }

    public static FromEntityHandle(handle: EntityHandle): TypeReferenceHandle {
        if (handle.VType != TypeReferenceHandle.tokenType) {
            throw new Error("Invalid cast");
        }

        return new TypeReferenceHandle(handle.RowId);
    }

    public get IsNil(): boolean {

        return this.RowId == 0;
    }

    public get RowId(): number { return this._rowId; }

    // public static bool operator ==(TypeReferenceHandle left, TypeReferenceHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is TypeReferenceHandle && ((TypeReferenceHandle)obj)._rowId == _rowId;
    // }

    // public bool Equals(TypeReferenceHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(TypeReferenceHandle left, TypeReferenceHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

//     export class TypeSpecificationHandle : IEquatable<TypeSpecificationHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.TypeSpec;
//         private static readonly tokenTypeSmall = (byte)HandleType.TypeSpec;
//         private readonly int _rowId;

//         private TypeSpecificationHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static TypeSpecificationHandle FromRowId(int rowId)
//         {
//             return new TypeSpecificationHandle(rowId);
//         }

//         public static implicit operator Handle(TypeSpecificationHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(TypeSpecificationHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator TypeSpecificationHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new TypeSpecificationHandle(handle.RowId);
//         }

//         public static explicit operator TypeSpecificationHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new TypeSpecificationHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(TypeSpecificationHandle left, TypeSpecificationHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is TypeSpecificationHandle && ((TypeSpecificationHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(TypeSpecificationHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(TypeSpecificationHandle left, TypeSpecificationHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

export class MemberReferenceHandle {
    private static readonly tokenType = TokenTypeIds.MemberRef;
    private static readonly tokenTypeSmall = HandleType.MemberRef;
    private readonly _rowId: number;

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId(rowId: number): MemberReferenceHandle {
        return new MemberReferenceHandle(rowId);
    }

    public ToHandle(): Handle {
        return new Handle(MemberReferenceHandle.tokenTypeSmall, this._rowId);
    }

    public ToEntityHandle(): EntityHandle {
        return new EntityHandle(MemberReferenceHandle.tokenType | this._rowId);
    }

    public static FromHandle(handle: Handle): MemberReferenceHandle {
        if (handle.VType != MemberReferenceHandle.tokenTypeSmall) {
            throw new Error("Invalid cast");
        }

        return new MemberReferenceHandle(handle.RowId);
    }

    public static FromEntityHandle(handle: EntityHandle): MemberReferenceHandle {
        if (handle.VType != MemberReferenceHandle.tokenType) {
            throw new Error("Invalid cast");
        }

        return new MemberReferenceHandle(handle.RowId);
    }

    public get IsNil(): boolean {
        return this.RowId == 0;
    }

    public get RowId(): number { return this._rowId; }

    // public static bool operator ==(MemberReferenceHandle left, MemberReferenceHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    // public override bool Equals(object? obj)
    // {
    //     return obj is MemberReferenceHandle && ((MemberReferenceHandle)obj)._rowId == _rowId;
    // }

    // public bool Equals(MemberReferenceHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    // public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    // public static bool operator !=(MemberReferenceHandle left, MemberReferenceHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

//     export class FieldDefinitionHandle : IEquatable<FieldDefinitionHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.FieldDef;
//         private static readonly tokenTypeSmall = (byte)HandleType.FieldDef;
//         private readonly int _rowId;

//         private FieldDefinitionHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static FieldDefinitionHandle FromRowId(int rowId)
//         {
//             return new FieldDefinitionHandle(rowId);
//         }

//         public static implicit operator Handle(FieldDefinitionHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(FieldDefinitionHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator FieldDefinitionHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new FieldDefinitionHandle(handle.RowId);
//         }

//         public static explicit operator FieldDefinitionHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new FieldDefinitionHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(FieldDefinitionHandle left, FieldDefinitionHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is FieldDefinitionHandle && ((FieldDefinitionHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(FieldDefinitionHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(FieldDefinitionHandle left, FieldDefinitionHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class EventDefinitionHandle : IEquatable<EventDefinitionHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.Event;
//         private static readonly tokenTypeSmall = (byte)HandleType.Event;
//         private readonly int _rowId;

//         private EventDefinitionHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static EventDefinitionHandle FromRowId(int rowId)
//         {
//             return new EventDefinitionHandle(rowId);
//         }

//         public static implicit operator Handle(EventDefinitionHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(EventDefinitionHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator EventDefinitionHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new EventDefinitionHandle(handle.RowId);
//         }

//         public static explicit operator EventDefinitionHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new EventDefinitionHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(EventDefinitionHandle left, EventDefinitionHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is EventDefinitionHandle && ((EventDefinitionHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(EventDefinitionHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(EventDefinitionHandle left, EventDefinitionHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class PropertyDefinitionHandle : IEquatable<PropertyDefinitionHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.Property;
//         private static readonly tokenTypeSmall = (byte)HandleType.Property;
//         private readonly int _rowId;

//         private PropertyDefinitionHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static PropertyDefinitionHandle FromRowId(int rowId)
//         {
//             return new PropertyDefinitionHandle(rowId);
//         }

//         public static implicit operator Handle(PropertyDefinitionHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(PropertyDefinitionHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator PropertyDefinitionHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new PropertyDefinitionHandle(handle.RowId);
//         }

//         public static explicit operator PropertyDefinitionHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new PropertyDefinitionHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(PropertyDefinitionHandle left, PropertyDefinitionHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is PropertyDefinitionHandle && ((PropertyDefinitionHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(PropertyDefinitionHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(PropertyDefinitionHandle left, PropertyDefinitionHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class StandaloneSignatureHandle : IEquatable<StandaloneSignatureHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.Signature;
//         private static readonly tokenTypeSmall = (byte)HandleType.Signature;
//         private readonly int _rowId;

//         private StandaloneSignatureHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static StandaloneSignatureHandle FromRowId(int rowId)
//         {
//             return new StandaloneSignatureHandle(rowId);
//         }

//         public static implicit operator Handle(StandaloneSignatureHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(StandaloneSignatureHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator StandaloneSignatureHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new StandaloneSignatureHandle(handle.RowId);
//         }

//         public static explicit operator StandaloneSignatureHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new StandaloneSignatureHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(StandaloneSignatureHandle left, StandaloneSignatureHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is StandaloneSignatureHandle && ((StandaloneSignatureHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(StandaloneSignatureHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(StandaloneSignatureHandle left, StandaloneSignatureHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class ParameterHandle : IEquatable<ParameterHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.ParamDef;
//         private static readonly tokenTypeSmall = (byte)HandleType.ParamDef;
//         private readonly int _rowId;

//         private ParameterHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static ParameterHandle FromRowId(int rowId)
//         {
//             return new ParameterHandle(rowId);
//         }

//         public static implicit operator Handle(ParameterHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(ParameterHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator ParameterHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ParameterHandle(handle.RowId);
//         }

//         public static explicit operator ParameterHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ParameterHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(ParameterHandle left, ParameterHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is ParameterHandle && ((ParameterHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(ParameterHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(ParameterHandle left, ParameterHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class GenericParameterHandle : IEquatable<GenericParameterHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.GenericParam;
//         private static readonly tokenTypeSmall = (byte)HandleType.GenericParam;
//         private readonly int _rowId;

//         private GenericParameterHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static GenericParameterHandle FromRowId(int rowId)
//         {
//             return new GenericParameterHandle(rowId);
//         }

//         public static implicit operator Handle(GenericParameterHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(GenericParameterHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator GenericParameterHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new GenericParameterHandle(handle.RowId);
//         }

//         public static explicit operator GenericParameterHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new GenericParameterHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(GenericParameterHandle left, GenericParameterHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is GenericParameterHandle && ((GenericParameterHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(GenericParameterHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(GenericParameterHandle left, GenericParameterHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class GenericParameterConstraintHandle : IEquatable<GenericParameterConstraintHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.GenericParamConstraint;
//         private static readonly tokenTypeSmall = (byte)HandleType.GenericParamConstraint;
//         private readonly int _rowId;

//         private GenericParameterConstraintHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static GenericParameterConstraintHandle FromRowId(int rowId)
//         {
//             return new GenericParameterConstraintHandle(rowId);
//         }

//         public static implicit operator Handle(GenericParameterConstraintHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(GenericParameterConstraintHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator GenericParameterConstraintHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new GenericParameterConstraintHandle(handle.RowId);
//         }

//         public static explicit operator GenericParameterConstraintHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new GenericParameterConstraintHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(GenericParameterConstraintHandle left, GenericParameterConstraintHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is GenericParameterConstraintHandle && ((GenericParameterConstraintHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(GenericParameterConstraintHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(GenericParameterConstraintHandle left, GenericParameterConstraintHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class ModuleReferenceHandle : IEquatable<ModuleReferenceHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.ModuleRef;
//         private static readonly tokenTypeSmall = (byte)HandleType.ModuleRef;
//         private readonly int _rowId;

//         private ModuleReferenceHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static ModuleReferenceHandle FromRowId(int rowId)
//         {
//             return new ModuleReferenceHandle(rowId);
//         }

//         public static implicit operator Handle(ModuleReferenceHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(ModuleReferenceHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator ModuleReferenceHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ModuleReferenceHandle(handle.RowId);
//         }

//         public static explicit operator ModuleReferenceHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ModuleReferenceHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(ModuleReferenceHandle left, ModuleReferenceHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is ModuleReferenceHandle && ((ModuleReferenceHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(ModuleReferenceHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(ModuleReferenceHandle left, ModuleReferenceHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

export class AssemblyReferenceHandle {
    private static readonly tokenType = TokenTypeIds.AssemblyRef;
    private static readonly tokenTypeSmall = HandleType.AssemblyRef;

    // bits:
    //     31: IsVirtual
    // 24..30: 0
    //  0..23: Heap offset or Virtual index
    private readonly _value: number;


    private constructor(value: number) {
        this._value = value;
    }

    //     public static AssemblyReferenceHandle FromRowId(int rowId) {
    //         assert(TokenTypeIds.IsValidRowId(rowId));
    //         return new AssemblyReferenceHandle((uint)rowId);
    //     }

    //     public static AssemblyReferenceHandle FromVirtualIndex(VirtualIndex virtualIndex) {
    //         assert(virtualIndex < VirtualIndex.Count);
    //         return new AssemblyReferenceHandle(TokenTypeIds.VirtualBit | (uint)virtualIndex);
    //     }

    //     public static implicit operator Handle(AssemblyReferenceHandle handle) {
    //         return Handle.FromVToken(handle.VToken);
    //     }

    //     public static implicit operator EntityHandle(AssemblyReferenceHandle handle) {
    //         return new EntityHandle(handle.VToken);
    //     }

    //     public static explicit operator AssemblyReferenceHandle(Handle handle) {
    //         if (handle.Type != tokenTypeSmall) {
    //             throw new Error("Invalid cast");
    //         }

    //         return new AssemblyReferenceHandle(handle.SpecificEntityHandleValue);
    //     }

    //     public static explicit operator AssemblyReferenceHandle(EntityHandle handle) {
    //         if (handle.Type != tokenType) {
    //             throw new Error("Invalid cast");
    //         }

    //         return new AssemblyReferenceHandle(handle.SpecificHandleValue);
    //     }

    //     public uint Value
    //         {
    //             get { return _value; }
    // }

    //         private uint VToken
    // {
    //             get { return _value | tokenType; }
    // }

    //         public bool IsNil
    // {
    //             get { return _value == 0; }
    // }

    //         public bool IsVirtual
    // {
    //             get { return (_value & TokenTypeIds.VirtualBit) != 0; }
    // }

    //         public int RowId { get { return (_value & TokenTypeIds.RIDMask); } }

    //         public static bool operator == (AssemblyReferenceHandle left, AssemblyReferenceHandle right)
    // {
    //     return left._value == right._value;
    // }

    //         public override bool Equals(object ? obj)
    // {
    //     return obj is AssemblyReferenceHandle && ((AssemblyReferenceHandle)obj)._value == _value;
    // }

    //         public bool Equals(AssemblyReferenceHandle other)
    // {
    //     return _value == other._value;
    // }

    //         public override int GetHashCode()
    // {
    //     return _value.GetHashCode();
    // }

    //         public static bool operator != (AssemblyReferenceHandle left, AssemblyReferenceHandle right)
    // {
    //     return left._value != right._value;
    // }
}
export namespace AssemblyReferenceHandle {
    export enum VirtualIndex {
        System_Runtime,
        System_Runtime_InteropServices_WindowsRuntime,
        System_ObjectModel,
        System_Runtime_WindowsRuntime,
        System_Runtime_WindowsRuntime_UI_Xaml,
        System_Numerics_Vectors,

        Count
    }
}


export class CustomAttributeHandle {
    private static readonly tokenType = TokenTypeIds.CustomAttribute;
    private static readonly tokenTypeSmall = HandleType.CustomAttribute;
    private readonly _rowId: number;

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId(rowId: number): CustomAttributeHandle {
        return new CustomAttributeHandle(rowId);
    }

    // public static implicit operator Handle(CustomAttributeHandle handle) {
    //     return new Handle(tokenTypeSmall, handle._rowId);
    // }

    // public static implicit operator EntityHandle(CustomAttributeHandle handle) {
    //     return new EntityHandle((uint)(tokenType | handle._rowId));
    // }

    // public static explicit operator CustomAttributeHandle(Handle handle) {
    //     if (handle.VType != tokenTypeSmall) {
    //         throw new Error("Invalid cast");
    //     }

    //     return new CustomAttributeHandle(handle.RowId);
    // }

    // public static explicit operator CustomAttributeHandle(EntityHandle handle) {
    //     if (handle.VType != tokenType) {
    //         throw new Error("Invalid cast");
    //     }

    //     return new CustomAttributeHandle(handle.RowId);
    // }

    public get IsNil(): boolean {

        return this._rowId == 0;
    }

    public get RowId(): number { return this._rowId; }

    //         public static bool operator == (CustomAttributeHandle left, CustomAttributeHandle right)
    // {
    //     return left._rowId == right._rowId;
    // }

    //         public override bool Equals(object ? obj)
    // {
    //     return obj is CustomAttributeHandle && ((CustomAttributeHandle)obj)._rowId == _rowId;
    // }

    //         public bool Equals(CustomAttributeHandle other)
    // {
    //     return _rowId == other._rowId;
    // }

    //         public override int GetHashCode()
    // {
    //     return _rowId.GetHashCode();
    // }

    //         public static bool operator != (CustomAttributeHandle left, CustomAttributeHandle right)
    // {
    //     return left._rowId != right._rowId;
    // }
}

//     export class DeclarativeSecurityAttributeHandle : IEquatable<DeclarativeSecurityAttributeHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.DeclSecurity;
//         private static readonly tokenTypeSmall = (byte)HandleType.DeclSecurity;
//         private readonly int _rowId;

//         private DeclarativeSecurityAttributeHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static DeclarativeSecurityAttributeHandle FromRowId(int rowId)
//         {
//             return new DeclarativeSecurityAttributeHandle(rowId);
//         }

//         public static implicit operator Handle(DeclarativeSecurityAttributeHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(DeclarativeSecurityAttributeHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator DeclarativeSecurityAttributeHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new DeclarativeSecurityAttributeHandle(handle.RowId);
//         }

//         public static explicit operator DeclarativeSecurityAttributeHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new DeclarativeSecurityAttributeHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return _rowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(DeclarativeSecurityAttributeHandle left, DeclarativeSecurityAttributeHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is DeclarativeSecurityAttributeHandle && ((DeclarativeSecurityAttributeHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(DeclarativeSecurityAttributeHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(DeclarativeSecurityAttributeHandle left, DeclarativeSecurityAttributeHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class ConstantHandle : IEquatable<ConstantHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.Constant;
//         private static readonly tokenTypeSmall = (byte)HandleType.Constant;
//         private readonly int _rowId;

//         private ConstantHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static ConstantHandle FromRowId(int rowId)
//         {
//             return new ConstantHandle(rowId);
//         }

//         public static implicit operator Handle(ConstantHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(ConstantHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator ConstantHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ConstantHandle(handle.RowId);
//         }

//         public static explicit operator ConstantHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ConstantHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(ConstantHandle left, ConstantHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is ConstantHandle && ((ConstantHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(ConstantHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(ConstantHandle left, ConstantHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class ManifestResourceHandle : IEquatable<ManifestResourceHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.ManifestResource;
//         private static readonly tokenTypeSmall = (byte)HandleType.ManifestResource;
//         private readonly int _rowId;

//         private ManifestResourceHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static ManifestResourceHandle FromRowId(int rowId)
//         {
//             return new ManifestResourceHandle(rowId);
//         }

//         public static implicit operator Handle(ManifestResourceHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(ManifestResourceHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator ManifestResourceHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ManifestResourceHandle(handle.RowId);
//         }

//         public static explicit operator ManifestResourceHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new ManifestResourceHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(ManifestResourceHandle left, ManifestResourceHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is ManifestResourceHandle && ((ManifestResourceHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(ManifestResourceHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(ManifestResourceHandle left, ManifestResourceHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     export class AssemblyFileHandle : IEquatable<AssemblyFileHandle>
//     {
//         private static readonly tokenType = TokenTypeIds.File;
//         private static readonly tokenTypeSmall = (byte)HandleType.File;
//         private readonly int _rowId;

//         private AssemblyFileHandle(int rowId)
//         {
//             assert(TokenTypeIds.IsValidRowId(rowId));
//             _rowId = rowId;
//         }

//         public static AssemblyFileHandle FromRowId(int rowId)
//         {
//             return new AssemblyFileHandle(rowId);
//         }

//         public static implicit operator Handle(AssemblyFileHandle handle)
//         {
//             return new Handle(tokenTypeSmall, handle._rowId);
//         }

//         public static implicit operator EntityHandle(AssemblyFileHandle handle)
//         {
//             return new EntityHandle((uint)(tokenType | handle._rowId));
//         }

//         public static explicit operator AssemblyFileHandle(Handle handle)
//         {
//             if (handle.VType != tokenTypeSmall)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new AssemblyFileHandle(handle.RowId);
//         }

//         public static explicit operator AssemblyFileHandle(EntityHandle handle)
//         {
//             if (handle.VType != tokenType)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new AssemblyFileHandle(handle.RowId);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return RowId == 0;
//             }
//         }

//         public int RowId { get { return _rowId; } }

//         public static bool operator ==(AssemblyFileHandle left, AssemblyFileHandle right)
//         {
//             return left._rowId == right._rowId;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is AssemblyFileHandle && ((AssemblyFileHandle)obj)._rowId == _rowId;
//         }

//         public bool Equals(AssemblyFileHandle other)
//         {
//             return _rowId == other._rowId;
//         }

//         public override int GetHashCode()
//         {
//             return _rowId.GetHashCode();
//         }

//         public static bool operator !=(AssemblyFileHandle left, AssemblyFileHandle right)
//         {
//             return left._rowId != right._rowId;
//         }
//     }

//     /// <summary>
//     /// #UserString heap handle.
//     /// </summary>
//     /// <remarks>
//     /// The handle is 32-bit wide.
//     /// </remarks>
//     export class UserStringHandle : IEquatable<UserStringHandle>
//     {
//         // bits:
//         //     31: 0
//         // 24..30: 0
//         //  0..23: index
//         private readonly int _offset;

//         private UserStringHandle(int offset)
//         {
//             // #US string indices must fit into 24bits since they are used in IL stream tokens
//             assert((offset & 0xFF000000) == 0);
//             _offset = offset;
//         }

//         public static UserStringHandle FromOffset(int heapOffset)
//         {
//             return new UserStringHandle(heapOffset);
//         }

//         public static implicit operator Handle(UserStringHandle handle)
//         {
//             return new Handle((byte)HandleType.UserString, handle._offset);
//         }

//         public static explicit operator UserStringHandle(Handle handle)
//         {
//             if (handle.VType != HandleType.UserString)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new UserStringHandle(handle.Offset);
//         }

//         public bool IsNil
//         {
//             get { return _offset == 0; }
//         }

//         public int GetHeapOffset()
//         {
//             return _offset;
//         }

//         public static bool operator ==(UserStringHandle left, UserStringHandle right)
//         {
//             return left._offset == right._offset;
//         }

//         public override bool Equals(object? obj)
//         {
//             return obj is UserStringHandle && ((UserStringHandle)obj)._offset == _offset;
//         }

//         public bool Equals(UserStringHandle other)
//         {
//             return _offset == other._offset;
//         }

//         public override int GetHashCode()
//         {
//             return _offset.GetHashCode();
//         }

//         public static bool operator !=(UserStringHandle left, UserStringHandle right)
//         {
//             return left._offset != right._offset;
//         }
//     }

// #String heap handle
export class StringHandle {
    // bits:
    //     31: IsVirtual
    // 29..31: type (non-virtual: String, DotTerminatedString; virtual: VirtualString, WinRTPrefixedString)
    //  0..28: Heap offset or Virtual index
    private readonly _value: number;



    private constructor(value: number) {
        assert((value & StringHandleType.TypeMask) == StringHandleType.String ||
            (value & StringHandleType.TypeMask) == StringHandleType.VirtualString ||
            (value & StringHandleType.TypeMask) == StringHandleType.WinRTPrefixedString ||
            (value & StringHandleType.TypeMask) == StringHandleType.DotTerminatedString);

        this._value = value;
    }

    public static FromOffset(heapOffset: number): StringHandle {
        return new StringHandle(StringHandleType.String | heapOffset);
    }

    GetString(reader: MetadataReader): string {
        return reader.StringHeap.GetString(this, reader.UTF8Decoder);
    }

    GetStringOrNull(reader: MetadataReader): string | undefined {
        if (this.IsNil) {
            return undefined;
        }
        return reader.StringHeap.GetString(this, reader.UTF8Decoder);
    }

    public static FromVirtualIndex(virtualIndex: StringHandle.VirtualIndex): StringHandle {
        assert(virtualIndex < StringHandle.VirtualIndex.Count);
        return new StringHandle(StringHandleType.VirtualString | virtualIndex);
    }

    public static FromWriterVirtualIndex(virtualIndex: number): StringHandle {
        return new StringHandle(StringHandleType.VirtualString | virtualIndex);
    }

    public WithWinRTPrefix(): StringHandle {
        assert(this.StringKind == StringKind.Plain);
        return new StringHandle(StringHandleType.WinRTPrefixedString | this._value);
    }

    public WithDotTermination(): StringHandle {
        assert(this.StringKind == StringKind.Plain);
        return new StringHandle(StringHandleType.DotTerminatedString | this._value);
    }

    public SuffixRaw(prefixByteLength: number): StringHandle {
        assert(this.StringKind == StringKind.Plain);
        assert(prefixByteLength >= 0);
        return new StringHandle(StringHandleType.String | (this._value + prefixByteLength));
    }

    // public static implicit operator Handle(StringHandle handle)
    // {
    //     // VTTx xxxx xxxx xxxx  xxxx xxxx xxxx xxxx -> V111 10TT
    //     return new Handle(
    //         (byte)((handle._value & HeapHandleType.VirtualBit) >> 24 | HandleType.String | (handle._value & StringHandleType.NonVirtualTypeMask) >> HeapHandleType.OffsetBitCount),
    //         (handle._value & HeapHandleType.OffsetMask));
    // }

    // public static explicit operator StringHandle(Handle handle)
    // {
    //     if ((handle.VType & ~(HandleType.VirtualBit | HandleType.NonVirtualStringTypeMask)) != HandleType.String)
    //     {
    //         throw new Error("Invalid cast");
    //     }

    //     // V111 10TT -> VTTx xxxx xxxx xxxx  xxxx xxxx xxxx xxxx
    //     return new StringHandle(
    //         (handle.VType & HandleType.VirtualBit) << 24 |
    //         (handle.VType & HandleType.NonVirtualStringTypeMask) << HeapHandleType.OffsetBitCount |
    //         (uint)handle.Offset);
    // }

    public get RawValue() {
        return this._value;
    }

    public get IsVirtual() {
        return (this._value & HeapHandleType.VirtualBit) != 0;
    }

    public get IsNil() {
        // virtual strings are never nil, so include virtual bit
        return (this._value & (HeapHandleType.VirtualBit | HeapHandleType.OffsetMask)) == 0;
    }

    public GetHeapOffset(): number {
        // WinRT prefixed strings are virtual, the value is a heap offset
        assert(!this.IsVirtual || this.StringKind == StringKind.WinRTPrefixed);
        return (this._value & HeapHandleType.OffsetMask);
    }

    public GetVirtualIndex(): StringHandle.VirtualIndex {
        assert(this.IsVirtual && this.StringKind != StringKind.WinRTPrefixed);
        return (this._value & HeapHandleType.OffsetMask);
    }

    public GetWriterVirtualIndex(): number {
        assert(this.IsNil || this.IsVirtual && this.StringKind == StringKind.Virtual);
        return (this._value & HeapHandleType.OffsetMask);
    }

    public get StringKind(): StringKind {
        return (this._value >> HeapHandleType.OffsetBitCount);
    }

    // public override bool Equals(object? obj)
    // {
    //     return obj is StringHandle && Equals((StringHandle)obj);
    // }

    // public bool Equals(StringHandle other)
    // {
    //     return _value == other._value;
    // }

    // public override int GetHashCode()
    // {
    //     return unchecked(_value);
    // }

    // public static bool operator ==(StringHandle left, StringHandle right)
    // {
    //     return left.Equals(right);
    // }

    // public static bool operator !=(StringHandle left, StringHandle right)
    // {
    //     return !left.Equals(right);
    // }
}

export namespace StringHandle {
    export enum VirtualIndex {
        System_Runtime_WindowsRuntime,
        System_Runtime,
        System_ObjectModel,
        System_Runtime_WindowsRuntime_UI_Xaml,
        System_Runtime_InteropServices_WindowsRuntime,
        System_Numerics_Vectors,

        Dispose,

        AttributeTargets,
        AttributeUsageAttribute,
        Color,
        CornerRadius,
        DateTimeOffset,
        Duration,
        DurationType,
        EventHandler1,
        EventRegistrationToken,
        Exception,
        GeneratorPosition,
        GridLength,
        GridUnitType,
        ICommand,
        IDictionary2,
        IDisposable,
        IEnumerable,
        IEnumerable1,
        IList,
        IList1,
        INotifyCollectionChanged,
        INotifyPropertyChanged,
        IReadOnlyDictionary2,
        IReadOnlyList1,
        KeyTime,
        KeyValuePair2,
        Matrix,
        Matrix3D,
        Matrix3x2,
        Matrix4x4,
        NotifyCollectionChangedAction,
        NotifyCollectionChangedEventArgs,
        NotifyCollectionChangedEventHandler,
        Nullable1,
        Plane,
        Point,
        PropertyChangedEventArgs,
        PropertyChangedEventHandler,
        Quaternion,
        Rect,
        RepeatBehavior,
        RepeatBehaviorType,
        Size,
        System,
        System_Collections,
        System_Collections_Generic,
        System_Collections_Specialized,
        System_ComponentModel,
        System_Numerics,
        System_Windows_Input,
        Thickness,
        TimeSpan,
        Type,
        Uri,
        Vector2,
        Vector3,
        Vector4,
        Windows_Foundation,
        Windows_UI,
        Windows_UI_Xaml,
        Windows_UI_Xaml_Controls_Primitives,
        Windows_UI_Xaml_Media,
        Windows_UI_Xaml_Media_Animation,
        Windows_UI_Xaml_Media_Media3D,

        Count
    }
}

//     /// <summary>
//     /// A handle that represents a namespace definition.
//     /// </summary>
//     export class NamespaceDefinitionHandle : IEquatable<NamespaceDefinitionHandle>
//     {
//         // Non-virtual (namespace having at least one type or forwarder of its own)
//         // heap offset is to the null-terminated full name of the namespace in the
//         // #String heap.
//         //
//         // Virtual (namespace having child namespaces but no types of its own)
//         // the virtual index is an auto-incremented value and serves solely to
//         // create unique values for indexing into the NamespaceCache.

//         // bits:
//         //     31: IsVirtual
//         // 29..31: 0
//         //  0..28: Heap offset or Virtual index
//         private readonly uint _value;

//         private NamespaceDefinitionHandle(uint value)
//         {
//             _value = value;
//         }

//         public static NamespaceDefinitionHandle FromFullNameOffset(int stringHeapOffset)
//         {
//             return new NamespaceDefinitionHandle((uint)stringHeapOffset);
//         }

//         public static NamespaceDefinitionHandle FromVirtualIndex(uint virtualIndex)
//         {
//             // we arbitrarily disallow 0 virtual index to simplify nil check.
//             assert(virtualIndex != 0);

//             if (!HeapHandleType.IsValidHeapOffset(virtualIndex))
//             {
//                 // only a pathological assembly would hit this, but it must fit in 29 bits.
//                 Throw.TooManySubnamespaces();
//             }

//             return new NamespaceDefinitionHandle(TokenTypeIds.VirtualBit | virtualIndex);
//         }

//         public static implicit operator Handle(NamespaceDefinitionHandle handle)
//         {
//             return new Handle(
//                 (byte)((handle._value & HeapHandleType.VirtualBit) >> 24 | HandleType.Namespace),
//                 (handle._value & HeapHandleType.OffsetMask));
//         }

//         public static explicit operator NamespaceDefinitionHandle(Handle handle)
//         {
//             if ((handle.VType & HandleType.TypeMask) != HandleType.Namespace)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new NamespaceDefinitionHandle(
//                 (handle.VType & HandleType.VirtualBit) << TokenTypeIds.RowIdBitCount |
//                 (uint)handle.Offset);
//         }

//         public bool IsNil
//         {
//             get
//             {
//                 return _value == 0;
//             }
//         }

//         public bool IsVirtual
//         {
//             get { return (_value & HeapHandleType.VirtualBit) != 0; }
//         }

//         public int GetHeapOffset()
//         {
//             assert(!IsVirtual);
//             return (_value & HeapHandleType.OffsetMask);
//         }

//         public bool HasFullName
//         {
//             get { return !IsVirtual; }
//         }

//         public StringHandle GetFullName()
//         {
//             assert(HasFullName);
//             return StringHandle.FromOffset(GetHeapOffset());
//         }

//         public override bool Equals([NotNullWhen(true)] object? obj)
//         {
//             return obj is NamespaceDefinitionHandle ndh && Equals(ndh);
//         }

//         public bool Equals(NamespaceDefinitionHandle other)
//         {
//             return _value == other._value;
//         }

//         public override int GetHashCode()
//         {
//             return unchecked(_value);
//         }

//         public static bool operator ==(NamespaceDefinitionHandle left, NamespaceDefinitionHandle right)
//         {
//             return left.Equals(right);
//         }

//         public static bool operator !=(NamespaceDefinitionHandle left, NamespaceDefinitionHandle right)
//         {
//             return !left.Equals(right);
//         }
//     }


//     // #Guid heap handle
//     export class GuidHandle : IEquatable<GuidHandle>
//     {
//         // The Guid heap is an array of GUIDs, each 16 bytes wide.
//         // Its first element is numbered 1, its second 2, and so on.
//         private readonly int _index;

//         private GuidHandle(int index)
//         {
//             _index = index;
//         }

//         public static GuidHandle FromIndex(int heapIndex)
//         {
//             return new GuidHandle(heapIndex);
//         }

//         public static implicit operator Handle(GuidHandle handle)
//         {
//             return new Handle((byte)HandleType.Guid, handle._index);
//         }

//         public static explicit operator GuidHandle(Handle handle)
//         {
//             if (handle.VType != HandleType.Guid)
//             {
//                 throw new Error("Invalid cast");
//             }

//             return new GuidHandle(handle.Offset);
//         }

//         public bool IsNil
//         {
//             get { return _index == 0; }
//         }

//         public int Index
//         {
//             get { return _index; }
//         }

//         public override bool Equals([NotNullWhen(true)] object? obj)
//         {
//             return obj is GuidHandle gh && Equals(gh);
//         }

//         public bool Equals(GuidHandle other)
//         {
//             return _index == other._index;
//         }

//         public override int GetHashCode()
//         {
//             return _index;
//         }

//         public static bool operator ==(GuidHandle left, GuidHandle right)
//         {
//             return left.Equals(right);
//         }

//         public static bool operator !=(GuidHandle left, GuidHandle right)
//         {
//             return !left.Equals(right);
//         }
//     }