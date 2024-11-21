import assert from "assert";
import { MemoryBlock } from "System.Reflection.Internal";
import { MetadataKind, MetadataStringDecoder, StringHandle, MetadataReader } from "System.Reflection.Metadata";
import { VirtualHeap, StringKind } from "System.Reflection.Metadata.Ecma335";

export class StringHeap {
    private static s_virtualValues?: string[];

    public readonly Block: MemoryBlock;
    private  _lazyVirtualHeap?: VirtualHeap;

    public constructor( block: MemoryBlock,  metadataKind: MetadataKind)
    {
        this._lazyVirtualHeap = undefined;

        if (StringHeap.s_virtualValues == undefined && metadataKind != MetadataKind.Ecma335)
        {
            // Note:
            // Virtual values shall not contain surrogates, otherwise StartsWith might be inconsistent
            // when comparing to a text that ends with a high surrogate.

            var values = new Array<string>(StringHandle.VirtualIndex.Count);
            values[StringHandle.VirtualIndex.System_Runtime_WindowsRuntime] = "System.Runtime.WindowsRuntime";
            values[StringHandle.VirtualIndex.System_Runtime] = "System.Runtime";
            values[StringHandle.VirtualIndex.System_ObjectModel] = "System.ObjectModel";
            values[StringHandle.VirtualIndex.System_Runtime_WindowsRuntime_UI_Xaml] = "System.Runtime.WindowsRuntime.UI.Xaml";
            values[StringHandle.VirtualIndex.System_Runtime_InteropServices_WindowsRuntime] = "System.Runtime.InteropServices.WindowsRuntime";
            values[StringHandle.VirtualIndex.System_Numerics_Vectors] = "System.Numerics.Vectors";

            values[StringHandle.VirtualIndex.Dispose] = "Dispose";

            values[StringHandle.VirtualIndex.AttributeTargets] = "AttributeTargets";
            values[StringHandle.VirtualIndex.AttributeUsageAttribute] = "AttributeUsageAttribute";
            values[StringHandle.VirtualIndex.Color] = "Color";
            values[StringHandle.VirtualIndex.CornerRadius] = "CornerRadius";
            values[StringHandle.VirtualIndex.DateTimeOffset] = "DateTimeOffset";
            values[StringHandle.VirtualIndex.Duration] = "Duration";
            values[StringHandle.VirtualIndex.DurationType] = "DurationType";
            values[StringHandle.VirtualIndex.EventHandler1] = "EventHandler`1";
            values[StringHandle.VirtualIndex.EventRegistrationToken] = "EventRegistrationToken";
            values[StringHandle.VirtualIndex.Exception] = "Exception";
            values[StringHandle.VirtualIndex.GeneratorPosition] = "GeneratorPosition";
            values[StringHandle.VirtualIndex.GridLength] = "GridLength";
            values[StringHandle.VirtualIndex.GridUnitType] = "GridUnitType";
            values[StringHandle.VirtualIndex.ICommand] = "ICommand";
            values[StringHandle.VirtualIndex.IDictionary2] = "IDictionary`2";
            values[StringHandle.VirtualIndex.IDisposable] = "IDisposable";
            values[StringHandle.VirtualIndex.IEnumerable] = "IEnumerable";
            values[StringHandle.VirtualIndex.IEnumerable1] = "IEnumerable`1";
            values[StringHandle.VirtualIndex.IList] = "IList";
            values[StringHandle.VirtualIndex.IList1] = "IList`1";
            values[StringHandle.VirtualIndex.INotifyCollectionChanged] = "INotifyCollectionChanged";
            values[StringHandle.VirtualIndex.INotifyPropertyChanged] = "INotifyPropertyChanged";
            values[StringHandle.VirtualIndex.IReadOnlyDictionary2] = "IReadOnlyDictionary`2";
            values[StringHandle.VirtualIndex.IReadOnlyList1] = "IReadOnlyList`1";
            values[StringHandle.VirtualIndex.KeyTime] = "KeyTime";
            values[StringHandle.VirtualIndex.KeyValuePair2] = "KeyValuePair`2";
            values[StringHandle.VirtualIndex.Matrix] = "Matrix";
            values[StringHandle.VirtualIndex.Matrix3D] = "Matrix3D";
            values[StringHandle.VirtualIndex.Matrix3x2] = "Matrix3x2";
            values[StringHandle.VirtualIndex.Matrix4x4] = "Matrix4x4";
            values[StringHandle.VirtualIndex.NotifyCollectionChangedAction] = "NotifyCollectionChangedAction";
            values[StringHandle.VirtualIndex.NotifyCollectionChangedEventArgs] = "NotifyCollectionChangedEventArgs";
            values[StringHandle.VirtualIndex.NotifyCollectionChangedEventHandler] = "NotifyCollectionChangedEventHandler";
            values[StringHandle.VirtualIndex.Nullable1] = "Nullable`1";
            values[StringHandle.VirtualIndex.Plane] = "Plane";
            values[StringHandle.VirtualIndex.Point] = "Point";
            values[StringHandle.VirtualIndex.PropertyChangedEventArgs] = "PropertyChangedEventArgs";
            values[StringHandle.VirtualIndex.PropertyChangedEventHandler] = "PropertyChangedEventHandler";
            values[StringHandle.VirtualIndex.Quaternion] = "Quaternion";
            values[StringHandle.VirtualIndex.Rect] = "Rect";
            values[StringHandle.VirtualIndex.RepeatBehavior] = "RepeatBehavior";
            values[StringHandle.VirtualIndex.RepeatBehaviorType] = "RepeatBehaviorType";
            values[StringHandle.VirtualIndex.Size] = "Size";
            values[StringHandle.VirtualIndex.System] = "System";
            values[StringHandle.VirtualIndex.System_Collections] = "System.Collections";
            values[StringHandle.VirtualIndex.System_Collections_Generic] = "System.Collections.Generic";
            values[StringHandle.VirtualIndex.System_Collections_Specialized] = "System.Collections.Specialized";
            values[StringHandle.VirtualIndex.System_ComponentModel] = "System.ComponentModel";
            values[StringHandle.VirtualIndex.System_Numerics] = "System.Numerics";
            values[StringHandle.VirtualIndex.System_Windows_Input] = "System.Windows.Input";
            values[StringHandle.VirtualIndex.Thickness] = "Thickness";
            values[StringHandle.VirtualIndex.TimeSpan] = "TimeSpan";
            values[StringHandle.VirtualIndex.Type] = "Type";
            values[StringHandle.VirtualIndex.Uri] = "Uri";
            values[StringHandle.VirtualIndex.Vector2] = "Vector2";
            values[StringHandle.VirtualIndex.Vector3] = "Vector3";
            values[StringHandle.VirtualIndex.Vector4] = "Vector4";
            values[StringHandle.VirtualIndex.Windows_Foundation] = "Windows.Foundation";
            values[StringHandle.VirtualIndex.Windows_UI] = "Windows.UI";
            values[StringHandle.VirtualIndex.Windows_UI_Xaml] = "Windows.UI.Xaml";
            values[StringHandle.VirtualIndex.Windows_UI_Xaml_Controls_Primitives] = "Windows.UI.Xaml.Controls.Primitives";
            values[StringHandle.VirtualIndex.Windows_UI_Xaml_Media] = "Windows.UI.Xaml.Media";
            values[StringHandle.VirtualIndex.Windows_UI_Xaml_Media_Animation] = "Windows.UI.Xaml.Media.Animation";
            values[StringHandle.VirtualIndex.Windows_UI_Xaml_Media_Media3D] = "Windows.UI.Xaml.Media.Media3D";

            StringHeap.s_virtualValues = values;
            StringHeap.AssertFilled();
        }

        this.Block = StringHeap.TrimEnd(block);
    }

