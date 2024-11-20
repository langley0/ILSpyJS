import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class ImplementationTag {
    public static readonly NumberOfBits = 2;
    public static readonly LargeRowSize = 0x00000001 << (16 - ImplementationTag.NumberOfBits);
    public static readonly File = 0x00000000;
    public static readonly AssemblyRef = 0x00000001;
    public static readonly ExportedType = 0x00000002;
    public static readonly TagMask = 0x00000003;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.File >> 24 | TokenTypeIds.AssemblyRef >> 16 | TokenTypeIds.ExportedType >> 8;
    public static readonly TablesReferenced: TableMask =
        TableMask.File
        | TableMask.AssemblyRef
        | TableMask.ExportedType;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint implementation)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(implementation & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (implementation >> NumberOfBits);

    //     if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }
}