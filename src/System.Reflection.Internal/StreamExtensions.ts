import { Stream } from 'System.IO';

export class StreamExtensions {
    static GetAndValidateSize(stream: Stream, size: number, streamParameterName: string): number {
        const maxSize = stream.Length - stream.Position;

        if (size < 0 || size > maxSize) {
            throw new Error(`size ${size}`);
        }

        if (size != 0) {
            return size;
        }

        if (maxSize > Number.MAX_SAFE_INTEGER) {
            throw new Error(`maxSize exceeds MAX_INTERGER : ${maxSize} of ${streamParameterName}`);
        }

        return maxSize;
    }
}