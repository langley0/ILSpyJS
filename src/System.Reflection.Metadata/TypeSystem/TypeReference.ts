import assert from "assert";
import { TokenTypeIds, TypeRefTreatment } from "System.Reflection.Metadata.Ecma335";
import { MetadataReader } from "System.Reflection.Metadata/MetadataReader";
import { AssemblyReferenceHandle, StringHandle, TypeReferenceHandle } from "./Handles.TypeSystem";
import { EntityHandle } from "System.Reflection.Metadata/EntityHandle";
import { Assembly } from "System.Reflection";

export class TypeReference {
    private readonly _reader: MetadataReader;

    // Workaround: JIT doesn't generate good code for nested structures, so use RowId.
    private readonly _treatmentAndRowId: number;

    public constructor(reader: MetadataReader, treatmentAndRowId: number) {
        assert(reader != null);
        assert(treatmentAndRowId != 0);

        this._reader = reader;
        this._treatmentAndRowId = treatmentAndRowId;
    }

    private get RowId(): number {
        return (this._treatmentAndRowId & TokenTypeIds.RIDMask);
    }

    private get Treatment(): TypeRefTreatment {
        return (this._treatmentAndRowId >> TokenTypeIds.RowIdBitCount);
    }

    private get Handle(): TypeReferenceHandle {
        return TypeReferenceHandle.FromRowId(this.RowId);
    }

    /// <summary>
    /// Resolution scope in which the target type is defined and is uniquely identified by the specified <see cref="Namespace"/> and <see cref="Name"/>.
    /// </summary>
    /// <remarks>
    /// Resolution scope can be one of the following handles:
    /// <list type="bullet">
    /// <item><description><see cref="TypeReferenceHandle"/> of the enclosing type, if the target type is a nested type.</description></item>
    /// <item><description><see cref="ModuleReferenceHandle"/>, if the target type is defined in another module within the same assembly as this one.</description></item>
    /// <item><description><see cref="EntityHandle.ModuleDefinition"/>, if the target type is defined in the current module. This should not occur in a CLI compressed metadata module.</description></item>
    /// <item><description><see cref="AssemblyReferenceHandle"/>, if the target type is defined in a different assembly from the current module.</description></item>
    /// <item><description>Nil handle if the target type must be resolved by searching the <see cref="MetadataReader.ExportedTypes"/> for a matching <see cref="Namespace"/> and <see cref="Name"/>.</description></item>
    /// </list>
    /// </remarks>
    public get ResolutionScope(): EntityHandle {
        if (this.Treatment == 0) {
            return this._reader.TypeRefTable.GetResolutionScope(this.Handle);
        }

        return this.GetProjectedResolutionScope();
    }

    /// <summary>
    /// Name of the target type.
    /// </summary>
    public get Name(): StringHandle {
        if (this.Treatment == 0) {
            return this._reader.TypeRefTable.GetName(this.Handle);
        }

        return this.GetProjectedName();
    }

    /// <summary>
    /// Full name of the namespace where the target type is defined, or nil if the type is nested or defined in a root namespace.
    /// </summary>
    public get Namespace(): StringHandle {
        if (this.Treatment == 0) {
            return this._reader.TypeRefTable.GetNamespace(this.Handle);
        }

        return this.GetProjectedNamespace();
    }

    // #region Projections

    private GetProjectedResolutionScope(): EntityHandle {
        switch (this.Treatment) {
            case TypeRefTreatment.SystemAttribute:
            case TypeRefTreatment.SystemDelegate:
                return AssemblyReferenceHandle.FromVirtualIndex(AssemblyReferenceHandle.VirtualIndex.System_Runtime).ToEntityHandle();

            case TypeRefTreatment.UseProjectionInfo:
                return MetadataReader.GetProjectedAssemblyRef(this.RowId).ToEntityHandle();
        }

        throw new Error("Unknown TypeRef treatment");
    }

    private GetProjectedName(): StringHandle {
        if (this.Treatment == TypeRefTreatment.UseProjectionInfo) {
            return MetadataReader.GetProjectedName(this.RowId);
        }
        else {
            return this._reader.TypeRefTable.GetName(this.Handle);
        }
    }

    private GetProjectedNamespace(): StringHandle {
        switch (this.Treatment) {
            case TypeRefTreatment.SystemAttribute:
            case TypeRefTreatment.SystemDelegate:
                return StringHandle.FromVirtualIndex(StringHandle.VirtualIndex.System);

            case TypeRefTreatment.UseProjectionInfo:
                return MetadataReader.GetProjectedNamespace(this.RowId);
        }

        throw new Error("Unknown TypeRef treatment");
    }

    // public get SignatureTreatment(): TypeRefSignatureTreatment {
    //     if (this.Treatment == 0) {
    //         return TypeRefSignatureTreatment.None;
    //     }

    //     return this.GetProjectedSignatureTreatment();
    // }

    // private GetProjectedSignatureTreatment(): TypeRefSignatureTreatment {
    //     if (this.Treatment == TypeRefTreatment.UseProjectionInfo) {
    //         return MetadataReader.GetProjectedSignatureTreatment(this.RowId);
    //     }
    //     else {
    //         return TypeRefSignatureTreatment.None;
    //     }
    // }
    // #endregion
}