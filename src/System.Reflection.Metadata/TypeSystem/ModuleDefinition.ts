import assert from "assert";
import { MetadataReader } from "../MetadataReader";

export class ModuleDefinition {
    private readonly _reader: MetadataReader;

    public constructor(reader: MetadataReader) {
        assert(reader != undefined);
        this._reader = reader;
    }

    // public int Generation
    // {
    //     get
    //     {
    //         return _reader.ModuleTable.GetGeneration();
    //     }
    // }

    // public StringHandle Name
    // {
    //     get
    //     {
    //         return _reader.ModuleTable.GetName();
    //     }
    // }

    // public GuidHandle Mvid
    // {
    //     get
    //     {
    //         return _reader.ModuleTable.GetMvid();
    //     }
    // }

    // public GuidHandle GenerationId
    // {
    //     get
    //     {
    //         return _reader.ModuleTable.GetEncId();
    //     }
    // }

    // public GuidHandle BaseGenerationId
    // {
    //     get
    //     {
    //         return _reader.ModuleTable.GetEncBaseId();
    //     }
    // }

    // public CustomAttributeHandleCollection GetCustomAttributes()
    // {
    //     return new CustomAttributeHandleCollection(_reader, EntityHandle.ModuleDefinition);
    // }
}