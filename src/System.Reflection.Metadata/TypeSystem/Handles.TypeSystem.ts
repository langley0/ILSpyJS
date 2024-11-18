export class MethodDefinitionHandle {
    // private const uint tokenType = TokenTypeIds.MethodDef;
    // private const byte tokenTypeSmall = (byte)HandleType.MethodDef;
    // private readonly int _rowId;

    // private MethodDefinitionHandle(int rowId)
    // {
    //     Debug.Assert(TokenTypeIds.IsValidRowId(rowId));
    //     _rowId = rowId;
    // }

    // internal static MethodDefinitionHandle FromRowId(int rowId)
    // {
    //     return new MethodDefinitionHandle(rowId);
    // }

    // public static implicit operator Handle(MethodDefinitionHandle handle)
    // {
    //     return new Handle(tokenTypeSmall, handle._rowId);
    // }

    // public static implicit operator EntityHandle(MethodDefinitionHandle handle)
    // {
    //     return new EntityHandle((uint)(tokenType | handle._rowId));
    // }

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

    // public bool IsNil
    // {
    //     get
    //     {
    //         return RowId == 0;
    //     }
    // }

    // internal int RowId { get { return _rowId; } }

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

    // public override int GetHashCode()
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

enum VirtualIndex {
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

    //         internal static BlobHandle FromOffset(int heapOffset) {
    //         return new BlobHandle((uint)heapOffset);
    //     }

    //         internal static BlobHandle FromVirtualIndex(VirtualIndex virtualIndex, ushort virtualValue) {
    //         Debug.Assert(virtualIndex < VirtualIndex.Count);
    //         return new BlobHandle(TokenTypeIds.VirtualBit | (uint)(virtualValue << 8) | (uint)virtualIndex);
    //     }

    //         internal const int TemplateParameterOffset_AttributeUsageTarget = 2;

    //         internal unsafe void SubstituteTemplateParameters(byte[] blob)
    // {
    //     Debug.Assert(blob.Length >= TemplateParameterOffset_AttributeUsageTarget + 4);

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
    //         (int)(handle._value & HeapHandleType.OffsetMask));
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

    //         internal uint RawValue => _value;

    //         public bool IsNil
    // {
    //             get { return _value == 0; }
    // }

    //         internal int GetHeapOffset()
    // {
    //     Debug.Assert(!IsVirtual);
    //     return (int)_value;
    // }

    //         internal VirtualIndex GetVirtualIndex()
    // {
    //     Debug.Assert(IsVirtual);
    //     return (VirtualIndex)(_value & 0xff);
    // }

    //         internal bool IsVirtual
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

    //         public override int GetHashCode()
    // {
    //     return unchecked((int)_value);
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


export class StringHandle {
    // // bits:
    // //     31: IsVirtual
    // // 29..31: type (non-virtual: String, DotTerminatedString; virtual: VirtualString, WinRTPrefixedString)
    // //  0..28: Heap offset or Virtual index
    // private readonly uint _value;

    // internal enum VirtualIndex
    // {
    //     System_Runtime_WindowsRuntime,
    //     System_Runtime,
    //     System_ObjectModel,
    //     System_Runtime_WindowsRuntime_UI_Xaml,
    //     System_Runtime_InteropServices_WindowsRuntime,
    //     System_Numerics_Vectors,

    //     Dispose,

    //     AttributeTargets,
    //     AttributeUsageAttribute,
    //     Color,
    //     CornerRadius,
    //     DateTimeOffset,
    //     Duration,
    //     DurationType,
    //     EventHandler1,
    //     EventRegistrationToken,
    //     Exception,
    //     GeneratorPosition,
    //     GridLength,
    //     GridUnitType,
    //     ICommand,
    //     IDictionary2,
    //     IDisposable,
    //     IEnumerable,
    //     IEnumerable1,
    //     IList,
    //     IList1,
    //     INotifyCollectionChanged,
    //     INotifyPropertyChanged,
    //     IReadOnlyDictionary2,
    //     IReadOnlyList1,
    //     KeyTime,
    //     KeyValuePair2,
    //     Matrix,
    //     Matrix3D,
    //     Matrix3x2,
    //     Matrix4x4,
    //     NotifyCollectionChangedAction,
    //     NotifyCollectionChangedEventArgs,
    //     NotifyCollectionChangedEventHandler,
    //     Nullable1,
    //     Plane,
    //     Point,
    //     PropertyChangedEventArgs,
    //     PropertyChangedEventHandler,
    //     Quaternion,
    //     Rect,
    //     RepeatBehavior,
    //     RepeatBehaviorType,
    //     Size,
    //     System,
    //     System_Collections,
    //     System_Collections_Generic,
    //     System_Collections_Specialized,
    //     System_ComponentModel,
    //     System_Numerics,
    //     System_Windows_Input,
    //     Thickness,
    //     TimeSpan,
    //     Type,
    //     Uri,
    //     Vector2,
    //     Vector3,
    //     Vector4,
    //     Windows_Foundation,
    //     Windows_UI,
    //     Windows_UI_Xaml,
    //     Windows_UI_Xaml_Controls_Primitives,
    //     Windows_UI_Xaml_Media,
    //     Windows_UI_Xaml_Media_Animation,
    //     Windows_UI_Xaml_Media_Media3D,

    //     Count
    // }

    // private StringHandle(uint value)
    // {
    //     Debug.Assert((value & StringHandleType.TypeMask) == StringHandleType.String ||
    //                  (value & StringHandleType.TypeMask) == StringHandleType.VirtualString ||
    //                  (value & StringHandleType.TypeMask) == StringHandleType.WinRTPrefixedString ||
    //                  (value & StringHandleType.TypeMask) == StringHandleType.DotTerminatedString);

    //     _value = value;
    // }

    // internal static StringHandle FromOffset(int heapOffset)
    // {
    //     return new StringHandle(StringHandleType.String | (uint)heapOffset);
    // }

    // internal static StringHandle FromVirtualIndex(VirtualIndex virtualIndex)
    // {
    //     Debug.Assert(virtualIndex < VirtualIndex.Count);
    //     return new StringHandle(StringHandleType.VirtualString | (uint)virtualIndex);
    // }

    // internal static StringHandle FromWriterVirtualIndex(int virtualIndex)
    // {
    //     return new StringHandle(StringHandleType.VirtualString | (uint)virtualIndex);
    // }

    // internal StringHandle WithWinRTPrefix()
    // {
    //     Debug.Assert(StringKind == StringKind.Plain);
    //     return new StringHandle(StringHandleType.WinRTPrefixedString | _value);
    // }

    // internal StringHandle WithDotTermination()
    // {
    //     Debug.Assert(StringKind == StringKind.Plain);
    //     return new StringHandle(StringHandleType.DotTerminatedString | _value);
    // }

    // internal StringHandle SuffixRaw(int prefixByteLength)
    // {
    //     Debug.Assert(StringKind == StringKind.Plain);
    //     Debug.Assert(prefixByteLength >= 0);
    //     return new StringHandle(StringHandleType.String | (_value + (uint)prefixByteLength));
    // }

    // public static implicit operator Handle(StringHandle handle)
    // {
    //     // VTTx xxxx xxxx xxxx  xxxx xxxx xxxx xxxx -> V111 10TT
    //     return new Handle(
    //         (byte)((handle._value & HeapHandleType.VirtualBit) >> 24 | HandleType.String | (handle._value & StringHandleType.NonVirtualTypeMask) >> HeapHandleType.OffsetBitCount),
    //         (int)(handle._value & HeapHandleType.OffsetMask));
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

    // internal uint RawValue => _value;

    // internal bool IsVirtual
    // {
    //     get { return (_value & HeapHandleType.VirtualBit) != 0; }
    // }

    // public bool IsNil
    // {
    //     get
    //     {
    //         // virtual strings are never nil, so include virtual bit
    //         return (_value & (HeapHandleType.VirtualBit | HeapHandleType.OffsetMask)) == 0;
    //     }
    // }

    // internal int GetHeapOffset()
    // {
    //     // WinRT prefixed strings are virtual, the value is a heap offset
    //     Debug.Assert(!IsVirtual || StringKind == StringKind.WinRTPrefixed);
    //     return (int)(_value & HeapHandleType.OffsetMask);
    // }

    // internal VirtualIndex GetVirtualIndex()
    // {
    //     Debug.Assert(IsVirtual && StringKind != StringKind.WinRTPrefixed);
    //     return (VirtualIndex)(_value & HeapHandleType.OffsetMask);
    // }

    // internal int GetWriterVirtualIndex()
    // {
    //     Debug.Assert(IsNil || IsVirtual && StringKind == StringKind.Virtual);
    //     return (int)(_value & HeapHandleType.OffsetMask);
    // }

    // internal StringKind StringKind
    // {
    //     get { return (StringKind)(_value >> HeapHandleType.OffsetBitCount); }
    // }

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
    //     return unchecked((int)_value);
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
    // private readonly int _index;

    // private GuidHandle(int index)
    // {
    //     _index = index;
    // }

    // internal static GuidHandle FromIndex(int heapIndex)
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

    // internal int Index
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

    // public override int GetHashCode()
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