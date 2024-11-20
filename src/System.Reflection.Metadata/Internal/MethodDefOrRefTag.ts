import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class MethodDefOrRefTag {
    public static readonly NumberOfBits = 1;
    public static readonly LargeRowSize = 0x00000001 << (16 - MethodDefOrRefTag.NumberOfBits);
    public static readonly MethodDef = 0x00000000;
    public static readonly MemberRef = 0x00000001;
    public static readonly TagMask = 0x00000001;
    public static readonly TablesReferenced: TableMask =
        TableMask.MethodDef
        | TableMask.MemberRef;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.MethodDef >> 24 | TokenTypeIds.MemberRef >> 16;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint methodDefOrRef)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(methodDefOrRef & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (methodDefOrRef >> NumberOfBits);

    //     if ((rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }
}