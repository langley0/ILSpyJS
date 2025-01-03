import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
import { EntityHandle } from "System.Reflection.Metadata/EntityHandle";

export class ResolutionScopeTag {
    public static readonly NumberOfBits = 2;
    public static readonly LargeRowSize = 0x00000001 << (16 - ResolutionScopeTag.NumberOfBits);
    public static readonly Module = 0x00000000;
    public static readonly ModuleRef = 0x00000001;
    public static readonly AssemblyRef = 0x00000002;
    public static readonly TypeRef = 0x00000003;
    public static readonly TagMask = 0x00000003;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.Module >> 24 | TokenTypeIds.ModuleRef >> 16 | TokenTypeIds.AssemblyRef >> 8 | TokenTypeIds.TypeRef;
    public static readonly TablesReferenced: TableMask =
        TableMask.Module
        | TableMask.ModuleRef
        | TableMask.AssemblyRef
        | TableMask.TypeRef;

    // [MethodImplAttribute(MethodImplOptions.AggressiveInlining)]
    public static ConvertToHandle(resolutionScope: number): EntityHandle {
        const tokenType = (ResolutionScopeTag.TagToTokenTypeByteVector >> ((resolutionScope & ResolutionScopeTag.TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
        const rowId = (resolutionScope >> ResolutionScopeTag.NumberOfBits);

        if ((rowId & ~TokenTypeIds.RIDMask) != 0) {
            throw new Error("Invalid resolution scope");
        }

        return new EntityHandle(tokenType | rowId);
    }
}