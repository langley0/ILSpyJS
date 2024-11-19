import assert from "assert";
import { Throw } from "System";
import { SeekOrigin } from "./SeekOrigin";

export abstract class Stream {
    public abstract get Length(): number;
    public abstract get Position(): number;
    public abstract Read(buffer: Uint8Array, offset: number, count: number): number;

    public abstract get CanRead(): boolean;
    public abstract get CanWrite(): boolean;
    public abstract get CanSeek(): boolean;

    public abstract Seek(offset: number, origin: SeekOrigin): number;

    public ReadByte(): number {
        var oneByteArray = new Uint8Array(1);
        let r = this.Read(oneByteArray, 0, 1);
        return r == 0 ? -1 : oneByteArray[0];
    }

    public ReadBytes(buffer: Uint8Array): number {
        const numRead = this.Read(buffer, 0, buffer.length);
        if (numRead > buffer.length) {
            throw new Error("Stream implementation returned more bytes than the buffer could hold.");
        }
        return numRead;
    }

    /// <summary>
    /// Reads at least a minimum number of bytes from the current stream and advances the position within the stream by the number of bytes read.
    /// </summary>
    /// <param name="buffer">A region of memory. When this method returns, the contents of this region are replaced by the bytes read from the current stream.</param>
    /// <param name="minimumBytes">The minimum number of bytes to read into the buffer.</param>
    /// <param name="throwOnEndOfStream">
    /// <see langword="true"/> to throw an exception if the end of the stream is reached before reading <paramref name="minimumBytes"/> of bytes;
    /// <see langword="false"/> to return less than <paramref name="minimumBytes"/> when the end of the stream is reached.
    /// The default is <see langword="true"/>.
    /// </param>
    /// <returns>
    /// The total number of bytes read into the buffer. This is guaranteed to be greater than or equal to <paramref name="minimumBytes"/>
    /// when <paramref name="throwOnEndOfStream"/> is <see langword="true"/>. This will be less than <paramref name="minimumBytes"/> when the
    /// end of the stream is reached and <paramref name="throwOnEndOfStream"/> is <see langword="false"/>. This can be less than the number
    /// of bytes allocated in the buffer if that many bytes are not currently available.
    /// </returns>
    /// <exception cref="ArgumentOutOfRangeException">
    /// <paramref name="minimumBytes"/> is negative, or is greater than the length of <paramref name="buffer"/>.
    /// </exception>
    /// <exception cref="EndOfStreamException">
    /// <paramref name="throwOnEndOfStream"/> is <see langword="true"/> and the end of the stream is reached before reading
    /// <paramref name="minimumBytes"/> bytes of data.
    /// </exception>
    /// <remarks>
    /// When <paramref name="minimumBytes"/> is 0 (zero), this read operation will be completed without waiting for available data in the stream.
    /// </remarks>
    public ReadAtLeast(buffer: Uint8Array, minimumBytes: number, throwOnEndOfStream: boolean = true): number {
        assert(minimumBytes <= buffer.length);

        let totalRead = 0;
        while (totalRead < minimumBytes) {
            let read = this.ReadBytes(buffer);
            if (read == 0) {
                if (throwOnEndOfStream) {
                    Throw.ThrowEndOfFileException();
                }

                return totalRead;
            }
            totalRead += read;
        }
        return totalRead;
    }


    protected static ValidateBufferArguments(buffer: Uint8Array, offset: number, count: number) {
        Throw.ThrowIfNull(buffer, "buffer");
        Throw.ThrowIfNegative(offset, "offset");
        Throw.ThrowIfFalse(count <= buffer.length - offset, "count > buffer.Length - offset");
    }
}