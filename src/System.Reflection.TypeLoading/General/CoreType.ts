// namespace System.Reflection.TypeLoading
import { Utf8Constants } from "System.Reflection.TypeLoading";

export enum CoreType {
    Array,
    Boolean,
    Byte,
    Char,
    Double,
    Enum,
    Int16,
    Int32,
    Int64,
    IntPtr,
    Object,
    NullableT,
    SByte,
    Single,
    String,
    TypedReference,
    UInt16,
    UInt32,
    UInt64,
    UIntPtr,
    ValueType,
    Void,

    MulticastDelegate,

    // "Implemented" by arrays
    IEnumerableT,
    ICollectionT,
    IListT,
    IReadOnlyListT,

    // Default values
    DBNull,
    Decimal,
    DateTime,

    // For custom attribute processing
    Type,

    // For calling convention processing
    CallConvCdecl,
    CallConvStdcall,
    CallConvThiscall,
    CallConvFastcall,

    // Pseudo Custom Attributes
    ComImportAttribute,
    DllImportAttribute,
    CallingConvention,
    CharSet,
    MarshalAsAttribute,
    UnmanagedType,
    VarEnum,
    InAttribute,
    OutAttribute,
    OptionalAttribute,
    PreserveSigAttribute,
    FieldOffsetAttribute,

    NumCoreTypes,
}

export namespace CoreType {
    export function  GetFullName(coreType: CoreType) : { ns: Uint8Array, name: Uint8Array }
    {
        let ns: Uint8Array;
        let name: Uint8Array;

        switch (coreType)
        {
            case CoreType.Array: ns = Utf8Constants.System; name = Utf8Constants.Array; break;
            case CoreType.Boolean: ns = Utf8Constants.System; name = Utf8Constants.Boolean; break;
            case CoreType.Byte: ns = Utf8Constants.System; name = Utf8Constants.Byte; break;
            case CoreType.Char: ns = Utf8Constants.System; name = Utf8Constants.Char; break;
            case CoreType.Double: ns = Utf8Constants.System; name = Utf8Constants.Double; break;
            case CoreType.Enum: ns = Utf8Constants.System; name = Utf8Constants.Enum; break;
            case CoreType.Int16: ns = Utf8Constants.System; name = Utf8Constants.Int16; break;
            case CoreType.Int32: ns = Utf8Constants.System; name = Utf8Constants.Int32; break;
            case CoreType.Int64: ns = Utf8Constants.System; name = Utf8Constants.Int64; break;
            case CoreType.IntPtr: ns = Utf8Constants.System; name = Utf8Constants.IntPtr; break;
            case CoreType.NullableT: ns = Utf8Constants.System; name = Utf8Constants.NullableT; break;
            case CoreType.Object: ns = Utf8Constants.System; name = Utf8Constants.Object; break;
            case CoreType.SByte: ns = Utf8Constants.System; name = Utf8Constants.SByte; break;
            case CoreType.Single: ns = Utf8Constants.System; name = Utf8Constants.Single; break;
            case CoreType.String: ns = Utf8Constants.System; name = Utf8Constants.String; break;
            case CoreType.TypedReference: ns = Utf8Constants.System; name = Utf8Constants.TypedReference; break;
            case CoreType.UInt16: ns = Utf8Constants.System; name = Utf8Constants.UInt16; break;
            case CoreType.UInt32: ns = Utf8Constants.System; name = Utf8Constants.UInt32; break;
            case CoreType.UInt64: ns = Utf8Constants.System; name = Utf8Constants.UInt64; break;
            case CoreType.UIntPtr: ns = Utf8Constants.System; name = Utf8Constants.UIntPtr; break;
            case CoreType.ValueType: ns = Utf8Constants.System; name = Utf8Constants.ValueType; break;
            case CoreType.Void: ns = Utf8Constants.System; name = Utf8Constants.Void; break;
            case CoreType.MulticastDelegate: ns = Utf8Constants.System; name = Utf8Constants.MulticastDelegate; break;
            case CoreType.IEnumerableT: ns = Utf8Constants.SystemCollectionsGeneric; name = Utf8Constants.IEnumerableT; break;
            case CoreType.ICollectionT: ns = Utf8Constants.SystemCollectionsGeneric; name = Utf8Constants.ICollectionT; break;
            case CoreType.IListT: ns = Utf8Constants.SystemCollectionsGeneric; name = Utf8Constants.IListT; break;
            case CoreType.IReadOnlyListT: ns = Utf8Constants.SystemCollectionsGeneric; name = Utf8Constants.IReadOnlyListT; break;
            case CoreType.Type: ns = Utf8Constants.System; name = Utf8Constants.Type; break;
            case CoreType.DBNull: ns = Utf8Constants.System; name = Utf8Constants.DBNull; break;
            case CoreType.Decimal: ns = Utf8Constants.System; name = Utf8Constants.Decimal; break;
            case CoreType.DateTime: ns = Utf8Constants.System; name = Utf8Constants.DateTime; break;
            case CoreType.ComImportAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.ComImportAttribute; break;
            case CoreType.DllImportAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.DllImportAttribute; break;
            case CoreType.CallingConvention: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.CallingConvention; break;
            case CoreType.CharSet: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.CharSet; break;
            case CoreType.MarshalAsAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.MarshalAsAttribute; break;
            case CoreType.UnmanagedType: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.UnmanagedType; break;
            case CoreType.VarEnum: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.VarEnum; break;
            case CoreType.InAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.InAttribute; break;
            case CoreType.OutAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.OutAttriubute; break;
            case CoreType.OptionalAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.OptionalAttribute; break;
            case CoreType.PreserveSigAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.PreserveSigAttribute; break;
            case CoreType.FieldOffsetAttribute: ns = Utf8Constants.SystemRuntimeInteropServices; name = Utf8Constants.FieldOffsetAttribute; break;
            case CoreType.CallConvCdecl: ns = Utf8Constants.SystemRuntimeCompilerServices; name = Utf8Constants.CallConvCdecl; break;
            case CoreType.CallConvStdcall: ns = Utf8Constants.SystemRuntimeCompilerServices; name = Utf8Constants.CallConvStdcall; break;
            case CoreType.CallConvThiscall: ns = Utf8Constants.SystemRuntimeCompilerServices; name = Utf8Constants.CallConvThiscall; break;
            case CoreType.CallConvFastcall: ns = Utf8Constants.SystemRuntimeCompilerServices; name = Utf8Constants.CallConvFastcall; break;
            default:
                throw new Error("Unexpected coreType passed to GetCoreTypeFullName: " + coreType);
        }

        return { ns, name };
    }
}