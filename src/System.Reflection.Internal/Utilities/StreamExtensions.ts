import { Throw } from "System";
import { Stream } from "System.IO";
export class StreamExtensions {
    //         // From System.IO.Stream.CopyTo:
    //         // We pick a value that is the largest multiple of 4096 that is still smaller than the large object heap threshold (85K).
    //         // The CopyTo/CopyToAsync buffer is short-lived and is likely to be collected at Gen0, and it offers a significant
    //         // improvement in Copy performance.
    //         public const number StreamCopyBufferSize = 81920;

    //         /// <summary>
    //         /// Copies specified amount of data from given stream to a target memory pointer.
    //         /// </summary>
    //         /// <exception cref="IOException">unexpected stream end.</exception>
    //         public static unsafe void CopyTo(this Stream source, byte* destination, number size)
    //         {
    //             byte[] buffer = new byte[Math.Min(StreamCopyBufferSize, size)];
    //             while (size > 0)
    //             {
    //                 number readSize = Math.Min(size, buffer.Length);
    //                 number bytesRead = source.Read(buffer, 0, readSize);

    //                 if (bytesRead <= 0 || bytesRead > readSize)
    //                 {
    //                     throw new IOException(SR.UnexpectedStreamEnd);
    //                 }

    //                 Marshal.Copy(buffer, 0, (IntPtr)destination, bytesRead);

    //                 destination += bytesRead;
    //                 size -= bytesRead;
    //             }
    //         }

    //         /// <summary>
    //         /// Attempts to read all of the requested bytes from the stream into the buffer
    //         /// </summary>
    //         /// <returns>
    //         /// The number of bytes read. Less than <paramref name="count" /> will
    //         /// only be returned if the end of stream is reached before all bytes can be read.
    //         /// </returns>
    //         /// <remarks>
    //         /// Unlike <see cref="Stream.Read(byte[], number, number)"/> it is not guaranteed that
    //         /// the stream position or the output buffer will be unchanged if an exception is
    //         /// returned.
    //         /// </remarks>
    //         public static number TryReadAll(this Stream stream, byte[] buffer, number offset, number count)
    //         {
    //             // The implementations for many streams, e.g. FileStream, allows 0 bytes to be
    //             // read and returns 0, but the documentation for Stream.Read states that 0 is
    //             // only returned when the end of the stream has been reached. Rather than deal
    //             // with this contradiction, let's just never pass a count of 0 bytes
    //             assert(count > 0);

    //             number totalBytesRead;
    //             number bytesRead;
    //             for (totalBytesRead = 0; totalBytesRead < count; totalBytesRead += bytesRead)
    //             {
    //                 // Note: Don't attempt to save state in-between calls to .Read as it would
    //                 // require a possibly massive intermediate buffer array
    //                 bytesRead = stream.Read(buffer,
    //                                         offset + totalBytesRead,
    //                                         count - totalBytesRead);
    //                 if (bytesRead == 0)
    //                 {
    //                     break;
    //                 }
    //             }
    //             return totalBytesRead;
    //         }

    // #if NET
    //         public static number TryReadAll(this Stream stream, Span<byte> buffer)
    // #if NET
    //             => stream.ReadAtLeast(buffer, buffer.Length, throwOnEndOfStream: false);
    // #else
    //         {
    //             number totalBytesRead = 0;
    //             while (totalBytesRead < buffer.Length)
    //             {
    //                 number bytesRead = stream.Read(buffer.Slice(totalBytesRead));
    //                 if (bytesRead == 0)
    //                 {
    //                     break;
    //                 }

    //                 totalBytesRead += bytesRead;
    //             }

    //             return totalBytesRead;
    //         }
    // #endif
    // #endif

    /// <summary>
    /// Resolve image size as either the given user-specified size or distance from current position to end-of-stream.
    /// Also performs the relevant argument validation and publicly visible caller has same argument names.
    /// </summary>
    /// <exception cref="ArgumentException">size is 0 and distance from current position to end-of-stream can't fit in Int32.</exception>
    /// <exception cref="ArgumentOutOfRangeException">Size is negative or extends past the end-of-stream from current position.</exception>
    public static GetAndValidateSize(stream: Stream, size: number, streamParameterName: string): number {
        const maxSize = stream.Length - stream.Position;

        if (size < 0 || size > maxSize) {
            Throw.ArgumentOutOfRange('size');
        }

        if (size != 0) {
            return size;
        }

        if (maxSize > Number.MAX_VALUE) {
            Throw.ArgumentException('StreamTooLarge', streamParameterName);
        }

        return maxSize;
    }
}