import assert from 'assert';
import { HandleKind } from 'System.Reflection.Metadata';
import {
    HandleType,
    HeapHandleType,
    TokenTypeIds,
} from 'System.Reflection.Metadata.Ecma335';

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

    /// <summary>
    /// Creates <see cref="Handle"/> from a token or a token combined with a virtual flag.
    /// </summary>
    public static FromVToken(vToken: number): Handle {
        return new Handle((vToken >> TokenTypeIds.RowIdBitCount), (vToken & TokenTypeIds.RIDMask));
    }

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

    // for entity handles:
    public get RowId(): number {
        assert(!this.IsHeapHandle);
        return this._value;
    }

    // for heap handles:
    public get Offset(): number {
        assert(this.IsHeapHandle);
        return this._value;
    }

    /// <summary>
    /// Token type (0x##000000), does not include virtual flag.
    /// </summary>
    public get EntityHandleType(): number {
        return this.Type << TokenTypeIds.RowIdBitCount;
    }

    /// <summary>
    /// Small token type (0x##), does not include virtual flag.
    /// </summary>
    public get Type(): number {
        return this._vType & HandleType.TypeMask;
    }

    /// <summary>
    /// Value stored in an <see cref="EntityHandle"/>.
    /// </summary>
    public get EntityHandleValue(): number {
        assert((this._value & TokenTypeIds.RIDMask) == this._value);
        return this._vType << TokenTypeIds.RowIdBitCount | this._value;
    }

    /// <summary>
    /// Value stored in a concrete entity handle (see <see cref="TypeDefinitionHandle"/>, <see cref="MethodDefinitionHandle"/>, etc.).
    /// </summary>
    public get SpecificEntityHandleValue(): number {
        assert((this._value & TokenTypeIds.RIDMask) == this._value);
        return (this._vType & HandleType.VirtualBit) << TokenTypeIds.RowIdBitCount | this._value;
    }

    public get VType(): number {
        return this._vType;
    }

    public get IsVirtual(): boolean {
        return (this._vType & HandleType.VirtualBit) != 0;
    }

    public get IsHeapHandle(): boolean {
        return (this._vType & HandleType.HeapMask) == HandleType.HeapMask;
    }

    public get Kind(): HandleKind {
        const type = this.Type;
        // Do not surface extra non-virtual string type bits in public handle kind
        if ((type & ~HandleType.NonVirtualStringTypeMask) == HandleType.String) {
            return HandleKind.String;
        }
        return type;
    }

    public get IsNil(): boolean {
        // virtual handles are never nil
        return (this._value | (this._vType & HandleType.VirtualBit)) == 0;
    }

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

    public  GetHashCode(): number
    {
        return this._value ^ (this._vType << 24);
    }

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