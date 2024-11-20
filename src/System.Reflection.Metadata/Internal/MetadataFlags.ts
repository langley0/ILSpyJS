import { BitArithmetic } from "System.Reflection.Internal";
import { TableIndex } from "../Ecma335/TableIndex";

export enum MetadataStreamKind {
    Illegal,
    Compressed,
    Uncompressed,
}

export class TableMask {
    public static readonly Module = 1 << TableIndex.Module;
    public static readonly TypeRef = 1 << TableIndex.TypeRef;
    public static readonly TypeDef = 1 << TableIndex.TypeDef;
    public static readonly FieldPtr = 1 << TableIndex.FieldPtr;
    public static readonly Field = 1 << TableIndex.Field;
    public static readonly MethodPtr = 1 << TableIndex.MethodPtr;
    public static readonly MethodDef = 1 << TableIndex.MethodDef;
    public static readonly ParamPtr = 1 << TableIndex.ParamPtr;
    public static readonly Param = 1 << TableIndex.Param;
    public static readonly InterfaceImpl = 1 << TableIndex.InterfaceImpl;
    public static readonly MemberRef = 1 << TableIndex.MemberRef;
    public static readonly Constant = 1 << TableIndex.Constant;
    public static readonly CustomAttribute = 1 << TableIndex.CustomAttribute;
    public static readonly FieldMarshal = 1 << TableIndex.FieldMarshal;
    public static readonly DeclSecurity = 1 << TableIndex.DeclSecurity;
    public static readonly ClassLayout = 1 << TableIndex.ClassLayout;
    public static readonly FieldLayout = 1 << TableIndex.FieldLayout;
    public static readonly StandAloneSig = 1 << TableIndex.StandAloneSig;
    public static readonly EventMap = 1 << TableIndex.EventMap;
    public static readonly EventPtr = 1 << TableIndex.EventPtr;
    public static readonly Event = 1 << TableIndex.Event;
    public static readonly PropertyMap = 1 << TableIndex.PropertyMap;
    public static readonly PropertyPtr = 1 << TableIndex.PropertyPtr;
    public static readonly Property = 1 << TableIndex.Property;
    public static readonly MethodSemantics = 1 << TableIndex.MethodSemantics;
    public static readonly MethodImpl = 1 << TableIndex.MethodImpl;
    public static readonly ModuleRef = 1 << TableIndex.ModuleRef;
    public static readonly TypeSpec = 1 << TableIndex.TypeSpec;
    public static readonly ImplMap = 1 << TableIndex.ImplMap;
    public static readonly FieldRva = 1 << TableIndex.FieldRva;
    public static readonly EnCLog = 1 << TableIndex.EncLog;
    public static readonly EnCMap = 1 << TableIndex.EncMap;
    public static readonly Assembly = Number(BitArithmetic.SetBit64(TableIndex.Assembly));
    // AssemblyProcessor = 1 << TableIndices.AssemblyProcessor;
    // AssemblyOS = 1 << TableIndices.AssemblyOS;
    public static readonly AssemblyRef = Number(BitArithmetic.SetBit64(TableIndex.AssemblyRef));
    // AssemblyRefProcessor = 1 << TableIndices.AssemblyRefProcessor;
    // AssemblyRefOS = 1 << TableIndices.AssemblyRefOS;
    public static readonly File = Number(BitArithmetic.SetBit64(TableIndex.File));
    public static readonly ExportedType = Number(BitArithmetic.SetBit64(TableIndex.ExportedType));
    public static readonly ManifestResource = Number(BitArithmetic.SetBit64(TableIndex.ManifestResource));
    public static readonly NestedClass = Number(BitArithmetic.SetBit64(TableIndex.NestedClass));
    public static readonly GenericParam = Number(BitArithmetic.SetBit64(TableIndex.GenericParam));
    public static readonly MethodSpec = Number(BitArithmetic.SetBit64(TableIndex.MethodSpec));
    public static readonly GenericParamConstraint = Number(BitArithmetic.SetBit64(TableIndex.GenericParamConstraint));

