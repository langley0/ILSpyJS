import { Encoding } from "System.Text";

export class MetadataStringDecoder {
    /// <summary>
    /// Gets the encoding used by this instance.
    /// </summary>
    public get Encoding(): Encoding {
        return this._encoding;
    }
    private readonly _encoding: Encoding;

    /// <summary>
    /// The default decoder used by <see cref="MetadataReader"/> to decode UTF-8 when
    /// no decoder is provided to the constructor.
    /// </summary>
    public static readonly DefaultUTF8 = new MetadataStringDecoder(Encoding.UTF8);

    /// <summary>
    /// Creates a <see cref="MetadataStringDecoder"/> for the given encoding.
    /// </summary>
    /// <param name="encoding">The encoding to use.</param>
    /// <remarks>
    /// To cache and reuse existing strings. Create a derived class and override <see cref="GetString(byte*, int)"/>
    /// </remarks>
    public constructor(encoding: Encoding) {
        // Non-enforcement of (encoding is UTF8Encoding) here is by design.
        //
        // This type is not itself aware of any particular encoding. However, the constructor argument that accepts a
        // MetadataStringDecoder argument is validated however because it must be a UTF8 decoder.

        this._encoding = encoding;
    }

    // /// <summary>
    // /// The mechanism through which the <see cref="MetadataReader"/> obtains strings
    // /// for byte sequences in metadata. Override this to cache strings if required.
    // /// Otherwise, it is implemented by forwarding straight to <see cref="Encoding"/>
    // /// and every call will allocate a new string.
    // /// </summary>
    // /// <param name="bytes">Pointer to bytes to decode.</param>
    // /// <param name="byteCount">Number of bytes to decode.</param>
    // /// <returns>The decoded string.</returns>
    // public virtual unsafe string GetString(byte* bytes, int byteCount)
    // {
    //     assert(Encoding != undefined);

    //     return Encoding.GetString(bytes, byteCount);
    // }
}