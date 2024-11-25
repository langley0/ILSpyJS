import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
import { EntityHandle } from "System.Reflection.Metadata/EntityHandle";

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

    public static ConvertToHandle(implementation: number): EntityHandle {
        const tokenType = (ImplementationTag.TagToTokenTypeByteVector >> ((implementation & ImplementationTag.TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
        const rowId = (implementation >> ImplementationTag.NumberOfBits);

        if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0) {
            throw new Error("Invalid implementation tag");
        }

        return new EntityHandle(tokenType | rowId);
    }
}