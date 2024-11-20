import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
export class HasFieldMarshalTag {
    public static readonly NumberOfBits = 1;
    public static readonly LargeRowSize = 0x00000001 << (16 - HasFieldMarshalTag.NumberOfBits);
    public static readonly Field = 0x00000000;
    public static readonly Param = 0x00000001;
    public static readonly TagMask = 0x00000001;
    public static readonly TablesReferenced: TableMask =
        TableMask.Field
        | TableMask.Param;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.FieldDef >> 24 | TokenTypeIds.ParamDef >> 16;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint hasFieldMarshal)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(hasFieldMarshal & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (hasFieldMarshal >> NumberOfBits);

    //     if ((rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    // internal static uint ConvertToTag(EntityHandle handle)
    // {
    //     if (handle.Type == TokenTypeIds.FieldDef)
    //     {
    //         return (uint)handle.RowId << NumberOfBits | Field;
    //     }
    //     else if (handle.Type == TokenTypeIds.ParamDef)
    //     {
    //         return (uint)handle.RowId << NumberOfBits | Param;
    //     }

    //     return 0;
    // }
}