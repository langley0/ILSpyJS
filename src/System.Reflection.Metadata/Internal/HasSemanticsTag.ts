import { TableMask, TokenTypeIds } from "System.Reflection.Metadata.Ecma335";

export class HasSemanticsTag {
    public static readonly NumberOfBits = 1;
    public static readonly LargeRowSize = 0x00000001 << (16 - HasSemanticsTag.NumberOfBits);
    public static readonly Event = 0x00000000;
    public static readonly Property = 0x00000001;
    public static readonly TagMask = 0x00000001;
    public static readonly TablesReferenced: TableMask =
        TableMask.Event
        | TableMask.Property;
    public static readonly TagToTokenTypeByteVector = TokenTypeIds.Event >> 24 | TokenTypeIds.Property >> 16;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // internal static EntityHandle ConvertToHandle(uint hasSemantic)
    // {
    //     uint tokenType = (TagToTokenTypeByteVector >> ((int)(hasSemantic & TagMask) << 3)) << TokenTypeIds.RowIdBitCount;
    //     uint rowId = (hasSemantic >> NumberOfBits);

    //     if ((rowId & ~TokenTypeIds.RIDMask) != 0)
    //     {
    //         Throw.InvalidCodedIndex();
    //     }

    //     return new EntityHandle(tokenType | rowId);
    // }

    // internal static uint ConvertEventHandleToTag(EventDefinitionHandle eventDef)
    // {
    //     return (uint)eventDef.RowId << NumberOfBits | Event;
    // }

    // internal static uint ConvertPropertyHandleToTag(PropertyDefinitionHandle propertyDef)
    // {
    //     return (uint)propertyDef.RowId << NumberOfBits | Property;
    // }
}