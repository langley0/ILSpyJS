import { EntityHandle } from "System.Reflection.Metadata";
import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";


export class HasCustomAttributeTag {
    public static readonly NumberOfBits = 5;
    public static readonly LargeRowSize = 0x00000001 << (16 - HasCustomAttributeTag.NumberOfBits);
    public static readonly MethodDef = 0x00000000;
    public static readonly Field = 0x00000001;
    public static readonly TypeRef = 0x00000002;
    public static readonly TypeDef = 0x00000003;
    public static readonly Param = 0x00000004;
    public static readonly InterfaceImpl = 0x00000005;
    public static readonly MemberRef = 0x00000006;
    public static readonly Module = 0x00000007;
    public static readonly DeclSecurity = 0x00000008;
    public static readonly Property = 0x00000009;
    public static readonly Event = 0x0000000A;
    public static readonly StandAloneSig = 0x0000000B;
    public static readonly ModuleRef = 0x0000000C;
    public static readonly TypeSpec = 0x0000000D;
    public static readonly Assembly = 0x0000000E;
    public static readonly AssemblyRef = 0x0000000F;
    public static readonly File = 0x00000010;
    public static readonly ExportedType = 0x00000011;
    public static readonly ManifestResource = 0x00000012;
    public static readonly GenericParam = 0x00000013;
    public static readonly GenericParamConstraint = 0x00000014;
    public static readonly MethodSpec = 0x00000015;
    public static readonly TagMask = 0x0000001F;

    // Arbitrary value not equal to any of the token types in the array. This includes 0 which is TokenTypeIds.Module.
    public static readonly InvalidTokenType = 0xFFFFFFFF;
    public static get TagToTokenTypeArray(): ArrayLike<number> {

        return [
            TokenTypeIds.MethodDef,
            TokenTypeIds.FieldDef,
            TokenTypeIds.TypeRef,
            TokenTypeIds.TypeDef,
            TokenTypeIds.ParamDef,
            TokenTypeIds.InterfaceImpl,
            TokenTypeIds.MemberRef,
            TokenTypeIds.Module,
            TokenTypeIds.DeclSecurity,
            TokenTypeIds.Property,
            TokenTypeIds.Event,
            TokenTypeIds.Signature,
            TokenTypeIds.ModuleRef,
            TokenTypeIds.TypeSpec,
            TokenTypeIds.Assembly,
            TokenTypeIds.AssemblyRef,
            TokenTypeIds.File,
            TokenTypeIds.ExportedType,
            TokenTypeIds.ManifestResource,
            TokenTypeIds.GenericParam,
            TokenTypeIds.GenericParamConstraint,
            TokenTypeIds.MethodSpec,

            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType,
            HasCustomAttributeTag.InvalidTokenType
        ];
    }

    public static readonly TablesReferenced: TableMask =
        TableMask.MethodDef
        | TableMask.Field
        | TableMask.TypeRef
        | TableMask.TypeDef
        | TableMask.Param
        | TableMask.InterfaceImpl
        | TableMask.MemberRef
        | TableMask.Module
        | TableMask.DeclSecurity
        | TableMask.Property
        | TableMask.Event
        | TableMask.StandAloneSig
        | TableMask.ModuleRef
        | TableMask.TypeSpec
        | TableMask.Assembly
        | TableMask.AssemblyRef
        | TableMask.File
        | TableMask.ExportedType
        | TableMask.ManifestResource
        | TableMask.GenericParam
        | TableMask.GenericParamConstraint
        | TableMask.MethodSpec;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint hasCustomAttribute)
    // {
    //     uint tokenType = TagToTokenTypeArray[(int)(hasCustomAttribute & TagMask)];
    //     uint rowId = (hasCustomAttribute >> NumberOfBits);

    //     if (tokenType == InvalidTokenType || ((rowId & ~TokenTypeIds.RIDMask) != 0))
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    public static ConvertToTag(handle: EntityHandle): number {
        const tokenType = handle.Type;
        const rowId = handle.RowId;
        switch (tokenType >> TokenTypeIds.RowIdBitCount) {
            case TokenTypeIds.MethodDef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.MethodDef;
            case TokenTypeIds.FieldDef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.Field;
            case TokenTypeIds.TypeRef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.TypeRef;
            case TokenTypeIds.TypeDef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.TypeDef;
            case TokenTypeIds.ParamDef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.Param;
            case TokenTypeIds.InterfaceImpl >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.InterfaceImpl;
            case TokenTypeIds.MemberRef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.MemberRef;
            case TokenTypeIds.Module >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.Module;
            case TokenTypeIds.DeclSecurity >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.DeclSecurity;
            case TokenTypeIds.Property >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.Property;
            case TokenTypeIds.Event >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.Event;
            case TokenTypeIds.Signature >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.StandAloneSig;
            case TokenTypeIds.ModuleRef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.ModuleRef;
            case TokenTypeIds.TypeSpec >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.TypeSpec;
            case TokenTypeIds.Assembly >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.Assembly;
            case TokenTypeIds.AssemblyRef >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.AssemblyRef;
            case TokenTypeIds.File >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.File;
            case TokenTypeIds.ExportedType >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.ExportedType;
            case TokenTypeIds.ManifestResource >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.ManifestResource;
            case TokenTypeIds.GenericParam >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.GenericParam;
            case TokenTypeIds.GenericParamConstraint >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.GenericParamConstraint;
            case TokenTypeIds.MethodSpec >> TokenTypeIds.RowIdBitCount: return rowId << HasCustomAttributeTag.NumberOfBits | HasCustomAttributeTag.MethodSpec;

            default: return 0;
        };
    }
}