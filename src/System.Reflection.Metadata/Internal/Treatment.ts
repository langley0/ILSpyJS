// namespace System.Reflection.Metadata.Ecma335

export enum TypeDefTreatment {
    None = 0,

    KindMask = 0x0f,
    NormalNonAttribute = 1,
    NormalAttribute = 2,
    UnmangleWinRTName = 3,
    PrefixWinRTName = 4,
    RedirectedToClrType = 5,
    RedirectedToClrAttribute = 6,

    MarkAbstractFlag = 0x10,
    MarkInternalFlag = 0x20
}

export enum TypeRefTreatment {
    None = 0,
    SystemDelegate = 1,
    SystemAttribute = 2,

    // RowId is an index to the projection info table.
    UseProjectionInfo = 3,
}

export enum TypeRefSignatureTreatment {
    None = 0,
    ProjectedToClass = 1,
    ProjectedToValueType = 2,
}


export enum MethodDefTreatment {
    None = 0,

    KindMask = 0x0f,
    Other = 1,
    DelegateMethod = 2,
    AttributeMethod = 3,
    InterfaceMethod = 4,
    Implementation = 5,
    HiddenInterfaceImplementation = 6,
    DisposeMethod = 7,

    MarkAbstractFlag = 0x10,
    MarkPublicFlag = 0x20,
    // TODO: In the latest Adapter.cpp sources this seems to be no longer applicable (confirm?)
    // MarkSpecialName = 0x40
}

export enum FieldDefTreatment {
    None = 0,
    EnumValue = 1,
}

export enum MemberRefTreatment {
    None = 0,
    Dispose = 1,
}

export enum CustomAttributeTreatment {
    None = 0,
    WinMD = 1,
}

export enum CustomAttributeValueTreatment {
    None = 0,
    AttributeUsageAllowSingle = 1,
    AttributeUsageAllowMultiple = 2,
    AttributeUsageVersionAttribute = 3,
    AttributeUsageDeprecatedAttribute = 4,
}