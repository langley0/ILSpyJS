export class Hash {
    // public static int Combine(int newKey, int currentKey)
    // {
    //     return unchecked((currentKey * 0xA5555529) + newKey);
    // }

    // public static int Combine(uint newKey, int currentKey)
    // {
    //     return unchecked((currentKey * 0xA5555529) + newKey);
    // }

    // public static int Combine(bool newKeyPart, int currentKey)
    // {
    //     return Combine(currentKey, newKeyPart ? 1 : 0);
    // }

    /// <summary>
    /// The offset bias value used in the FNV-1a algorithm
    /// See http://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
    /// </summary>
    public static readonly FnvOffsetBias = 2166136261;

    /// <summary>
    /// The generative factor used in the FNV-1a algorithm
    /// See http://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
    /// </summary>
    public static readonly FnvPrime = 16777619;

    /// <summary>
    /// Compute the FNV-1a hash of a sequence of bytes
    /// See http://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
    /// </summary>
    /// <param name="data">The sequence of bytes</param>
    /// <returns>The FNV-1a hash of <paramref name="data"/></returns>
    public static GetFNVHashCode(data: ArrayLike<number>): number {
        let hashCode = Hash.FnvOffsetBias;

        for (let i = 0; i < data.length; i++) {
            hashCode = (hashCode ^ data[i]) * Hash.FnvPrime;
        }

        return hashCode;
    }
}