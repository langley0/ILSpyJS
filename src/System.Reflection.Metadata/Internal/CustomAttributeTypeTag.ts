import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class CustomAttributeTypeTag {
    public static readonly NumberOfBits = 3;
    public static readonly LargeRowSize = 0x00000001 << (16 - CustomAttributeTypeTag.NumberOfBits);
    public static readonly MethodDef = 0x00000002;
    public static readonly MemberRef = 0x00000003;
    public static readonly TagMask = 0x0000007;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.MethodDef >> 8 | TokenTypeIds.MemberRef;
    public static readonly TablesReferenced: TableMask =
        TableMask.MethodDef
        | TableMask.MemberRef;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint customAttributeType)
    // {
    //     uint tokenType = unchecked((uint)(TagToTokenTypeByteVector >> ((int)(customAttributeType & TagMask) << 3)) << TokenTypeIds.RowIdBitCount);
    //     uint rowId = (customAttributeType >> NumberOfBits);

    //     if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }
}