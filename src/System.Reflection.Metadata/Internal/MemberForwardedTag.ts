import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
export class MemberForwardedTag {
    public static readonly NumberOfBits = 1;
    public static readonly LargeRowSize = 0x00000001 << (16 - MemberForwardedTag.NumberOfBits);
    public static readonly Field = 0x00000000;
    public static readonly MethodDef = 0x00000001;
    public static readonly TagMask = 0x00000001;
    public static readonly TablesReferenced: TableMask =
        TableMask.Field
        | TableMask.MethodDef;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.FieldDef >> 24 | TokenTypeIds.MethodDef >> 16;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint memberForwarded)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(memberForwarded & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (memberForwarded >> NumberOfBits);

    //     if ((rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    // internal static uint ConvertMethodDefToTag(MethodDefinitionHandle methodDef)
    // {
    //     return (uint)methodDef.RowId << NumberOfBits | MethodDef;
    // }
}