    public static readonly Document = Number(BitArithmetic.SetBit64(TableIndex.Document));
    public static readonly MethodDebugInformation = Number(BitArithmetic.SetBit64(TableIndex.MethodDebugInformation));
    public static readonly LocalScope = Number(BitArithmetic.SetBit64(TableIndex.LocalScope));
    public static readonly LocalVariable = Number(BitArithmetic.SetBit64(TableIndex.LocalVariable));
    public static readonly LocalConstant = Number(BitArithmetic.SetBit64(TableIndex.LocalConstant));
    public static readonly ImportScope = Number(BitArithmetic.SetBit64(TableIndex.ImportScope));
    public static readonly StateMachineMethod = Number(BitArithmetic.SetBit64(TableIndex.StateMachineMethod));
    public static readonly CustomDebugInformation = Number(BitArithmetic.SetBit64(TableIndex.CustomDebugInformation));

    public static readonly PtrTables =
        TableMask.FieldPtr
        | TableMask.MethodPtr
        | TableMask.ParamPtr
        | TableMask.EventPtr
        | TableMask.PropertyPtr;

    public static readonly EncTables =
        TableMask.EnCLog
        | TableMask.EnCMap;

    public static readonly TypeSystemTables =
        TableMask.PtrTables
        | TableMask.EncTables
        | TableMask.Module
        | TableMask.TypeRef
        | TableMask.TypeDef
        | TableMask.Field
        | TableMask.MethodDef
        | TableMask.Param
        | TableMask.InterfaceImpl
        | TableMask.MemberRef
        | TableMask.Constant
        | TableMask.CustomAttribute
        | TableMask.FieldMarshal
        | TableMask.DeclSecurity
        | TableMask.ClassLayout
        | TableMask.FieldLayout
        | TableMask.StandAloneSig
        | TableMask.EventMap
        | TableMask.Event
        | TableMask.PropertyMap
        | TableMask.Property
        | TableMask.MethodSemantics
        | TableMask.MethodImpl
        | TableMask.ModuleRef
        | TableMask.TypeSpec
        | TableMask.ImplMap
        | TableMask.FieldRva
        | TableMask.Assembly
        | TableMask.AssemblyRef
        | TableMask.File
        | TableMask.ExportedType
        | TableMask.ManifestResource
        | TableMask.NestedClass
        | TableMask.GenericParam
        | TableMask.MethodSpec
        | TableMask.GenericParamConstraint;

    public static readonly DebugTables =
        TableMask.Document
        | TableMask.MethodDebugInformation
        | TableMask.LocalScope
        | TableMask.LocalVariable
        | TableMask.LocalConstant
        | TableMask.ImportScope
        | TableMask.StateMachineMethod
        | TableMask.CustomDebugInformation;

    public static readonly AllTables =
        TableMask.TypeSystemTables |
        TableMask.DebugTables;

    public static readonly ValidPortablePdbExternalTables =
        TableMask.TypeSystemTables & ~TableMask.PtrTables & ~TableMask.EncTables;
}

export enum HeapSizes {
    StringHeapLarge = 0x01, // 4 byte uint indexes used for string heap offsets
    GuidHeapLarge = 0x02,   // 4 byte uint indexes used for GUID heap offsets
    BlobHeapLarge = 0x04,   // 4 byte uint indexes used for Blob heap offsets
    ExtraData = 0x40,       // Indicates that there is an extra 4 bytes of data immediately after the row counts
}

export class HeapHandleType {
    // Heap offset values are limited to 29 bits (max compressed integer)
    public static readonly OffsetBitCount = 29;
    public static readonly OffsetMask = (1 << HeapHandleType.OffsetBitCount) - 1;
    public static readonly VirtualBit = 0x80000000;

    public static IsValidHeapOffset(offset: number): boolean {
        return (offset & ~HeapHandleType.OffsetMask) == 0;
    }
}

export class StringHandleType {
    // The 3 high bits above the offset that specify the full string type (including virtual bit)
    public static readonly TypeMask = ~(HeapHandleType.OffsetMask);

