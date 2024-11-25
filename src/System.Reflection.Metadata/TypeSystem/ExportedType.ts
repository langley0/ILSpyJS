// namespace System.Reflection.Metadata
import assert from "assert";
import { MetadataReader, ExportedTypeHandle, StringHandle, NamespaceDefinitionHandle, EntityHandle, CustomAttributeHandleCollection, HandleKind } from "System.Reflection.Metadata";
import { TypeAttributes } from "System.Reflection/TypeAttributes";

export class ExportedType {
    public readonly reader: MetadataReader;

    // Workaround: JIT doesn't generate good code for nested structures, so use RowId.
    public readonly rowId: number;

    public constructor(reader: MetadataReader, rowId: number) {
        assert(reader != undefined);
        assert(rowId != 0);

        this.reader = reader;
        this.rowId = rowId;
    }

    private get Handle(): ExportedTypeHandle {
        return ExportedTypeHandle.FromRowId(this.rowId);
    }

    public get Attributes(): TypeAttributes {
        return this.reader.ExportedTypeTable.GetFlags(this.rowId);
    }

    public get IsForwarder(): boolean {
        return TypeAttributes.IsForwarder(this.Attributes) && this.Implementation.Kind == HandleKind.AssemblyReference;
    }

    /// <summary>
    /// Name of the target type, or nil if the type is nested or defined in a root namespace.
    /// </summary>
    public get Name(): StringHandle {
        return this.reader.ExportedTypeTable.GetTypeName(this.rowId);
    }

    /// <summary>
    /// Full name of the namespace where the target type, or nil if the type is nested or defined in a root namespace.
    /// </summary>
    public get Namespace(): StringHandle {
        return this.reader.ExportedTypeTable.GetTypeNamespaceString(this.rowId);
    }

    /// <summary>
    /// The definition handle of the namespace where the target type is defined, or nil if the type is nested or defined in a root namespace.
    /// </summary>
    public get NamespaceDefinition(): NamespaceDefinitionHandle {
        // NOTE: NamespaceDefinitionHandle currently relies on never having virtual values. If this ever gets projected
        //       to a virtual namespace name, then that assumption will need to be removed.
        return this.reader.ExportedTypeTable.GetTypeNamespace(this.rowId);
    }

    /// <summary>
    /// Handle to resolve the implementation of the target type.
    /// </summary>
    /// <returns>
    /// <list type="bullet">
    /// <item><description><see cref="AssemblyFileHandle"/> representing another module in the assembly.</description></item>
    /// <item><description><see cref="AssemblyReferenceHandle"/> representing another assembly if <see cref="IsForwarder"/> is true.</description></item>
    /// <item><description><see cref="ExportedTypeHandle"/> representing the declaring exported type in which this was is nested.</description></item>
    /// </list>
    /// </returns>
    public get Implementation(): EntityHandle {
        return this.reader.ExportedTypeTable.GetImplementation(this.rowId);
    }

    public GetCustomAttributes(): CustomAttributeHandleCollection {
        return new CustomAttributeHandleCollection(this.reader, this.Handle.ToEntityHandle());
    }
}