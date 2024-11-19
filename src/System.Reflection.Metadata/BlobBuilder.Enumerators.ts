import assert from "assert";
import { BlobBuilder } from './BlobBuilder';
import { Blob } from './Blob';

export class Chunks {
    private readonly _head: BlobBuilder;
    private _next: BlobBuilder;
    private _currentOpt?: BlobBuilder;

    public constructor(builder: BlobBuilder) {
        assert(builder.IsHead);

        this._head = builder;
        this._next = builder.FirstChunk_chunks;
        this._currentOpt = undefined;
    }


    // object IEnumerator.Current => Current;
    public get Current(): BlobBuilder | undefined {
        return this._currentOpt;
    }

    public MoveNext(): boolean {
        if (this._currentOpt == this._head) {
            return false;
        }

        if (this._currentOpt == this._head._nextOrPrevious_chunks) {
            this._currentOpt = this._head;
            return true;
        }

        this._currentOpt = this._next;
        this._next = this._next._nextOrPrevious_chunks;
        return true;
    }

    public Reset() {
        this._currentOpt = undefined;
        this._next = this._head.FirstChunk_chunks;
    }

    public ToArray(): Array<BlobBuilder> {
        this.Reset();

        const result: BlobBuilder[] = [];
        while (this.MoveNext()) {
            assert(this.Current);
            result.push(this.Current);
        }
        return result;
    }

    // void IDisposable.Dispose() { }

    // // IEnumerable:
    // public Chunks GetEnumerator() => this;
    // IEnumerator<BlobBuilder> IEnumerable<BlobBuilder>.GetEnumerator() => GetEnumerator();
    // IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

export class Blobs {
    private _chunks: Chunks;

    public constructor(builder: BlobBuilder) {
        this._chunks = new Chunks(builder);
    }

    // object IEnumerator.Current => Current;

    public get Current(): Blob | undefined {
        const current = this._chunks.Current;
        if (current != null) {
            return new Blob(current._buffer_chunks, 0, current._length_chunks);
        }
        else {
            return undefined;
        }
    }

    public MoveNext() {
        return this._chunks.MoveNext();
    }
    public Reset() {
        this._chunks.Reset();
    }

    public ToArray(): Array<Blob> {
        this.Reset();

        const result: Blob[] = [];
        while (this.MoveNext()) {
            result.push(this.Current!);
        }
        return result;
    }

    // void IDisposable.Dispose() { }

    // // IEnumerable:
    // public Blobs GetEnumerator() => this;
    // IEnumerator<Blob> IEnumerable<Blob>.GetEnumerator() => GetEnumerator();
    // IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
