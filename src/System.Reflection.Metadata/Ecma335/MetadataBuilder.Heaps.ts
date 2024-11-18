import { BlobBuilder } from '../BlobBuilder';

export class HeapBlobBuilder extends BlobBuilder {
    private _capacityExpansion: number;

    public constructor(capacity: number) {
        super(capacity);
        this._capacityExpansion = 0;
    }

    protected override AllocateChunk(minimalSize: number): BlobBuilder {
        return new HeapBlobBuilder(Math.max(Math.max(minimalSize, this.ChunkCapacity), this._capacityExpansion));
    }

    public SetCapacity(capacity: number) {
        this._capacityExpansion = Math.max(0, capacity - this.Count - this.FreeBytes);
    }
}

export function SuffixSort(x: string, y: string) {
    for (let i = x.length - 1, j = y.length - 1; i >= 0 && j >= 0; i--, j--) {
        if (x[i] < y[j]) {
            return -1;
        }

        if (x[i] > y[j]) {
            return +1;
        }
    }

    return y.length - x.length;
}

export function StringSort(x: string, y: string) {
    return x.localeCompare(y);
}