    // [Conditional("DEBUG")]
    private static AssertFilled()
    {
        for (let i = 0; i < StringHeap.s_virtualValues!.length; i++)
        {
            assert(StringHeap.s_virtualValues![i] != undefined, `Missing virtual value for StringHandle.VirtualIndex.${i}`);
        }
    }

    // Trims the alignment padding of the heap.
    // See StgStringPool::InitOnMem in ndp\clr\src\Utilcode\StgPool.cpp.

    // This is especially important for EnC.
    private static  TrimEnd( block: MemoryBlock):MemoryBlock
    {
        if (block.Length == 0)
        {
            return block;
        }

        let i = block.Length - 1;
        while (i >= 0 && block.PeekByte(i) == 0)
        {
            i--;
        }

        // this shouldn't happen in valid metadata:
        if (i == block.Length - 1)
        {
            return block;
        }

        // +1 for terminating \0
        return block.GetMemoryBlockAt(0, i + 2);
    }

    public GetString( handle: StringHandle,  utf8Decoder: MetadataStringDecoder):string
    {
        return handle.IsVirtual ? this.GetVirtualHandleString(handle, utf8Decoder) : this.GetNonVirtualString(handle, utf8Decoder);
    }

    // public MemoryBlock GetMemoryBlock(StringHandle handle)
    // {
    //     return handle.IsVirtual ? GetVirtualHandleMemoryBlock(handle) : GetNonVirtualStringMemoryBlock(handle);
    // }

