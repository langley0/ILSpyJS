export enum HeapIndex {
    UserString,
    String,
    Blob,
    Guid
}

export class HeapIndexExtensions {
    public static Count = HeapIndex.Guid + 1;
}