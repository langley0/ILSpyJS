export class SectionLocation {
    public readonly RelativeVirtualAddress: number;
    public readonly PointerToRawData: number;

    public constructor(relativeVirtualAddress: number, pointerToRawData: number) {
        this.RelativeVirtualAddress = relativeVirtualAddress;
        this.PointerToRawData = pointerToRawData;
    }
}