    public static GetVirtualString(index: StringHandle.VirtualIndex ): string
    {
        return StringHeap.s_virtualValues![index];
    }

    private  GetNonVirtualString( handle: StringHandle,  utf8Decoder: MetadataStringDecoder, prefixOpt?: Uint8Array): string
    {
        assert(handle.StringKind != StringKind.Virtual);

        const otherTerminator = handle.StringKind == StringKind.DotTerminated ? '.' : '\0';
        return this.Block.PeekUtf8NullTerminated(handle.GetHeapOffset(), prefixOpt, utf8Decoder, otherTerminator.charCodeAt(0));
    }

    // private unsafe MemoryBlock GetNonVirtualStringMemoryBlock(StringHandle handle)
    // {
    //     assert(handle.StringKind != StringKind.Virtual);

    //     char otherTerminator = handle.StringKind == StringKind.DotTerminated ? '.' : '\0';
    //     int offset = handle.GetHeapOffset();
    //     int length = Block.GetUtf8NullTerminatedLength(offset, out _, otherTerminator);

    //     return new MemoryBlock(Block.Pointer + offset, length);
    // }

    // private unsafe byte[] GetNonVirtualStringBytes(StringHandle handle, byte[] prefix)
    // {
    //     assert(handle.StringKind != StringKind.Virtual);

    //     var block = GetNonVirtualStringMemoryBlock(handle);
    //     var bytes = new byte[prefix.Length + block.Length];
    //     Buffer.BlockCopy(prefix, 0, bytes, 0, prefix.Length);
    //     Marshal.Copy((IntPtr)block.Pointer, bytes, prefix.Length, block.Length);
    //     return bytes;
    // }

    private  GetVirtualHandleString(handle: StringHandle ,  utf8Decoder: MetadataStringDecoder): string
    {
        assert(handle.IsVirtual);
        switch(handle.StringKind) {
            case StringKind.Virtual:
                return StringHeap.GetVirtualString(handle.GetVirtualIndex());
            case StringKind.WinRTPrefixed:
                return this.GetNonVirtualString(handle, utf8Decoder, MetadataReader.WinRTPrefix);
            default:
                throw new Error(`Unexpected value: ${handle.StringKind}`);
        }

   
    }

    // private MemoryBlock GetVirtualHandleMemoryBlock(StringHandle handle)
    // {
    //     assert(handle.IsVirtual);
    //     var heap = VirtualHeap.GetOrCreateVirtualHeap(ref _lazyVirtualHeap);

    //     lock (heap)
    //     {
    //         if (!heap.TryGetMemoryBlock(handle.RawValue, out var block))
    //         {
    //             byte[] bytes = handle.StringKind switch
    //             {
    //                 StringKind.Virtual => Encoding.UTF8.GetBytes(GetVirtualString(handle.GetVirtualIndex())),
    //                 StringKind.WinRTPrefixed => GetNonVirtualStringBytes(handle, MetadataReader.WinRTPrefix),
    //                 _ => throw ExceptionUtilities.UnexpectedValue(handle.StringKind),
    //             };
    //             block = heap.AddBlob(handle.RawValue, bytes);
    //         }

