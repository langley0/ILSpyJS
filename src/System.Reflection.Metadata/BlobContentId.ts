import { Blob } from './Blob';
import * as uuid from 'uuid';

export class BlobContentId {
    // private const int Size = BlobUtilities.SizeOfGuid + sizeof(uint);

    public readonly Guid: Uint8Array;
    public readonly Stamp: number;

    // public Guid Guid => _guid;
    // public uint Stamp => _stamp;

    public constructor(guid: Uint8Array, stamp: number)
    {
        this.Guid = guid;
        this.Stamp = stamp;
    }

    // public BlobContentId(ImmutableArray<byte> id)
    // {
    //     if (id.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(id));
    //     }

    //     Initialize(id.AsSpan(), out _guid, out _stamp);
    // }

    // public BlobContentId(byte[] id)
    // {
    //     if (id is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(id));
    //     }

    //     Initialize(id, out _guid, out _stamp);
    // }

    // private static unsafe void Initialize(ReadOnlySpan<byte> id, out Guid guid, out uint stamp)
    // {
    //     if (id.Length != Size)
    //     {
    //         throw new ArgumentException(SR.Format(SR.UnexpectedArrayLength, Size), nameof(id));
    //     }

    //     fixed (byte* ptr = &id[0])
    //     {
    //         var reader = new BlobReader(ptr, id.Length);
    //         guid = reader.ReadGuid();
    //         stamp = reader.ReadUInt32();
    //     }
    // }

    // public bool IsDefault => Guid == default(Guid) && Stamp == 0;

    // public static BlobContentId FromHash(ImmutableArray<byte> hashCode)
    // {
    //     if (hashCode.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(hashCode));
    //     }

    //     return FromHash(hashCode.AsSpan());
    // }

    // public static BlobContentId FromHash(byte[] hashCode)
    // {
    //     if (hashCode is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(hashCode));
    //     }

    //     return FromHash(hashCode.AsSpan());
    // }

    // private static BlobContentId FromHash(ReadOnlySpan<byte> hashCode)
    // {
    //     const int minHashSize = 20;

    //     if (hashCode.Length < minHashSize)
    //     {
    //         throw new ArgumentException(SR.Format(SR.HashTooShort, minHashSize), nameof(hashCode));
    //     }

    //     // extract guid components from input data
    //     uint a = ((uint)hashCode[3] << 24 | (uint)hashCode[2] << 16 | (uint)hashCode[1] << 8 | hashCode[0]);
    //     ushort b = (ushort)(hashCode[5] << 8 | hashCode[4]);
    //     ushort c = (ushort)(hashCode[7] << 8 | hashCode[6]);
    //     byte d = hashCode[8];
    //     byte e = hashCode[9];
    //     byte f = hashCode[10];
    //     byte g = hashCode[11];
    //     byte h = hashCode[12];
    //     byte i = hashCode[13];
    //     byte j = hashCode[14];
    //     byte k = hashCode[15];

    //     // modify the guid data so it decodes to the form of a "random" guid ala rfc4122
    //     c = (ushort)((c & 0x0fff) | (4 << 12));
    //     d = (byte)((d & 0x3f) | (2 << 6));
    //     Guid guid = new Guid(a, (short)b, (short)c, d, e, f, g, h, i, j, k);

    //     // compute a random-looking stamp from the remaining bits, but with the upper bit set
    //     uint stamp = 0x80000000u | ((uint)hashCode[19] << 24 | (uint)hashCode[18] << 16 | (uint)hashCode[17] << 8 | hashCode[16]);

    //     return new BlobContentId(guid, stamp);
    // }

    public static GetTimeBasedProvider(): (blobs: ArrayLike<Blob>) => BlobContentId
    {
        // In the PE File Header this is a "Time/Date Stamp" whose description is "Time and date
        // the file was created in seconds since January 1st 1970 00:00:00 or 0"
        // However, when we want to make it deterministic we fill it in (later) with bits from the hash of the full PE file.
        const timestamp = Date.now();
        
        return _ => new BlobContentId(uuid.parse(uuid.v4()), timestamp);
    }

    // public bool Equals(BlobContentId other) => Guid == other.Guid && Stamp == other.Stamp;
    // public override bool Equals([NotNullWhen(true)] object? obj) => obj is BlobContentId bcid && Equals(bcid);
    // public override int GetHashCode() => Hash.Combine(Stamp, Guid.GetHashCode());
    // public static bool operator ==(BlobContentId left, BlobContentId right) => left.Equals(right);
    // public static bool operator !=(BlobContentId left, BlobContentId right) => !left.Equals(right);
}