    // The string type bits excluding the virtual bit.
    public static readonly NonVirtualTypeMask = StringHandleType.TypeMask & ~(HeapHandleType.VirtualBit);

    // NUL-terminated UTF8 string on a #String heap.
    public static readonly String = (0 << HeapHandleType.OffsetBitCount);

    // String on #String heap whose terminator is NUL and '.', whichever comes first.
    public static readonly DotTerminatedString = (1 << HeapHandleType.OffsetBitCount);

    // Reserved values that can be used for future strings:
    public static readonly ReservedString1 = (2 << HeapHandleType.OffsetBitCount);
    public static readonly ReservedString2 = (3 << HeapHandleType.OffsetBitCount);

    // Virtual string identified by a virtual index
    public static readonly VirtualString = HeapHandleType.VirtualBit | (0 << HeapHandleType.OffsetBitCount);

    // Virtual string whose value is a "<WinRT>" prefixed string found at the specified heap offset.
    public static readonly WinRTPrefixedString = HeapHandleType.VirtualBit | (1 << HeapHandleType.OffsetBitCount);

    // Reserved virtual strings that can be used in future:
    public static readonly ReservedVirtualString1 = HeapHandleType.VirtualBit | (2 << HeapHandleType.OffsetBitCount);
    public static readonly ReservedVirtualString2 = HeapHandleType.VirtualBit | (3 << HeapHandleType.OffsetBitCount);
}

export enum StringKind {
    Plain = (StringHandleType.String >> HeapHandleType.OffsetBitCount),
    Virtual = (StringHandleType.VirtualString >> HeapHandleType.OffsetBitCount),
    WinRTPrefixed = (StringHandleType.WinRTPrefixedString >> HeapHandleType.OffsetBitCount),
    DotTerminated = (StringHandleType.DotTerminatedString >> HeapHandleType.OffsetBitCount),
}

/// <summary>
/// These constants are all in the byte range and apply to the interpretation of <see cref="Handle.VType"/>,
/// </summary>
export class HandleType {
    public static readonly Module = TableIndex.Module;
    public static readonly TypeRef = TableIndex.TypeRef;
    public static readonly TypeDef = TableIndex.TypeDef;
    public static readonly FieldDef = TableIndex.Field;
    public static readonly MethodDef = TableIndex.MethodDef;
    public static readonly ParamDef = TableIndex.Param;
    public static readonly InterfaceImpl = TableIndex.InterfaceImpl;
    public static readonly MemberRef = TableIndex.MemberRef;
    public static readonly Constant = TableIndex.Constant;
    public static readonly CustomAttribute = TableIndex.CustomAttribute;
    public static readonly DeclSecurity = TableIndex.DeclSecurity;
    public static readonly Signature = TableIndex.StandAloneSig;
    public static readonly EventMap = TableIndex.EventMap;
    public static readonly Event = TableIndex.Event;
    public static readonly PropertyMap = TableIndex.PropertyMap;
    public static readonly Property = TableIndex.Property;
    public static readonly MethodSemantics = TableIndex.MethodSemantics;
    public static readonly MethodImpl = TableIndex.MethodImpl;
    public static readonly ModuleRef = TableIndex.ModuleRef;
    public static readonly TypeSpec = TableIndex.TypeSpec;
    public static readonly Assembly = TableIndex.Assembly;
    public static readonly AssemblyRef = TableIndex.AssemblyRef;
    public static readonly File = TableIndex.File;
    public static readonly ExportedType = TableIndex.ExportedType;
    public static readonly ManifestResource = TableIndex.ManifestResource;
    public static readonly NestedClass = TableIndex.NestedClass;
    public static readonly GenericParam = TableIndex.GenericParam;
    public static readonly MethodSpec = TableIndex.MethodSpec;
    public static readonly GenericParamConstraint = TableIndex.GenericParamConstraint;