    //         return block;
    //     }
    // }

    // public BlobReader GetBlobReader(StringHandle handle)
    // {
    //     return new BlobReader(GetMemoryBlock(handle));
    // }

    // public StringHandle GetNextHandle(StringHandle handle)
    // {
    //     if (handle.IsVirtual)
    //     {
    //         return default(StringHandle);
    //     }

    //     int terminator = this.Block.IndexOf(0, handle.GetHeapOffset());
    //     if (terminator == -1 || terminator == Block.Length - 1)
    //     {
    //         return default(StringHandle);
    //     }

    //     return StringHandle.FromOffset(terminator + 1);
    // }

    // public bool Equals(StringHandle handle, string value, MetadataStringDecoder utf8Decoder, bool ignoreCase)
    // {
    //     assert(value != undefined);

    //     if (handle.IsVirtual)
    //     {
    //         // TODO: This can allocate unnecessarily for <WinRT> prefixed handles.
    //         return string.Equals(GetString(handle, utf8Decoder), value, ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
    //     }

    //     if (handle.IsNil)
    //     {
    //         return value.Length == 0;
    //     }

    //     char otherTerminator = handle.StringKind == StringKind.DotTerminated ? '.' : '\0';
    //     return this.Block.Utf8NullTerminatedEquals(handle.GetHeapOffset(), value, utf8Decoder, otherTerminator, ignoreCase);
    // }

    // public bool StartsWith(StringHandle handle, string value, MetadataStringDecoder utf8Decoder, bool ignoreCase)
    // {
    //     assert(value != undefined);

    //     if (handle.IsVirtual)
    //     {
    //         // TODO: This can allocate unnecessarily for <WinRT> prefixed handles.
    //         return GetString(handle, utf8Decoder).StartsWith(value, ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
    //     }

    //     if (handle.IsNil)
    //     {
    //         return value.Length == 0;
    //     }

    //     char otherTerminator = handle.StringKind == StringKind.DotTerminated ? '.' : '\0';
    //     return this.Block.Utf8NullTerminatedStartsWith(handle.GetHeapOffset(), value, utf8Decoder, otherTerminator, ignoreCase);
    // }

    // /// <summary>
    // /// Returns true if the given raw (non-virtual) handle represents the same string as given ASCII string.
    // /// </summary>
    // public bool EqualsRaw(StringHandle rawHandle, string asciiString)
    // {
    //     assert(!rawHandle.IsVirtual);
    //     assert(rawHandle.StringKind != StringKind.DotTerminated, "Not supported");
    //     return this.Block.CompareUtf8NullTerminatedStringWithAsciiString(rawHandle.GetHeapOffset(), asciiString) == 0;
    // }

    // /// <summary>
    // /// Returns the heap index of the given ASCII character or -1 if not found prior undefined terminator or end of heap.
    // /// </summary>
    // public int IndexOfRaw(int startIndex, char asciiChar)
    // {
    //     assert(asciiChar != 0 && asciiChar <= 0x7f);
    //     return this.Block.Utf8NullTerminatedOffsetOfAsciiChar(startIndex, asciiChar);
    // }

    // /// <summary>
    // /// Returns true if the given raw (non-virtual) handle represents a string that starts with given ASCII prefix.
    // /// </summary>
    // public bool StartsWithRaw(StringHandle rawHandle, string asciiPrefix)
    // {
    //     assert(!rawHandle.IsVirtual);
    //     assert(rawHandle.StringKind != StringKind.DotTerminated, "Not supported");
    //     return this.Block.Utf8NullTerminatedStringStartsWithAsciiPrefix(rawHandle.GetHeapOffset(), asciiPrefix);
    // }

    // /// <summary>
    // /// Equivalent to Array.BinarySearch, searches for given raw (non-virtual) handle in given array of ASCII strings.
    // /// </summary>
    // public int BinarySearchRaw(string[] asciiKeys, StringHandle rawHandle)
    // {
    //     assert(!rawHandle.IsVirtual);
    //     assert(rawHandle.StringKind != StringKind.DotTerminated, "Not supported");
    //     return this.Block.BinarySearch(asciiKeys, rawHandle.GetHeapOffset());
    // }
}