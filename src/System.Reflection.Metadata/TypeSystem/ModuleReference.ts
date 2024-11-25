import assert from "assert";
import { MetadataReader } from "System.Reflection.Metadata/MetadataReader";
import { ModuleReferenceHandle, StringHandle } from "./Handles.TypeSystem";
import { CustomAttributeHandleCollection } from "./HandleCollections.TypeSystem";

export class ModuleReference {
    private readonly _reader: MetadataReader

    // Workaround: JIT doesn't generate good code for nested structures, so use RowId.
    private readonly _rowId: number;

    public constructor(reader: MetadataReader, handle: ModuleReferenceHandle) {
        assert(reader != null);
        assert(!handle.IsNil);

        this._reader = reader;
        this._rowId = handle.RowId;
    }

    private get Handle(): ModuleReferenceHandle {
        return ModuleReferenceHandle.FromRowId(this._rowId);
    }

    public get Name(): StringHandle {
        return this._reader.ModuleRefTable.GetName(this.Handle);
    }

    public GetCustomAttributes(): CustomAttributeHandleCollection {
        return new CustomAttributeHandleCollection(this._reader, this.Handle.ToEntityHandle());
    }
}