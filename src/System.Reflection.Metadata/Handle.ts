import assert from 'assert';
import {
    HandleType,
    HeapHandleType,
    TokenTypeIds,
} from './Internal/MetadataFlags';

/// <summary>
/// Represents any metadata entity (type reference/definition/specification, method definition, custom attribute, etc.) or value (string, blob, guid, user string).
/// </summary>
/// <remarks>
/// Use <see cref="Handle"/> to store multiple kinds of handles.
/// </remarks>
export class Handle {
    private readonly _value: number;

    // bits:
    //    7: IsVirtual
    // 0..6: token type
    private readonly _vType: number;

    // /// <summary>
    // /// Creates <see cref="Handle"/> from a token or a token combined with a virtual flag.
    // /// </summary>
    // public static Handle FromVToken(uint vToken)
    // {
    //     return new Handle((byte)(vToken >> TokenTypeIds.RowIdBitCount), (int)(vToken & TokenTypeIds.RIDMask));
    // }

    public constructor(vType: number, value: number) {
        this._vType = vType;
        this._value = value;

        assert(value >= 0);

        // No table can have more than 2^24 rows.
        // User String heap is also limited by 2^24 since user strings have tokens in IL.
        // We limit the size of #Blob, #String and #GUID heaps to 2^29 (max compressed integer) in order
        // to keep the sizes of corresponding handles to 32 bit. As a result we don't support reading metadata
        // files with heaps larger than 0.5GB.
        assert((this.IsHeapHandle && value <= HeapHandleType.OffsetMask) ||
            (!this.IsHeapHandle && value <= TokenTypeIds.RIDMask));
    }

    // // for entity handles:
    // public int RowId
    // {
    //     get
    //     {
    //         assert(!IsHeapHandle);
    //         return _value;
    //     }
    // }

    // // for heap handles:
    // public int Offset
    // {
    //     get
    //     {
    //         assert(IsHeapHandle);
    //         return _value;
    //     }
    // }

    // /// <summary>
    // /// Token type (0x##000000), does not include virtual flag.
    // /// </summary>
    // public uint EntityHandleType
    // {
    //     get { return Type << TokenTypeIds.RowIdBitCount; }
    // }

    /// <summary>
    /// Small token type (0x##), does not include virtual flag.
    /// </summary>
    public get Type(): number {
        return this._vType & HandleType.TypeMask;
    }

    // /// <summary>
    // /// Value stored in an <see cref="EntityHandle"/>.
    // /// </summary>
    // public uint EntityHandleValue
    // {
    //     get
    //     {
    //         assert((_value & TokenTypeIds.RIDMask) == _value);
    //         return (uint)_vType << TokenTypeIds.RowIdBitCount | (uint)_value;
    //     }
    // }

    // /// <summary>
    // /// Value stored in a concrete entity handle (see <see cref="TypeDefinitionHandle"/>, <see cref="MethodDefinitionHandle"/>, etc.).
    // /// </summary>
    // public uint SpecificEntityHandleValue
    // {
    //     get
    //     {
    //         assert((_value & TokenTypeIds.RIDMask) == _value);
    //         return (_vType & HandleType.VirtualBit) << TokenTypeIds.RowIdBitCount | (uint)_value;
    //     }
    // }

    // public byte VType
    // {
    //     get { return _vType; }
    // }

    public get IsVirtual(): boolean {
        return (this._vType & HandleType.VirtualBit) != 0;
    }

    public get IsHeapHandle(): boolean {
        return (this._vType & HandleType.HeapMask) == HandleType.HeapMask;
    }

    // public get  Kind() : HandleKind
    // {

    //         uint type = Type;

    //         // Do not surface extra non-virtual string type bits in public handle kind
    //         if ((type & ~HandleType.NonVirtualStringTypeMask) == HandleType.String)
    //         {
    //             return HandleKind.String;
    //         }

    //         return (HandleKind)type;

    // }

    // public bool IsNil
    // {
    //     // virtual handles are never nil
    //     get { return ((uint)_value | (_vType & HandleType.VirtualBit)) == 0; }
    // }

    public get IsEntityOrUserStringHandle(): boolean {
        return this.Type <= HandleType.UserString;
    }

    public get Token(): number {
        assert(this.IsEntityOrUserStringHandle);
        assert(!this.IsVirtual);
        assert((this._value & TokenTypeIds.RIDMask) == this._value);

        return this._vType << TokenTypeIds.RowIdBitCount | this._value;

    }

    // public override bool Equals([NotNullWhen(true)] object? obj)
    // {
    //     return obj is Handle handle && Equals(handle);
    // }

    // public bool Equals(Handle other)
    // {
    //     return _value == other._value && _vType == other._vType;
    // }

    // public override int GetHashCode()
    // {
    //     return _value ^ (_vType << 24);
    // }

    // public static bool operator ==(Handle left, Handle right)
    // {
    //     return left.Equals(right);
    // }

    // public static bool operator !=(Handle left, Handle right)
    // {
    //     return !left.Equals(right);
    // }

    // public static int Compare(Handle left, Handle right)
    // {
    //     // All virtual tokens will be sorted after non-virtual tokens.
    //     // The order of handles that differ in kind is undefined,
    //     // but we include it so that we ensure consistency with == and != operators.
    //     return ((long)(uint)left._value | (long)left._vType << 32).CompareTo((long)(uint)right._value | (long)right._vType << 32);
    // }

    // public static readonly ModuleDefinitionHandle ModuleDefinition = new ModuleDefinitionHandle(1);
    // public static readonly AssemblyDefinitionHandle AssemblyDefinition = new AssemblyDefinitionHandle(1);
}