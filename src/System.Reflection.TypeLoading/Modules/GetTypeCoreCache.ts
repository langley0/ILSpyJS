// using System.Diagnostics;
// using System.Diagnostics.CodeAnalysis;
// using System.Threading;
// namespace System.Reflection.TypeLoading

import { RoDefinitionType } from "System.Reflection.TypeLoading";


class Entry {
    public _value!: RoDefinitionType
    public _hashCode!: number;
    public _next!: number;
}

class Container {
    public constructor(owner: GetTypeCoreCache) {
        // Note: This could be done by calling Resize()'s logic but we cannot safely do that as this code path is reached
        // during class construction time and Resize() pulls in enough stuff that we get cyclic cctor warnings from the build.
        this._buckets = new Array<number>(Container._initialCapacity);
        for (let i = 0; i < Container._initialCapacity; i++)
            this._buckets[i] = -1;
        this._entries = new Array<Entry>(Container._initialCapacity);
        this._nextFreeEntry = 0;
        this._owner = owner;
    }

    public TryGetValue(ns: Uint8Array, name: Uint8Array, hashCode: number): RoDefinitionType | undefined {
        // Lock acquistion NOT required.

        const bucket = Container.ComputeBucket(hashCode, this._buckets.length);
        let i = this._buckets[bucket];
        while (i != -1) {
            if (hashCode == this._entries[i]._hashCode) {
                const actualValue = this._entries[i]._value;
                if (actualValue.IsTypeNameEqual(ns, name)) {
                    return actualValue;
                }
            }
            i = this._entries[i]._next;
        }

        return undefined;
    }

    public Add(hashCode: number, value: RoDefinitionType) {
        // int bucket = ComputeBucket(hashCode, _buckets.Length);
        // int newEntryIdx = _nextFreeEntry;
        // _entries[newEntryIdx]._value = value;
        // _entries[newEntryIdx]._hashCode = hashCode;
        // _entries[newEntryIdx]._next = _buckets[bucket];

        // _nextFreeEntry++;

        // // The line that atomically adds the new key/value pair. If the thread is killed before this line executes but after
        // // we've incremented _nextFreeEntry, this entry is harmlessly leaked until the next resize.
        // Volatile.Write(ref _buckets[bucket], newEntryIdx);

        // VerifyUnifierConsistency();
        throw new Error("not implemented");
    }

    public get HasCapacity(): boolean {
        return this._nextFreeEntry != this._entries.length;
    }

    public Resize() {
        //                 int newSize = HashHelpers.GetPrime(_buckets.Length * 2);
        // #if DEBUG
        //                 newSize = _buckets.Length + 3;
        // #endif
        //                 if (newSize <= _nextFreeEntry)
        //                     throw new OutOfMemoryException();

        //                 Entry[] newEntries = new Entry[newSize];
        //                 int[] newBuckets = new int[newSize];
        //                 for (int i = 0; i < newSize; i++)
        //                     newBuckets[i] = -1;

        //                 // Note that we walk the bucket chains rather than iterating over _entries. This is because we allow for the possibility
        //                 // of abandoned entries (with undefined contents) if a thread is killed between allocating an entry and linking it onto the
        //                 // bucket chain.
        //                 int newNextFreeEntry = 0;
        //                 for (int bucket = 0; bucket < _buckets.Length; bucket++)
        //                 {
        //                     for (int entry = _buckets[bucket]; entry != -1; entry = _entries[entry]._next)
        //                     {
        //                         newEntries[newNextFreeEntry]._value = _entries[entry]._value;
        //                         newEntries[newNextFreeEntry]._hashCode = _entries[entry]._hashCode;
        //                         int newBucket = ComputeBucket(newEntries[newNextFreeEntry]._hashCode, newSize);
        //                         newEntries[newNextFreeEntry]._next = newBuckets[newBucket];
        //                         newBuckets[newBucket] = newNextFreeEntry;
        //                         newNextFreeEntry++;
        //                     }
        //                 }

        //                 // The assertion is "<=" rather than "==" because we allow an entry to "leak" until the next resize if
        //                 // a thread died between the time between we allocated the entry and the time we link it into the bucket stack.
        //                 Debug.Assert(newNextFreeEntry <= _nextFreeEntry);

        //                 // The line that atomically installs the resize. If this thread is killed before this point,
        //                 // the table remains full and the next attempt to add will have to redo the resize.
        //                 _owner._container = new Container(_owner, newBuckets, newEntries, newNextFreeEntry);

        //                 _owner._container.VerifyUnifierConsistency();
        throw new Error("not implemented");
    }

