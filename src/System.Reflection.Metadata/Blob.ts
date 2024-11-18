export class Blob {
    public readonly Buffer?: Uint8Array;
    public readonly Start: number;
    public readonly Length: number

    public constructor(buffer: Uint8Array | undefined, start: number, length: number) {
        this.Buffer = buffer;
        this.Start = start;
        this.Length = length;
    }

    public get IsDefault(): boolean {
        return this.Buffer == undefined;
    }

    public GetBytes(): Uint8Array {
        const result = this.Buffer?.slice(this.Start, this.Start + this.Length) || Uint8Array.from([]);
        return result;
    }
}