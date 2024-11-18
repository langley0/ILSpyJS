import { BlobBuilder } from "../BlobBuilder";
import { MetadataSizes } from "./MetadataSizes";


export class SerializedMetadata {
    public readonly StringMap: number[];
    public readonly StringHeap: BlobBuilder;
    public readonly Sizes: MetadataSizes;

    public constructor(
        sizes: MetadataSizes,
        stringHeap: BlobBuilder,
        stringMap: number[]) {
        this.Sizes = sizes;
        this.StringHeap = stringHeap;
        this.StringMap = stringMap;
    }
}