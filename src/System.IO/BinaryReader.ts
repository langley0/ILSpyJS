import { Throw } from 'System';
import { Encoding } from 'System.Text';
import { Stream } from './Stream';

export class BinaryReader {
    private _stream: Stream;
    private _encoding: Encoding;


    constructor(stream: Stream, encoding: Encoding) {
        this._stream = stream;
        this._encoding = encoding;
    }

    public get BaseStream(): Stream {
        return this._stream;
    }

    ReadByte(): number {
        return this._stream.ReadByte();
    }

    ReadBytes(count: number): number[] {
        Throw.ThrowIfNegative(count);

        if (count == 0) {
            return Array();
        }

        let result = new Array(count);
        const numRead = this._stream.ReadAtLeast(result, result.length, false);

        if (numRead != result.length) {
            // Trim array. This should happen on EOF & possibly net streams.
            result = result.slice(0, numRead);
        }

        return result;
    }

    ReadInt16(): number {
        const buf = Array<number>(2);
        this._stream.ReadBytes(buf);
        return Buffer.from(buf).readInt16LE(0);
    }

    ReadUInt16(): number {
        const buf = Array<number>(2);
        this._stream.ReadBytes(buf);
        return Buffer.from(buf).readUInt16LE(0);
    }

    ReadInt32(): number {
        const buf = Array<number>(4);
        this._stream.ReadBytes(buf);
        return Buffer.from(buf).readInt32LE(0);
    }

    ReadUInt32(): number {
        const buf = Array<number>(4);
        this._stream.ReadBytes(buf);
        return Buffer.from(buf).readUInt32LE(0);
    }

    ReadUInt64(): bigint {
        const buf = Array<number>(8);
        this._stream.ReadBytes(buf);
        return Buffer.from(buf).readBigUInt64BE(0);
    }
}
