import assert from 'assert';
import {
    HandleType,
    HeapHandleType,
    TokenTypeIds,
} from './Internal/MetadataFlags';


export class EntityHandle {
    // bits:
    //     31: IsVirtual
    // 24..30: type
    //  0..23: row id
    private readonly _vToken: number;

    public constructor(vToken: number) {
        this._vToken = vToken;
    }

    // public static implicit operator Handle(EntityHandle handle)
    // {
    //     return Handle.FromVToken(handle._vToken);
    // }

    // public static explicit operator EntityHandle(Handle handle)
    // {
    //     if (handle.IsHeapHandle)
    //     {
    //         Throw.InvalidCast();
    //     }

    //     return new EntityHandle(handle.EntityHandleValue);
    // }

    public get Type(): number {
        return this._vToken & TokenTypeIds.TypeMask;
    }

    // public uint VType
    // {
    //     get { return _vToken & (TokenTypeIds.VirtualBit | TokenTypeIds.TypeMask); }
    // }

    public get IsVirtual(): boolean {
        return (this._vToken & TokenTypeIds.VirtualBit) != 0;
    }

    // public bool IsNil
    // {
    //     // virtual handle is never nil
    //     get { return (_vToken & (TokenTypeIds.VirtualBit | TokenTypeIds.RIDMask)) == 0; }
    // }

    // public int RowId
    // {
    //     get { return (_vToken & TokenTypeIds.RIDMask); }
    // }

    // /// <summary>
    // /// Value stored in a specific entity handle (see <see cref="TypeDefinitionHandle"/>, <see cref="MethodDefinitionHandle"/>, etc.).
    // /// </summary>
    // public uint SpecificHandleValue
    // {
    //     get { return _vToken & (TokenTypeIds.VirtualBit | TokenTypeIds.RIDMask); }
    // }

    // public HandleKind Kind
    // {
    //     get
    //     {
    //         // EntityHandles cannot be StringHandles and therefore we do not need
    //         // to handle stripping the extra non-virtual string type bits here.
    //         return (HandleKind)(Type >> TokenTypeIds.RowIdBitCount);
    //     }
    // }

    public get Token(): number {
        assert(!this.IsVirtual);
        return this._vToken;

    }

    // public override bool Equals([NotNullWhen(true)] object? obj)
    // {
    //     return obj is EntityHandle entityHandle && Equals(entityHandle);
    // }

    // public bool Equals(EntityHandle other)
    // {
    //     return _vToken == other._vToken;
    // }

    // public override int GetHashCode()
    // {
    //     return unchecked(_vToken);
    // }

    // public static bool operator ==(EntityHandle left, EntityHandle right)
    // {
    //     return left.Equals(right);
    // }

    // public static bool operator !=(EntityHandle left, EntityHandle right)
    // {
    //     return !left.Equals(right);
    // }

    // public static int Compare(EntityHandle left, EntityHandle right)
    // {
    //     // All virtual tokens will be sorted after non-virtual tokens.
    //     // The order of handles that differ in kind is undefined,
    //     // but we include it so that we ensure consistency with == and != operators.
    //     return left._vToken.CompareTo(right._vToken);
    // }

    // public static readonly ModuleDefinitionHandle ModuleDefinition = new ModuleDefinitionHandle(1);
    // public static readonly AssemblyDefinitionHandle AssemblyDefinition = new AssemblyDefinitionHandle(1);
}