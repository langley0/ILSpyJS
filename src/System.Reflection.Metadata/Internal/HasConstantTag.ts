import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class HasConstantTag {
    public static readonly NumberOfBits = 2;
    public static readonly LargeRowSize = 0x00000001 << (16 - HasConstantTag.NumberOfBits);
    public static readonly Field = 0x00000000;
    public static readonly Param = 0x00000001;
    public static readonly Property = 0x00000002;
    public static readonly TagMask = 0x00000003;
    public static readonly TablesReferenced: TableMask =
        TableMask.Field
        | TableMask.Param
        | TableMask.Property;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.FieldDef >> 24 | TokenTypeIds.ParamDef >> 16 | TokenTypeIds.Property >> 8;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint hasConstant)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(hasConstant & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (hasConstant >> NumberOfBits);

    //     if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    // internal static uint ConvertToTag(EntityHandle token)
    // {
    //     HandleKind tokenKind = token.Kind;
    //     uint rowId = (uint)token.RowId;
    //     if (tokenKind == HandleKind.FieldDefinition)
    //     {
    //         return rowId << NumberOfBits | Field;
    //     }
    //     else if (tokenKind == HandleKind.Parameter)
    //     {
    //         return rowId << NumberOfBits | Param;
    //     }
    //     else if (tokenKind == HandleKind.PropertyDefinition)
    //     {
    //         return rowId << NumberOfBits | Property;
    //     }

    //     return 0;
    // }
}