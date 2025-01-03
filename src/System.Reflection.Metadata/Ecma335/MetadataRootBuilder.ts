import { Throw } from "System";
import { BlobUtilities } from "System.Reflection.Internal";
import { MetadataTokens } from "./MetadataTokens";
import { MetadataBuilder } from "./MetadataBuilder";
import { SerializedMetadata } from "./SerializedMetadataHeaps";
import { MetadataSizes } from "./MetadataSizes";
import { BlobBuilder } from "../BlobBuilder";

export class MetadataRootBuilder {
    static readonly DefaultMetadataVersionString = "v4.0.30319";

    // // internal for testing
    static readonly EmptyRowCounts = new Array(MetadataTokens.TableCount).fill(0);

    private readonly _tablesAndHeaps: MetadataBuilder;
    private readonly _serializedMetadata: SerializedMetadata;

    /// <summary>
    /// Metadata version string.
    /// </summary>
    public readonly MetadataVersion: string;

    /// <summary>
    /// True to suppresses basic validation of metadata tables.
    /// The validation verifies that entries in the tables were added in order required by the ECMA specification.
    /// It does not enforce all specification requirements on metadata tables.
    /// </summary>
    public readonly SuppressValidation: boolean;

    /// <summary>
    /// Creates a builder of a metadata root.
    /// </summary>
    /// <param name="tablesAndHeaps">
    /// Builder populated with metadata entities stored in tables and values stored in heaps.
    /// The entities and values will be enumerated when serializing the metadata root.
    /// </param>
    /// <param name="metadataVersion">
    /// The version string written to the metadata header. The default value is "v4.0.30319".
    /// </param>
    /// <param name="suppressValidation">
    /// True to suppresses basic validation of metadata tables during serialization.
    /// The validation verifies that entries in the tables were added in order required by the ECMA specification.
    /// It does not enforce all specification requirements on metadata tables.
    /// </param>
    /// <exception cref="ArgumentNullException"><paramref name="tablesAndHeaps"/> is undefined.</exception>
    /// <exception cref="ArgumentException"><paramref name="metadataVersion"/> is too long (the number of bytes when UTF-8 encoded must be less than 255).</exception>
    public constructor(tablesAndHeaps: MetadataBuilder, metadataVersion: string | undefined = undefined, suppressValidation = false) {
        const metadataVersionByteCount = metadataVersion != undefined ? BlobUtilities.GetUTF8ByteCount(metadataVersion) : MetadataRootBuilder.DefaultMetadataVersionString.length;

        if (metadataVersionByteCount > MetadataSizes.MaxMetadataVersionByteCount) {
            Throw.InvalidArgument("MetadataVersionTooLong", "metadataVersion");
        }

        this._tablesAndHeaps = tablesAndHeaps;
        this.MetadataVersion = metadataVersion ?? MetadataRootBuilder.DefaultMetadataVersionString;
        this.SuppressValidation = suppressValidation;
        this._serializedMetadata = tablesAndHeaps.GetSerializedMetadata(MetadataRootBuilder.EmptyRowCounts, metadataVersionByteCount, false);
    }

    /// <summary>
    /// Returns sizes of various metadata structures.
    /// </summary>
    public get Sizes(): MetadataSizes {
        return this._serializedMetadata.Sizes;
    }

    /// <summary>
    /// Serializes metadata root content into the given <see cref="BlobBuilder"/>.
    /// </summary>
    /// <param name="builder">Builder to write to.</param>
    /// <param name="methodBodyStreamRva">
    /// The relative virtual address of the start of the method body stream.
    /// Used to calculate the final value of RVA fields of MethodDef table.
    /// </param>
    /// <param name="mappedFieldDataStreamRva">
    /// The relative virtual address of the start of the field init data stream.
    /// Used to calculate the final value of RVA fields of FieldRVA table.
    /// </param>
    /// <exception cref="ArgumentNullException"><paramref name="builder"/> is undefined.</exception>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="methodBodyStreamRva"/> or <paramref name="mappedFieldDataStreamRva"/> is negative.</exception>
    /// <exception cref="InvalidOperationException">
    /// A metadata table is not ordered as required by the specification and <see cref="SuppressValidation"/> is false.
    /// </exception>
    public Serialize(builder: BlobBuilder, methodBodyStreamRva: number, mappedFieldDataStreamRva: number) {
        if (methodBodyStreamRva < 0) {
            Throw.ArgumentOutOfRange('methodBodyStreamRva');
        }

        if (mappedFieldDataStreamRva < 0) {
            Throw.ArgumentOutOfRange('mappedFieldDataStreamRva');
        }

        if (!this.SuppressValidation) {
            this._tablesAndHeaps.ValidateOrder();
        }

        // header:
        MetadataBuilder.SerializeMetadataHeader(builder, this.MetadataVersion, this._serializedMetadata.Sizes);

        // #~ or #- stream:
        this._tablesAndHeaps.SerializeMetadataTables(builder, this._serializedMetadata.Sizes, this._serializedMetadata.StringMap, methodBodyStreamRva, mappedFieldDataStreamRva);

        // #Strings, #US, #Guid and #Blob streams:
        this._tablesAndHeaps.WriteHeapsTo(builder, this._serializedMetadata.StringHeap);
    }
}