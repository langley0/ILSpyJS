import {
    TableMask,
    TokenTypeIds
} from "System.Reflection.Metadata.Ecma335";

export class TypeOrMethodDefTag
    {
        public static readonly   NumberOfBits = 1;
        public static readonly   LargeRowSize = 0x00000001 << (16 - TypeOrMethodDefTag.NumberOfBits);
        public static readonly   TypeDef = 0x00000000;
        public static readonly   MethodDef = 0x00000001;
        public static readonly   TagMask = 0x0000001;
        public static readonly   TagToTokenTypeByteVector = TokenTypeIds.TypeDef >> 24 | TokenTypeIds.MethodDef >> 16;
        public static readonly   TablesReferenced :TableMask =
          TableMask.TypeDef
          | TableMask.MethodDef;

        // [MethodImpl(MethodImplOptions.AggressiveInlining)]
        // internal static EntityHandle ConvertToHandle(uint typeOrMethodDef)
        // {
        //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(typeOrMethodDef & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
        //     uint rowId = (typeOrMethodDef >> NumberOfBits);

        //     if ((rowId & ~TokenTypeIds.RIDMask) != 0)
        //     {
        //         Throw.InvalidCodedIndex();
        //     }

        //     return new EntityHandle(tokenType | rowId);
        // }

        // internal static uint ConvertTypeDefRowIdToTag(TypeDefinitionHandle typeDef)
        // {
        //     return (uint)typeDef.RowId << NumberOfBits | TypeDef;
        // }

        // internal static uint ConvertMethodDefToTag(MethodDefinitionHandle methodDef)
        // {
        //     return (uint)methodDef.RowId << NumberOfBits | MethodDef;
        // }
    }