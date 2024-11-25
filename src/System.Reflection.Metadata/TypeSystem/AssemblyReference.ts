import assert from "assert";
import { Version } from "System";
import { MetadataReader } from "../MetadataReader";
import { TokenTypeIds } from "System.Reflection.Metadata.Ecma335";
import { AssemblyFlags } from "System.Reflection/AssemblyFlags";
import { AssemblyReferenceHandle, BlobHandle, StringHandle } from "./Handles.TypeSystem";
import { CustomAttributeHandleCollection } from "./HandleCollections.TypeSystem";

export class AssemblyReference {
    private readonly _reader: MetadataReader;

    // Workaround: JIT doesn't generate good code for nested structures, so use raw uint.
    private readonly _treatmentAndRowId: number;

    private static readonly s_version_4_0_0_0 = new Version(4, 0, 0, 0);

    public constructor(reader: MetadataReader, treatmentAndRowId: number) {
        assert(reader != undefined);
        assert(treatmentAndRowId != 0);

        // only virtual bit can be set in highest byte:
        assert((treatmentAndRowId & ~(TokenTypeIds.VirtualBit | TokenTypeIds.RIDMask)) == 0);

        this._reader = reader;
        this._treatmentAndRowId = treatmentAndRowId;
    }

    private get RowId(): number {
        return (this._treatmentAndRowId & TokenTypeIds.RIDMask);
    }

    private get IsVirtual(): boolean {
        return (this._treatmentAndRowId & TokenTypeIds.VirtualBit) != 0;
    }

    public get Version(): Version {
        if (this.IsVirtual) {
            return AssemblyReference.GetVirtualVersion();
        }

        // change mscorlib version:
        if (this.RowId == this._reader.WinMDMscorlibRef) {
            return AssemblyReference.s_version_4_0_0_0;
        }

        return this._reader.AssemblyRefTable.GetVersion(this.RowId);
    }


    public get Flags(): AssemblyFlags {
        if (this.IsVirtual) {
            return this.GetVirtualFlags();
        }

        return this._reader.AssemblyRefTable.GetFlags(this.RowId);

    }

    public get Name(): StringHandle {
        if (this.IsVirtual) {
            return this.GetVirtualName();
        }

        return this._reader.AssemblyRefTable.GetName(this.RowId);

    }

    public get Culture(): StringHandle {
        if (this.IsVirtual) {
            return AssemblyReference.GetVirtualCulture();
        }

        return this._reader.AssemblyRefTable.GetCulture(this.RowId);
    }

    public get PublicKeyOrToken(): BlobHandle {
        if (this.IsVirtual) {
            return this.GetVirtualPublicKeyOrToken();
        }

        return this._reader.AssemblyRefTable.GetPublicKeyOrToken(this.RowId);
    }

    public get HashValue(): BlobHandle {
        if (this.IsVirtual) {
            return AssemblyReference.GetVirtualHashValue();
        }

        return this._reader.AssemblyRefTable.GetHashValue(this.RowId);

    }

    // public CustomAttributeHandleCollection GetCustomAttributes()
    // {
    //     if (IsVirtual)
    //     {
    //         return GetVirtualCustomAttributes();
    //     }

    //     return new CustomAttributeHandleCollection(_reader, AssemblyReferenceHandle.FromRowId(RowId));
    // }

    // #region Virtual Rows
    private static GetVirtualVersion(): Version {
        // currently all projected assembly references have version 4.0.0.0
        return AssemblyReference.s_version_4_0_0_0;
    }

    private GetVirtualFlags(): AssemblyFlags {
        // use flags from mscorlib ref (specifically PublicKey flag):
        return this._reader.AssemblyRefTable.GetFlags(this._reader.WinMDMscorlibRef);
    }

    private GetVirtualName(): StringHandle {
        return StringHandle.FromVirtualIndex(AssemblyReference.GetVirtualNameIndex(this.RowId));
    }

    private static GetVirtualNameIndex(index: AssemblyReferenceHandle.VirtualIndex): StringHandle.VirtualIndex {
        switch (index) {
            case AssemblyReferenceHandle.VirtualIndex.System_ObjectModel:
                return StringHandle.VirtualIndex.System_ObjectModel;

            case AssemblyReferenceHandle.VirtualIndex.System_Runtime:
                return StringHandle.VirtualIndex.System_Runtime;

            case AssemblyReferenceHandle.VirtualIndex.System_Runtime_InteropServices_WindowsRuntime:
                return StringHandle.VirtualIndex.System_Runtime_InteropServices_WindowsRuntime;

            case AssemblyReferenceHandle.VirtualIndex.System_Runtime_WindowsRuntime:
                return StringHandle.VirtualIndex.System_Runtime_WindowsRuntime;

            case AssemblyReferenceHandle.VirtualIndex.System_Runtime_WindowsRuntime_UI_Xaml:
                return StringHandle.VirtualIndex.System_Runtime_WindowsRuntime_UI_Xaml;

            case AssemblyReferenceHandle.VirtualIndex.System_Numerics_Vectors:
                return StringHandle.VirtualIndex.System_Numerics_Vectors;
        }

        throw new Error("Unexpected virtual index value");
    }

    private static GetVirtualCulture(): StringHandle {
        return StringHandle.Default;
    }

    private GetVirtualPublicKeyOrToken(): BlobHandle {
        switch (this.RowId) {
            case AssemblyReferenceHandle.VirtualIndex.System_Runtime_WindowsRuntime:
            case AssemblyReferenceHandle.VirtualIndex.System_Runtime_WindowsRuntime_UI_Xaml:
                // use key or token from mscorlib ref:
                return this._reader.AssemblyRefTable.GetPublicKeyOrToken(this._reader.WinMDMscorlibRef);

            default:
                // use contract assembly key or token:
                var hasFullKey = (this._reader.AssemblyRefTable.GetFlags(this._reader.WinMDMscorlibRef) & AssemblyFlags.PublicKey) != 0;
                return BlobHandle.FromVirtualIndex(hasFullKey ? BlobHandle.VirtualIndex.ContractPublicKey : BlobHandle.VirtualIndex.ContractPublicKeyToken, 0);
        }
    }

    private static GetVirtualHashValue(): BlobHandle {
        return BlobHandle.Default;
    }

    // private  GetVirtualCustomAttributes(): CustomAttributeHandleCollection
    // {
    //     // return custom attributes applied on mscorlib ref
    //     return new CustomAttributeHandleCollection(this._reader, AssemblyReferenceHandle.FromRowId(this._reader.WinMDMscorlibRef));
    // }
    // #endregion
}