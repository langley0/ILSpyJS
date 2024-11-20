import { MethodDefinitionHandle } from "../TypeSystem/Handles.TypeSystem";

export class DebugMetadataHeader {
    public readonly Id: Uint8Array;
    public readonly EntryPoint: MethodDefinitionHandle;

    /// <summary>
    /// Gets the offset (in bytes) from the start of the metadata blob to the start of the <see cref="Id"/> blob.
    /// </summary>
    public readonly IdStartOffset: number;

    public constructor(id: Uint8Array, entryPoint: MethodDefinitionHandle, idStartOffset: number) {
        this.Id = id;
        this.EntryPoint = entryPoint;
        this.IdStartOffset = idStartOffset;
    }
}