    private static ComputeBucket(hashCode: number, numBuckets: number): number {
        const bucket = (hashCode & 0x7fffffff) % numBuckets;
        return bucket;
    }

    //             [Conditional("DEBUG")]
    //             public void VerifyUnifierConsistency()
    //             {
    //                 // There's a point at which this check becomes gluttonous, even by checked build standards...
    //                 if (_nextFreeEntry >= 5000 && (0 != (_nextFreeEntry % 100)))
    //                     return;

    //                 Debug.Assert(_nextFreeEntry >= 0 && _nextFreeEntry <= _entries.Length);
    //                 int numEntriesEncountered = 0;
    //                 for (int bucket = 0; bucket < _buckets.Length; bucket++)
    //                 {
    //                     int walk1 = _buckets[bucket];
    //                     int walk2 = _buckets[bucket];  // walk2 advances two elements at a time - if walk1 ever meets walk2, we've detected a cycle.
    //                     while (walk1 != -1)
    //                     {
    //                         numEntriesEncountered++;
    //                         Debug.Assert(walk1 >= 0 && walk1 < _nextFreeEntry);
    //                         Debug.Assert(walk2 >= -1 && walk2 < _nextFreeEntry);

    //                         int storedBucket = ComputeBucket(_entries[walk1]._hashCode, _buckets.Length);
    //                         Debug.Assert(storedBucket == bucket);
    //                         walk1 = _entries[walk1]._next;
    //                         if (walk2 != -1)
    //                             walk2 = _entries[walk2]._next;
    //                         if (walk2 != -1)
    //                             walk2 = _entries[walk2]._next;
    //                         if (walk1 == walk2 && walk2 != -1)
    //                             Debug.Fail("Bucket " + bucket + " has a cycle in its linked list.");
    //                     }
    //                 }
    //                 // The assertion is "<=" rather than "==" because we allow an entry to "leak" until the next resize if
    //                 // a thread died between the time between we allocated the entry and the time we link it into the bucket stack.
    //                 Debug.Assert(numEntriesEncountered <= _nextFreeEntry);
    //             }

    private readonly _buckets: number[];
    private readonly _entries: Entry[];
    private _nextFreeEntry: number;

    private readonly _owner: GetTypeCoreCache;

    private static readonly _initialCapacity = 5;
}



export class GetTypeCoreCache {
    private _container: Container;

    public constructor() {
        this._container = new Container(this);
    }

    public TryGet(ns: Uint8Array, name: Uint8Array, hashCode: number): RoDefinitionType | undefined {
        return this._container.TryGetValue(ns, name, hashCode);
    }

    public GetOrAdd(ns: Uint8Array, name: Uint8Array, hashCode: number, type: RoDefinitionType): RoDefinitionType {
        const prior = this._container.TryGetValue(ns, name, hashCode);
        if (prior != undefined) {
            return prior;
        }


        const winner = this._container.TryGetValue(ns, name, hashCode);
        if (winner != undefined) {
            return winner;
        }
        if (!this._container.HasCapacity) {
            this._container.Resize(); // This overwrites the _container field.
        }
        this._container.Add(hashCode, type);
        return type;


    }

    public static ComputeHashCode(name: Uint8Array): number {
        let hashCode = 0x38723781;
        for (let i = 0; i < name.length; i++) {
            hashCode = (hashCode << 8) ^ name[i];
        }
        return hashCode;
    }
}