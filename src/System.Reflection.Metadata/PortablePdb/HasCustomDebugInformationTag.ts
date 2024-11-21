import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class HasCustomDebugInformationTag {
    public static readonly NumberOfBits = 5;
    public static readonly LargeRowSize = 0x00000001 << (16 - HasCustomDebugInformationTag.NumberOfBits);

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

    public static readonly Document = 0x00000016;
    public static readonly LocalScope = 0x00000017;
    public static readonly LocalVariable = 0x00000018;
    public static readonly LocalConstant = 0x00000019;
    public static readonly Import = 0x0000001a;

    public static readonly TagMask = 0x0000001F;

    // Arbitrary value not equal to any of the token types in the array. This includes 0 which is TokenTypeIds.Module.
    public static readonly InvalidTokenType = Number.MAX_VALUE;

    public static TagToTokenTypeArray: number[] =
        [
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

            TokenTypeIds.Document,
            TokenTypeIds.LocalScope,
            TokenTypeIds.LocalVariable,
            TokenTypeIds.LocalConstant,
            TokenTypeIds.ImportScope,

            HasCustomDebugInformationTag.InvalidTokenType,
            HasCustomDebugInformationTag.InvalidTokenType,
            HasCustomDebugInformationTag.InvalidTokenType,
            HasCustomDebugInformationTag.InvalidTokenType,
            HasCustomDebugInformationTag.InvalidTokenType
        ];


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
        | TableMask.MethodSpec
        | TableMask.Document
        | TableMask.LocalScope
        | TableMask.LocalVariable
        | TableMask.LocalConstant
        | TableMask.ImportScope;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public static EntityHandle ConvertToHandle(number taggedReference)
    // {
    //     number tokenType = TagToTokenTypeArray[(number)(taggedReference & TagMask)];
    //     number rowId = (taggedReference >> NumberOfBits);

    //     if (tokenType == InvalidTokenType || ((rowId & ~TokenTypeIds.RIDMask) != 0))
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    // public static number ConvertToTag(EntityHandle handle)
    // {
    //     number tokenType = handle.Type;
    //     number rowId = (number)handle.RowId;
    //     return (tokenType >> TokenTypeIds.RowIdBitCount) switch
    //     {
    //         TokenTypeIds.MethodDef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | MethodDef,
    //         TokenTypeIds.FieldDef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Field,
    //         TokenTypeIds.TypeRef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | TypeRef,
    //         TokenTypeIds.TypeDef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | TypeDef,
    //         TokenTypeIds.ParamDef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Param,
    //         TokenTypeIds.InterfaceImpl >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | InterfaceImpl,
    //         TokenTypeIds.MemberRef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | MemberRef,
    //         TokenTypeIds.Module >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Module,
    //         TokenTypeIds.DeclSecurity >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | DeclSecurity,
    //         TokenTypeIds.Property >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Property,
    //         TokenTypeIds.Event >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Event,
    //         TokenTypeIds.Signature >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | StandAloneSig,
    //         TokenTypeIds.ModuleRef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | ModuleRef,
    //         TokenTypeIds.TypeSpec >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | TypeSpec,
    //         TokenTypeIds.Assembly >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Assembly,
    //         TokenTypeIds.AssemblyRef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | AssemblyRef,
    //         TokenTypeIds.File >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | File,
    //         TokenTypeIds.ExportedType >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | ExportedType,
    //         TokenTypeIds.ManifestResource >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | ManifestResource,
    //         TokenTypeIds.GenericParam >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | GenericParam,
    //         TokenTypeIds.GenericParamConstraint >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | GenericParamConstraint,
    //         TokenTypeIds.MethodSpec >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | MethodSpec,

    //         TokenTypeIds.Document >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Document,
    //         TokenTypeIds.LocalScope >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | LocalScope,
    //         TokenTypeIds.LocalVariable >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | LocalVariable,
    //         TokenTypeIds.LocalConstant >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | LocalConstant,
    //         TokenTypeIds.ImportScope >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Import,

    //         _ => 0,
    //     };
    // }
}