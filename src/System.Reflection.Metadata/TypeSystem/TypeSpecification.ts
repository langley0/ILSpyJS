import assert from "assert";
import { BlobHandle, TypeSpecificationHandle } from "./Handles.TypeSystem";
import { MetadataReader } from "System.Reflection.Metadata/MetadataReader";
import { BlobReader } from "System.Reflection.Metadata/BlobReader";
import { CustomAttributeHandleCollection } from "./HandleCollections.TypeSystem";
import { ISignatureTypeProvider } from "System.Reflection.Metadata/Decoding/ISignatureTypeProvider";

export class TypeSpecification {
    private readonly _reader: MetadataReader;

    // Workaround: JIT doesn't generate good code for nested structures, so use RowId.
    private readonly _rowId: number;

    public constructor(reader: MetadataReader, handle: TypeSpecificationHandle) {
        assert(reader != null);
        assert(!handle.IsNil);

        this._reader = reader;
        this._rowId = handle.RowId;
    }

    private get Handle(): TypeSpecificationHandle {
        return TypeSpecificationHandle.FromRowId(this._rowId);
    }

    public get Signature(): BlobHandle {
        return this._reader.TypeSpecTable.GetSignature(this.Handle);
    }

    public DecodeSignature<TType, TGenericContext>(provider: ISignatureTypeProvider<TType, TGenericContext>, genericContext: TGenericContext): TType {
        // var decoder = new SignatureDecoder<TType, TGenericContext>(provider, _reader, genericContext);
        // var blobReader = _reader.GetBlobReader(Signature);
        // return decoder.DecodeType(ref blobReader);
        throw new Error("Not implemented");
    }

    public GetCustomAttributes(): CustomAttributeHandleCollection {
        return new CustomAttributeHandleCollection(this._reader, this.Handle.ToEntityHandle());
    }
}