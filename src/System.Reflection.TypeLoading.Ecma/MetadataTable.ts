import assert from "assert";
import { EntityHandle } from "System.Reflection.Metadata";
import { GetTokenFromEntityHandle } from "./MetadataExtensions";
import { GetTokenRowNumber } from "System.Reflection.TypeLoading/General/Helpers";

export class MetadataTable<T extends object, C extends any> {
    private readonly _table: Array<T | undefined>;
    public readonly Count: number;

    public constructor(count: number) {
        this.Count = count;
        this._table = new Array<T | undefined>(count);
    }

    public GetOrAdd(handle: EntityHandle, context: C, factory: (h: EntityHandle, c: C) => T): T {
        assert(!handle.IsNil);
        assert(factory != undefined);

        const index = GetTokenRowNumber(GetTokenFromEntityHandle(handle)) - 1;
        const table = this._table;
        const result = table[index];
        if (result != undefined)
            return result;

        const newValue = factory(handle, context);
        table[index] = newValue;
        return newValue;
    }



    // /// <summary>
    // /// Return a read-only enumeration of the table (safe to hand back to app code.)
    // /// </summary>
    // public IEnumerable<T?> EnumerateValues(int skip = 0)
    // {
    //     for (int i = skip; i < _table.Length; i++)
    //     {
    //         yield return _table[i];
    //     }
    // }

    /// <summary>
    /// Return a newly allocated array containing the contents (safe to hand back to app code.)
    /// </summary>
    public ToArray(skip: number = 0): T[] {
        const newArray = new Array<T>(this.Count - skip);
        for (let i = skip; i < this.Count; i++) {
            newArray[i - skip] = this._table[i]!;
        }
        return newArray;
    }
}