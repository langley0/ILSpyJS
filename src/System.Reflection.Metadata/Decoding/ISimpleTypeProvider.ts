import { MetadataReader } from "System.Reflection.Metadata/MetadataReader";
import { PrimitiveTypeCode } from "System.Reflection.Metadata/Signature/PrimitiveTypeCode";
import { TypeDefinitionHandle, TypeReferenceHandle } from "System.Reflection.Metadata/TypeSystem/Handles.TypeSystem";

export interface ISimpleTypeProvider<TType>
{
    /// <summary>
    /// Gets the type symbol for a primitive type.
    /// </summary>
     GetPrimitiveType( typeCode: PrimitiveTypeCode): TType;

    /// <summary>
    /// Gets the type symbol for a type definition.
    /// </summary>
    /// <param name="reader">
    /// The metadata reader that was passed to the signature decoder. It may be null.
    /// </param>
    /// <param name="handle">
    /// The type definition handle.
    /// </param>
    /// <param name="rawTypeKind">
    /// The kind of the type as specified in the signature. To interpret this value use <see cref="Ecma335.MetadataReaderExtensions.ResolveSignatureTypeKind(MetadataReader, EntityHandle, byte)"/>
    /// Note that when the signature comes from a WinMD file additional processing is needed to determine whether the target type is a value type or a reference type.
    /// </param>
     GetTypeFromDefinition( reader: MetadataReader,  handle: TypeDefinitionHandle,  rawTypeKind: number): TType;

    /// <summary>
    /// Gets the type symbol for a type reference.
    /// </summary>
    /// <param name="reader">
    /// The metadata reader that was passed to the signature decoder. It may be null.
    /// </param>
    /// <param name="handle">
    /// The type definition handle.
    /// </param>
    /// <param name="rawTypeKind">
    /// The kind of the type as specified in the signature. To interpret this value use <see cref="Ecma335.MetadataReaderExtensions.ResolveSignatureTypeKind(MetadataReader, EntityHandle, byte)"/>
    /// Note that when the signature comes from a WinMD file additional processing is needed to determine whether the target type is a value type or a reference type.
    /// </param>
     GetTypeFromReference( reader: MetadataReader,  handle: TypeReferenceHandle,  rawTypeKind: number): TType;
}