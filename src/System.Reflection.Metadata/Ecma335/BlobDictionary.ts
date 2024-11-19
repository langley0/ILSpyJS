import assert from "assert";
import {
    Hash,
    SequenceEqual,
    IsDefault,
} from 'System.Collections';
import { BlobHandle } from '../TypeSystem/Handles.TypeSystem';

export class BlobDictionary {
    private readonly _dictionary: Map<number, [ArrayLike<number>, BlobHandle]>

    // A simple LCG. Constants taken from
    // https://github.com/imneme/pcg-c/blob/83252d9c23df9c82ecb42210afed61a7b42402d7/include/pcg_variants.h#L276-L284
    private GetNextDictionaryKey(dictionaryKey: number): number {
        return dictionaryKey * 747796405 + 2891336453;
    }

    // #if NET
    //     private unsafe ref KeyValuePair<ImmutableArray<byte>, BlobHandle> GetValueRefOrAddDefault(ReadOnlySpan<byte> key, out bool exists)
    //     {
    //         int dictionaryKey = Hash.GetFNVHashCode(key);
    //         while (true)
    //         {
    //             ref var entry = ref CollectionsMarshal.GetValueRefOrAddDefault(_dictionary, dictionaryKey, out exists);
    //             if (!exists || entry.Key.AsSpan().SequenceEqual(key))
    //             {
    // #pragma warning disable CS9082 // Local is returned by reference but was initialized to a value that cannot be returned by reference
    //                 // In .NET 6 the assembly of GetValueRefOrAddDefault was compiled with earlier ref safety rules
    //                 // and caused an error, which was turned into a warning because of unsafe and was suppressed.
    //                 return ref entry;
    // #pragma warning restore CS9082
    //             }
    //             dictionaryKey = GetNextDictionaryKey(dictionaryKey);
    //         }
    //     }

    //     public BlobHandle GetOrAdd(ReadOnlySpan<byte> key, ImmutableArray<byte> immutableKey, BlobHandle value, out bool exists)
    //     {
    //         ref var entry = ref GetValueRefOrAddDefault(key, out exists);
    //         if (exists)
    //         {
    //             return entry.Value;
    //         }

    //         // If we are given an immutable array, do not allocate a new one.
    //         if (immutableKey.IsDefault)
    //         {
    //             immutableKey = key.ToImmutableArray();
    //         }
    //         else
    //         {
    //             Debug.Assert(immutableKey.AsSpan().SequenceEqual(key));
    //         }

    //         entry = new(immutableKey, value);
    //         return value;
    //     }
    // #else
    public GetOrAdd(key: ArrayLike<number>, immutableKey: ArrayLike<number>, value: BlobHandle): BlobHandle | undefined {
        let dictionarykey = Hash.GetFNVHashCode(key);
        let entry: [ArrayLike<number>, BlobHandle] | undefined = undefined;
        while (true) {
            entry = this._dictionary.get(dictionarykey)
            if (entry == undefined || entry[0] == key) {
                break;
            }
            dictionarykey = this.GetNextDictionaryKey(dictionarykey);
        }

        if (entry) {
            return entry[1];
        }

        // If we are given an immutable array, do not allocate a new one.
        if (IsDefault(immutableKey)) {
            immutableKey = [...Array.from(key)];
        }
        else {
            assert(SequenceEqual(immutableKey, key));
        }

        this._dictionary.set(dictionarykey, [immutableKey, value]);
        return value;
    }
    // #endif

    public constructor(capacity: number = 0) {
        this._dictionary = new Map<number, [ArrayLike<number>, BlobHandle]>();
    }

    public get Count(): number {
        return this._dictionary.size;
    }

    // public Dictionary<int, KeyValuePair<ImmutableArray<byte>, BlobHandle>>.Enumerator GetEnumerator() =>
    //     _dictionary.GetEnumerator();
}