    // debug tables:
    public static readonly Document = TableIndex.Document;
    public static readonly MethodDebugInformation = TableIndex.MethodDebugInformation;
    public static readonly LocalScope = TableIndex.LocalScope;
    public static readonly LocalVariable = TableIndex.LocalVariable;
    public static readonly LocalConstant = TableIndex.LocalConstant;
    public static readonly ImportScope = TableIndex.ImportScope;
    public static readonly AsyncMethod = TableIndex.StateMachineMethod;
    public static readonly CustomDebugInformation = TableIndex.CustomDebugInformation;

    public static readonly UserString = 0x70;     // #UserString heap

    // The following values never appear in a token stored in metadata,
    // they are just helper values to identify the type of a handle.
    // Note, however, that even though they do not come from the spec,
    // they are surfaced as public constants via HandleKind enum and
    // therefore cannot change!

    public static readonly Blob = 0x71;        // #Blob heap
    public static readonly Guid = 0x72;        // #Guid heap

    // #String heap and its modifications
    //
    // Multiple values are reserved for string handles so that we can encode special
    // handling with more than just the virtual bit. See StringHandleType for how
    // the two extra bits are actually interpreted. The extra String1,2,3 values here are
    // not used directly, but serve as a reminder that they are not available for use
    // by another handle type.
    public static readonly String = 0x78;
    public static readonly String1 = 0x79;
    public static readonly String2 = 0x7a;
    public static readonly String3 = 0x7b;

    // Namespace handles also have offsets into the #String heap (when non-virtual)
    // to their full name. However, this is an implementation detail and they are
    // surfaced with first-class HandleKind.Namespace and strongly-typed NamespaceHandle.
    public static readonly Namespace = 0x7c;

    public static readonly HeapMask = 0x70;
    public static readonly TypeMask = 0x7F;

    /// <summary>
    /// Use the highest bit to mark tokens that are virtual (synthesized).
    /// We create virtual tokens to represent projected WinMD entities.
    /// </summary>
    public static readonly VirtualBit = 0x80;

    /// <summary>
    /// In the case of string handles, the two lower bits that (in addition to the
    /// virtual bit not included in this mask) encode how to obtain the string value.
    /// </summary>
    public static readonly NonVirtualStringTypeMask = 0x03;
}

export class TokenTypeIds {
    public static readonly RowIdBitCount = 24;

    public static readonly Module = HandleType.Module << TokenTypeIds.RowIdBitCount;
    public static readonly TypeRef = HandleType.TypeRef << TokenTypeIds.RowIdBitCount;
    public static readonly TypeDef = HandleType.TypeDef << TokenTypeIds.RowIdBitCount;
    public static readonly FieldDef = HandleType.FieldDef << TokenTypeIds.RowIdBitCount;
    public static readonly MethodDef = HandleType.MethodDef << TokenTypeIds.RowIdBitCount;
    public static readonly ParamDef = HandleType.ParamDef << TokenTypeIds.RowIdBitCount;
    public static readonly InterfaceImpl = HandleType.InterfaceImpl << TokenTypeIds.RowIdBitCount;
    public static readonly MemberRef = HandleType.MemberRef << TokenTypeIds.RowIdBitCount;
    public static readonly Constant = HandleType.Constant << TokenTypeIds.RowIdBitCount;
    public static readonly CustomAttribute = HandleType.CustomAttribute << TokenTypeIds.RowIdBitCount;
    public static readonly DeclSecurity = HandleType.DeclSecurity << TokenTypeIds.RowIdBitCount;
    public static readonly Signature = HandleType.Signature << TokenTypeIds.RowIdBitCount;
    public static readonly EventMap = HandleType.EventMap << TokenTypeIds.RowIdBitCount;
    public static readonly Event = HandleType.Event << TokenTypeIds.RowIdBitCount;
    public static readonly PropertyMap = HandleType.PropertyMap << TokenTypeIds.RowIdBitCount;
    public static readonly Property = HandleType.Property << TokenTypeIds.RowIdBitCount;
    public static readonly MethodSemantics = HandleType.MethodSemantics << TokenTypeIds.RowIdBitCount;
    public static readonly MethodImpl = HandleType.MethodImpl << TokenTypeIds.RowIdBitCount;
    public static readonly ModuleRef = HandleType.ModuleRef << TokenTypeIds.RowIdBitCount;
    public static readonly TypeSpec = HandleType.TypeSpec << TokenTypeIds.RowIdBitCount;
    public static readonly Assembly = HandleType.Assembly << TokenTypeIds.RowIdBitCount;
    public static readonly AssemblyRef = HandleType.AssemblyRef << TokenTypeIds.RowIdBitCount;
    public static readonly File = HandleType.File << TokenTypeIds.RowIdBitCount;
    public static readonly ExportedType = HandleType.ExportedType << TokenTypeIds.RowIdBitCount;
    public static readonly ManifestResource = HandleType.ManifestResource << TokenTypeIds.RowIdBitCount;
    public static readonly NestedClass = HandleType.NestedClass << TokenTypeIds.RowIdBitCount;
    public static readonly GenericParam = HandleType.GenericParam << TokenTypeIds.RowIdBitCount;
    public static readonly MethodSpec = HandleType.MethodSpec << TokenTypeIds.RowIdBitCount;
    public static readonly GenericParamConstraint = HandleType.GenericParamConstraint << TokenTypeIds.RowIdBitCount;

