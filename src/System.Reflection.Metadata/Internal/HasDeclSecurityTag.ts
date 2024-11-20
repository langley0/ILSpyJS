import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class HasDeclSecurityTag {
    public static readonly NumberOfBits = 2;
    public static readonly LargeRowSize = 0x00000001 << (16 - HasDeclSecurityTag.NumberOfBits);
    public static readonly TypeDef = 0x00000000;
    public static readonly MethodDef = 0x00000001;
    public static readonly Assembly = 0x00000002;
    public static readonly TagMask = 0x00000003;
    public static readonly TablesReferenced: TableMask =
        TableMask.TypeDef
        | TableMask.MethodDef
        | TableMask.Assembly;
    public static readonly TagToTokenTypeByteVector = (TokenTypeIds.TypeDef >> 24) | (TokenTypeIds.MethodDef >> 16) | (TokenTypeIds.Assembly >> 8);

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint hasDeclSecurity)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(hasDeclSecurity & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (hasDeclSecurity >> NumberOfBits);

    //     if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    // internal static uint ConvertToTag(EntityHandle handle)
    // {
    //     uint tokenType = handle.Type;
    //     uint rowId = (uint)handle.RowId;
    //     return (tokenType >> TokenTypeIds.RowIdBitCount) switch
    //     {
    //         TokenTypeIds.TypeDef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | TypeDef,
    //         TokenTypeIds.MethodDef >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | MethodDef,
    //         TokenTypeIds.Assembly >> TokenTypeIds.RowIdBitCount => rowId << NumberOfBits | Assembly,
    //         _ => 0,
    //     };
    // }
}