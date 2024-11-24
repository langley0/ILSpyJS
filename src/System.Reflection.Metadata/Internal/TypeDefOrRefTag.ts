import { Throw } from "System/Throw";
import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
import { EntityHandle } from "System.Reflection.Metadata/EntityHandle";

export class TypeDefOrRefTag {
    public static readonly NumberOfBits = 2;
    public static readonly LargeRowSize = 0x00000001 << (16 - TypeDefOrRefTag.NumberOfBits);
    public static readonly TypeDef = 0x00000000;
    public static readonly TypeRef = 0x00000001;
    public static readonly TypeSpec = 0x00000002;
    public static readonly TagMask = 0x00000003;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.TypeDef >> 24 | TokenTypeIds.TypeRef >> 16 | TokenTypeIds.TypeSpec >> 8;
    public static readonly TablesReferenced: TableMask =
        TableMask.TypeDef
        | TableMask.TypeRef
        | TableMask.TypeSpec;

    // inlining improves perf of the tight loop in FindSystemObjectTypeDef by 25%
    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static ConvertToHandle(typeDefOrRefTag: number): EntityHandle {
        const tokenType = (TypeDefOrRefTag.TagToTokenTypeByteVector >> ((typeDefOrRefTag & TypeDefOrRefTag.TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
        const rowId = (typeDefOrRefTag >> TypeDefOrRefTag.NumberOfBits);

        if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0) {
            Throw.InvalidCodedIndex();
        }

        return new EntityHandle(tokenType | rowId);
    }
}