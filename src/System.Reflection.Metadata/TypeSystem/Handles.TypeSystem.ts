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

export class MethodDefinitionHandle {
    private static readonly tokenType = TokenTypeIds.MethodDef;
    private static readonly tokenTypeSmall = HandleType.MethodDef;
    private readonly _rowId: number;

    private constructor(rowId: number) {
        assert(TokenTypeIds.IsValidRowId(rowId));
        this._rowId = rowId;
    }

    public static FromRowId( rowId: number) : MethodDefinitionHandle
    {
        return new MethodDefinitionHandle(rowId);
    }

    public get Handle(): Handle
    {
        return new Handle(MethodDefinitionHandle.tokenTypeSmall, this._rowId);
    }

    public get EntityHandle(): EntityHandle
    {
        return new EntityHandle(MethodDefinitionHandle.tokenType | this._rowId);
    }

    // public static explicit operator MethodDefinitionHandle(Handle handle)
    // {
    //     if (handle.VType != tokenTypeSmall)
    //     {
    //         Throw.InvalidCast();
    //     }

    //     return new MethodDefinitionHandle(handle.RowId);
    // }

    // public static explicit operator MethodDefinitionHandle(EntityHandle handle)
    // {
    //     if (handle.VType != tokenType)
    //     {
    //         Throw.InvalidCast();
    //     }

    //     return new MethodDefinitionHandle(handle.RowId);
    // }

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

export enum BlobVirtualIndex {
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

export class BlobHandle {
    //     // bits:
    //     //     31: IsVirtual
    //     // 29..30: 0
    //     //  0..28: Heap offset or Virtual Value (16 bits) + Virtual Index (8 bits)
    //     private readonly uint _value;


    //     private BlobHandle(uint value) {
    //         _value = value;
    //     }

    //         public static BlobHandle FromOffset(number heapOffset) {
    //         return new BlobHandle((uint)heapOffset);
    //     }

    //         public static BlobHandle FromVirtualIndex(VirtualIndex virtualIndex, ushort virtualValue) {
    //         assert(virtualIndex < VirtualIndex.Count);
    //         return new BlobHandle(TokenTypeIds.VirtualBit | (uint)(virtualValue << 8) | (uint)virtualIndex);
    //     }

    //         public const number TemplateParameterOffset_AttributeUsageTarget = 2;

    //         public unsafe void SubstituteTemplateParameters(byte[] blob)
    // {
    //     assert(blob.Length >= TemplateParameterOffset_AttributeUsageTarget + 4);

    //     fixed(byte * ptr = & blob[TemplateParameterOffset_AttributeUsageTarget])
    //     {
    //                 * ((uint *)ptr) = VirtualValue;
    //     }
    // }

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
    //         Throw.InvalidCast();
    //     }

    //     return new BlobHandle(
    //         (handle.VType & HandleType.VirtualBit) << TokenTypeIds.RowIdBitCount |
    //         (uint)handle.Offset);
    // }

    //         public uint RawValue => _value;

    //         public bool IsNil
    // {
    //             get { return _value == 0; }
    // }

    //         public number GetHeapOffset()
    // {
    //     assert(!IsVirtual);
    //     return (number)_value;
    // }

    //         public VirtualIndex GetVirtualIndex()
    // {
    //     assert(IsVirtual);
    //     return (VirtualIndex)(_value & 0xff);
    // }

    //         public bool IsVirtual
    // {
    //             get { return (_value & TokenTypeIds.VirtualBit) != 0; }
    // }

    //         private ushort VirtualValue
    // {
    //             get { return unchecked((ushort)(_value >> 8)); }
    // }

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

    // public static StringHandle FromVirtualIndex( virtualIndex: VirtualIndex): StringHandle
    // {
    //     assert(virtualIndex < VirtualIndex.Count);
    //     return new StringHandle(StringHandleType.VirtualString | (uint)virtualIndex);
    // }

    public static FromWriterVirtualIndex(virtualIndex: number): StringHandle {
        return new StringHandle(StringHandleType.VirtualString | virtualIndex);
    }

    // public StringHandle WithWinRTPrefix()
    // {
    //     assert(StringKind == StringKind.Plain);
    //     return new StringHandle(StringHandleType.WinRTPrefixedString | _value);
    // }

    // public StringHandle WithDotTermination()
    // {
    //     assert(StringKind == StringKind.Plain);
    //     return new StringHandle(StringHandleType.DotTerminatedString | _value);
    // }

    // public StringHandle SuffixRaw(number prefixByteLength)
    // {
    //     assert(StringKind == StringKind.Plain);
    //     assert(prefixByteLength >= 0);
    //     return new StringHandle(StringHandleType.String | (_value + (uint)prefixByteLength));
    // }

    // public static implicit operator Handle(StringHandle handle)
    // {
    //     // VTTx xxxx xxxx xxxx  xxxx xxxx xxxx xxxx -> V111 10TT
    //     return new Handle(
    //         (byte)((handle._value & HeapHandleType.VirtualBit) >> 24 | HandleType.String | (handle._value & StringHandleType.NonVirtualTypeMask) >> HeapHandleType.OffsetBitCount),
    //         (number)(handle._value & HeapHandleType.OffsetMask));
    // }

    // public static explicit operator StringHandle(Handle handle)
    // {
    //     if ((handle.VType & ~(HandleType.VirtualBit | HandleType.NonVirtualStringTypeMask)) != HandleType.String)
    //     {
    //         Throw.InvalidCast();
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

    public get IsVirtual(): boolean {
        return (this._value & HeapHandleType.VirtualBit) != 0;
    }

    public get IsNil(): boolean {
        // virtual strings are never nil, so include virtual bit
        return (this._value & (HeapHandleType.VirtualBit | HeapHandleType.OffsetMask)) == 0;

    }

    // public number GetHeapOffset()
    // {
    //     // WinRT prefixed strings are virtual, the value is a heap offset
    //     assert(!IsVirtual || StringKind == StringKind.WinRTPrefixed);
    //     return (number)(_value & HeapHandleType.OffsetMask);
    // }

    // public VirtualIndex GetVirtualIndex()
    // {
    //     assert(IsVirtual && StringKind != StringKind.WinRTPrefixed);
    //     return (VirtualIndex)(_value & HeapHandleType.OffsetMask);
    // }

    public GetWriterVirtualIndex(): number {
        assert(this.IsNil || this.IsVirtual && this.StringKind == StringKind.Virtual);
        return this._value & HeapHandleType.OffsetMask;
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

    // public override number GetHashCode()
    // {
    //     return unchecked((number)_value);
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

export class GuidHandle {
    // // The Guid heap is an array of GUIDs, each 16 bytes wide.
    // // Its first element is numbered 1, its second 2, and so on.
    // private readonly number _index;

    // private GuidHandle(number index)
    // {
    //     _index = index;
    // }

    // public static GuidHandle FromIndex(number heapIndex)
    // {
    //     return new GuidHandle(heapIndex);
    // }

    // public static implicit operator Handle(GuidHandle handle)
    // {
    //     return new Handle((byte)HandleType.Guid, handle._index);
    // }

    // public static explicit operator GuidHandle(Handle handle)
    // {
    //     if (handle.VType != HandleType.Guid)
    //     {
    //         Throw.InvalidCast();
    //     }

    //     return new GuidHandle(handle.Offset);
    // }

    // public bool IsNil
    // {
    //     get { return _index == 0; }
    // }

    // public number Index
    // {
    //     get { return _index; }
    // }

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
    //         Throw.InvalidCast();
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