// namespace System.Reflection.Metadata

import assert from "assert";
import { Version } from "System";
import { AssemblyHashAlgorithm } from "System.Configuration.Assemblies";
import { AssemblyFlags } from "System.Reflection";
import {
    MetadataReader,
    StringHandle,
    BlobHandle,
    CustomAttributeHandleCollection,
    DeclarativeSecurityAttributeHandleCollection,
    AssemblyDefinitionHandle,
} from "System.Reflection.Metadata";
export class AssemblyDefinition {
    private readonly _reader: MetadataReader;

    public constructor(reader: MetadataReader) {
        assert(reader != undefined);
        this._reader = reader;
    }

    public get HashAlgorithm(): AssemblyHashAlgorithm {
        return this._reader.AssemblyTable.GetHashAlgorithm();
    }

    public get Version(): Version {
        return this._reader.AssemblyTable.GetVersion();
    }


    public get Flags(): AssemblyFlags {
        return this._reader.AssemblyTable.GetFlags();
    }

    public get Name(): StringHandle {
        return this._reader.AssemblyTable.GetName();
    }

    public get Culture(): StringHandle {
        return this._reader.AssemblyTable.GetCulture();
    }

    public get PublicKey(): BlobHandle {
        return this._reader.AssemblyTable.GetPublicKey();
    }
    // public AssemblyHashAlgorithm HashAlgorithm
    // {
    //     get
    //     {
    //         return _reader.AssemblyTable.GetHashAlgorithm();
    //     }
    // }

    // public Version Version
    // {
    //     get
    //     {
    //         return _reader.AssemblyTable.GetVersion();
    //     }
    // }

    // public AssemblyFlags Flags
    // {
    //     get
    //     {
    //         return _reader.AssemblyTable.GetFlags();
    //     }
    // }

    // public StringHandle Name
    // {
    //     get
    //     {
    //         return _reader.AssemblyTable.GetName();
    //     }
    // }

    // public StringHandle Culture
    // {
    //     get
    //     {
    //         return _reader.AssemblyTable.GetCulture();
    //     }
    // }

    // public BlobHandle PublicKey
    // {
    //     get
    //     {
    //         return _reader.AssemblyTable.GetPublicKey();
    //     }
    // }

    public GetCustomAttributes(): CustomAttributeHandleCollection {
        return new CustomAttributeHandleCollection(this._reader, AssemblyDefinition.ReservedEntityHandle);
    }

    public GetDeclarativeSecurityAttributes(): DeclarativeSecurityAttributeHandleCollection {
        return new DeclarativeSecurityAttributeHandleCollection(this._reader, AssemblyDefinition.ReservedEntityHandle);
    }

    static readonly ReservedEntityHandle =  new AssemblyDefinitionHandle(1).ToEntityHandle();
}