import assert from "assert";
import { MetadataReader } from "../MetadataReader";
import { TypeAttributes, } from "System.Reflection"
import { CustomAttributeHandleCollection, EntityHandle, StringHandle, TypeDefinitionHandle } from "System.Reflection.Metadata";
import { TokenTypeIds, TypeDefTreatment } from "System.Reflection.Metadata.Ecma335";

export class TypeDefinition {
    private readonly _reader: MetadataReader;

    // Workaround: JIT doesn't generate good code for nested structures, so use RowId.
    private readonly _treatmentAndRowId: number;

    public constructor(reader: MetadataReader, treatmentAndRowId: number) {
        assert(reader != undefined);
        assert(treatmentAndRowId != 0);

        this._reader = reader;
        this._treatmentAndRowId = treatmentAndRowId;
    }

    private get RowId(): number {
        return this._treatmentAndRowId & TokenTypeIds.RIDMask;
    }

    private get Treatment(): TypeDefTreatment {
        return this._treatmentAndRowId >> TokenTypeIds.RowIdBitCount;
    }

    private get Handle(): TypeDefinitionHandle {
        return TypeDefinitionHandle.FromRowId(this.RowId);
    }

    public get Attributes(): TypeAttributes {

        if (this.Treatment == 0) {
            return this._reader.TypeDefTable.GetFlags(this.Handle);
        }
        return this.GetProjectedFlags();
    }

    /// <summary>
    /// Indicates whether this is a nested type.
    /// </summary>
    public get IsNested(): boolean { return TypeAttributes.IsNested(this.Attributes) }

    /// <summary>
    /// Name of the type.
    /// </summary>
    public get Name(): StringHandle {
        if (this.Treatment == 0) {
            return this._reader.TypeDefTable.GetName(this.Handle);
        }

        return this.GetProjectedName();

    }

    /// <summary>
    /// Full name of the namespace where the type is defined, or nil if the type is nested or defined in a root namespace.
    /// </summary>
    public get Namespace(): StringHandle {

        if (this.Treatment == 0) {
            return this._reader.TypeDefTable.GetNamespace(this.Handle);
        }

        return this.GetProjectedNamespaceString();

    }

    // /// <summary>
    // /// The definition handle of the namespace where the type is defined, or nil if the type is nested or defined in a root namespace.
    // /// </summary>
    // public NamespaceDefinitionHandle NamespaceDefinition
    // {
    //     get
    //     {
    //         if (Treatment == 0)
    //         {
    //             return _reader.TypeDefTable.GetNamespaceDefinition(Handle);
    //         }

    //         return GetProjectedNamespace();
    //     }
    // }

    /// <summary>
    /// The base type of the type definition: either
    /// <see cref="TypeSpecificationHandle"/>, <see cref="TypeReferenceHandle"/> or <see cref="TypeDefinitionHandle"/>.
    /// </summary>
    public get BaseType(): EntityHandle {
        if (this.Treatment == 0) {
            return this._reader.TypeDefTable.GetExtends(this.Handle);
        }

        return this.GetProjectedBaseType();
    }

    // public TypeLayout GetLayout()
    // {
    //     int classLayoutRowId = _reader.ClassLayoutTable.FindRow(Handle);
    //     if (classLayoutRowId == 0)
    //     {
    //         // NOTE: We don't need a bool/TryGetLayout because zero also means use default:
    //         //
    //         // Spec:
    //         //  ClassSize of zero does not mean the class has zero size. It means that no .size directive was specified
    //         //  at definition time, in which case, the actual size is calculated from the field types, taking account of
    //         //  packing size (default or specified) and natural alignment on the target, runtime platform.
    //         //
    //         // PackingSize shall be one of {0, 1, 2, 4, 8, 16, 32, 64, 128}. (0 means use
    //         // the default pack size for the platform on which the application is
    //         // running.)

    //         return default(TypeLayout);
    //     }

    //     uint size = _reader.ClassLayoutTable.GetClassSize(classLayoutRowId);

    //     // The spec doesn't limit the size to 31bit. It only limits the size to 1MB if Parent is a value type.
    //     // It however doesn't make much sense to define classes with >2GB size. So in order to keep the API
    //     // clean of unsigned ints we impose the limit.
    //     if (unchecked((int)size) != size)
    //     {
    //         throw new BadImageFormatException(SR.InvalidTypeSize);
    //     }

    //     int packingSize = _reader.ClassLayoutTable.GetPackingSize(classLayoutRowId);
    //     return new TypeLayout((int)size, packingSize);
    // }

