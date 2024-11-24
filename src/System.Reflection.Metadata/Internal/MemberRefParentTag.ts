import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
import { EntityHandle } from "System.Reflection.Metadata/EntityHandle";
export class MemberRefParentTag {
    public static readonly NumberOfBits = 3;
    public static readonly LargeRowSize = 0x00000001 << (16 - MemberRefParentTag.NumberOfBits);
    public static readonly TypeDef = 0x00000000;
    public static readonly TypeRef = 0x00000001;
    public static readonly ModuleRef = 0x00000002;
    public static readonly MethodDef = 0x00000003;
    public static readonly TypeSpec = 0x00000004;
    public static readonly TagMask = 0x00000007;
    public static readonly TablesReferenced: TableMask =
        TableMask.TypeDef
        | TableMask.TypeRef
        | TableMask.ModuleRef
        | TableMask.MethodDef
        | TableMask.TypeSpec;
    public static readonly TagToTokenTypeByteVector =
        TokenTypeIds.TypeDef >> 24
        | TokenTypeIds.TypeRef >> 16
        | TokenTypeIds.ModuleRef >> 8
        | TokenTypeIds.MethodDef
        | TokenTypeIds.TypeSpec << 8;

    // [MethodImplAttribute(MethodImplOptions.AggressiveInlining)]
    public static ConvertToHandle(memberRef: number): EntityHandle {
        const tokenType = (MemberRefParentTag.TagToTokenTypeByteVector >> ((memberRef & MemberRefParentTag.TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
        const rowId = (memberRef >> MemberRefParentTag.NumberOfBits);

        if (tokenType == 0 || (rowId & ~TokenTypeIds.RIDMask) != 0) {
            throw new Error("Invalid member ref parent");
        }

        return new EntityHandle(tokenType | rowId);
    }
}