export class COR20Constants
{
    public static readonly SizeOfCorHeader = 72;
    public static readonly COR20MetadataSignature = 0x424A5342;
    public static readonly MinimumSizeofMetadataHeader = 16;
    public static readonly SizeofStorageHeader = 4;
    public static readonly MinimumSizeofStreamHeader = 8;
    public static readonly StringStreamName = "#Strings";
    public static readonly BlobStreamName = "#Blob";
    public static readonly GUIDStreamName = "#GUID";
    public static readonly UserStringStreamName = "#US";
    public static readonly CompressedMetadataTableStreamName = "#~";
    public static readonly UncompressedMetadataTableStreamName = "#-";
    public static readonly MinimalDeltaMetadataTableStreamName = "#JTD";
    public static readonly StandalonePdbStreamName = "#Pdb";
    public static readonly LargeStreamHeapSize = 0x0001000;
}