    // debug tables:
    public static readonly Document = HandleType.Document << TokenTypeIds.RowIdBitCount;
    public static readonly MethodDebugInformation = HandleType.MethodDebugInformation << TokenTypeIds.RowIdBitCount;
    public static readonly LocalScope = HandleType.LocalScope << TokenTypeIds.RowIdBitCount;
    public static readonly LocalVariable = HandleType.LocalVariable << TokenTypeIds.RowIdBitCount;
    public static readonly LocalConstant = HandleType.LocalConstant << TokenTypeIds.RowIdBitCount;
    public static readonly ImportScope = HandleType.ImportScope << TokenTypeIds.RowIdBitCount;
    public static readonly AsyncMethod = HandleType.AsyncMethod << TokenTypeIds.RowIdBitCount;
    public static readonly CustomDebugInformation = HandleType.CustomDebugInformation << TokenTypeIds.RowIdBitCount;

    public static readonly UserString = HandleType.UserString << TokenTypeIds.RowIdBitCount;

    public static readonly RIDMask = (1 << TokenTypeIds.RowIdBitCount) - 1;
    public static readonly TypeMask = HandleType.TypeMask << TokenTypeIds.RowIdBitCount;

    /// <summary>
    /// Use the highest bit to mark tokens that are virtual (synthesized).
    /// We create virtual tokens to represent projected WinMD entities.
    /// </summary>
    public static readonly VirtualBit = 0x80000000;

    /// <summary>
    /// Returns true if the token value can escape the metadata reader.
    /// We don't allow virtual tokens and heap tokens other than UserString to escape
    /// since the token type ids are public to the reader and not specified by ECMA spec.
    ///
    /// Spec (Partition III, 1.9 Metadata tokens):
    /// Many CIL instructions are followed by a "metadata token". This is a 4-byte value, that specifies a row in a
    /// metadata table, or a starting byte offset in the User String heap.
    ///
    /// For example, a value of 0x02 specifies the TypeDef table; a value of 0x70 specifies the User
    /// String heap.The value corresponds to the number assigned to that metadata table (see Partition II for the full
    /// list of tables) or to 0x70 for the User String heap.The least-significant 3 bytes specify the target row within that
    /// metadata table, or starting byte offset within the User String heap.
    /// </summary>
    public static IsEntityOrUserStringToken(vToken: number): boolean {
        return (vToken & TokenTypeIds.TypeMask) <= TokenTypeIds.UserString;
    }

    public static IsEntityToken(vToken: number): boolean {
        return (vToken & TokenTypeIds.TypeMask) < TokenTypeIds.UserString;
    }

    public static IsValidRowId(rowId: number): boolean {
        return (rowId & ~TokenTypeIds.RIDMask) == 0;
    }
}