    /// <summary>
    /// Returns the enclosing type of a specified nested type or nil handle if the type is not nested.
    /// </summary>
    public GetDeclaringType(): TypeDefinitionHandle {
        return this._reader.NestedClassTable.FindEnclosingType(this.Handle);
    }

    // public GenericParameterHandleCollection GetGenericParameters()
    // {
    //     return _reader.GenericParamTable.FindGenericParametersForType(Handle);
    // }

    // public MethodDefinitionHandleCollection GetMethods()
    // {
    //     return new MethodDefinitionHandleCollection(_reader, Handle);
    // }

    // public FieldDefinitionHandleCollection GetFields()
    // {
    //     return new FieldDefinitionHandleCollection(_reader, Handle);
    // }

    // public PropertyDefinitionHandleCollection GetProperties()
    // {
    //     return new PropertyDefinitionHandleCollection(_reader, Handle);
    // }

    // public EventDefinitionHandleCollection GetEvents()
    // {
    //     return new EventDefinitionHandleCollection(_reader, Handle);
    // }

    // /// <summary>
    // /// Returns an array of types nested in the specified type.
    // /// </summary>
    // public ImmutableArray<TypeDefinitionHandle> GetNestedTypes()
    // {
    //     return _reader.GetNestedTypes(Handle);
    // }

    // public MethodImplementationHandleCollection GetMethodImplementations()
    // {
    //     return new MethodImplementationHandleCollection(_reader, Handle);
    // }

    // public InterfaceImplementationHandleCollection GetInterfaceImplementations()
    // {
    //     return new InterfaceImplementationHandleCollection(_reader, Handle);
    // }

    public GetCustomAttributes(): CustomAttributeHandleCollection {
        return new CustomAttributeHandleCollection(this._reader, this.Handle.ToEntityHandle());
    }

    // public DeclarativeSecurityAttributeHandleCollection GetDeclarativeSecurityAttributes()
    // {
    //     return new DeclarativeSecurityAttributeHandleCollection(_reader, Handle);
    // }

    // #region Projections

    private GetProjectedFlags(): TypeAttributes {
        let flags = this._reader.TypeDefTable.GetFlags(this.Handle);
        const treatment = this.Treatment;

        switch (treatment & TypeDefTreatment.KindMask) {
            case TypeDefTreatment.NormalNonAttribute:
                flags |= TypeAttributes.WindowsRuntime | TypeAttributes.Import;
                break;

            case TypeDefTreatment.NormalAttribute:
                flags |= TypeAttributes.WindowsRuntime | TypeAttributes.Sealed;
                break;

            case TypeDefTreatment.UnmangleWinRTName:
                flags = flags & ~TypeAttributes.SpecialName | TypeAttributes.Public;
                break;

            case TypeDefTreatment.PrefixWinRTName:
                flags = flags & ~TypeAttributes.Public | TypeAttributes.Import;
                break;

            case TypeDefTreatment.RedirectedToClrType:
                flags = flags & ~TypeAttributes.Public | TypeAttributes.Import;
                break;

            case TypeDefTreatment.RedirectedToClrAttribute:
                flags &= ~TypeAttributes.Public;
                break;
        }

        if ((treatment & TypeDefTreatment.MarkAbstractFlag) != 0) {
            flags |= TypeAttributes.Abstract;
        }

        if ((treatment & TypeDefTreatment.MarkInternalFlag) != 0) {
            flags &= ~TypeAttributes.Public;
        }

        return flags;
    }

    private GetProjectedName(): StringHandle {
        const name = this._reader.TypeDefTable.GetName(this.Handle);

        switch (this.Treatment & TypeDefTreatment.KindMask) {
            case TypeDefTreatment.UnmangleWinRTName: return name.SuffixRaw(MetadataReader.ClrPrefix.length);
            case TypeDefTreatment.PrefixWinRTName: return name.WithWinRTPrefix();
            default: return name;
        }
    }

    // private NamespaceDefinitionHandle GetProjectedNamespace()
    // {
    //     // NOTE: NamespaceDefinitionHandle currently relies on never having virtual values. If this ever gets projected
    //     //       to a virtual namespace name, then that assumption will need to be removed.

    //     // no change:
    //     return _reader.TypeDefTable.GetNamespaceDefinition(Handle);
    // }

    private GetProjectedNamespaceString(): StringHandle {
        // no change:
        return this._reader.TypeDefTable.GetNamespace(this.Handle);
    }

    private GetProjectedBaseType(): EntityHandle {
        // no change:
        return this._reader.TypeDefTable.GetExtends(this.Handle);
    }

    // #endregion
}