import assert from "assert";
import { MetadataReader, TypeDefinitionHandle, TypeDefinition } from "System.Reflection.Metadata";
import { RoDefinitionType, RoModule, RoType } from "System.Reflection.TypeLoading";
import { EcmaModule } from "System.Reflection.TypeLoading.Ecma";
import { TypeAttributes } from "System.Reflection/TypeAttributes";

export class EcmaDefinitionType extends RoDefinitionType {
    private readonly _module: EcmaModule;
    private readonly _handle: TypeDefinitionHandle;

    public constructor(handle: TypeDefinitionHandle, module: EcmaModule) {
        super();
        assert(module != undefined);
        assert(!handle.IsNil);

        this._module = module;
        this._handle = handle;
        this._neverAccessThisExceptThroughTypeDefinitionProperty = this.Reader.GetTypeDefinition(handle);
    }

    public override  GetRoModule(): RoModule { return this._module; }
    public GetEcmaModule(): EcmaModule { return this._module; }

    protected override ComputeDeclaringType(): RoType | undefined {
        if (!this.TypeDefinition.IsNested)
            return undefined;

        return this.TypeDefinition.GetDeclaringType().ResolveTypeDef(this.GetEcmaModule());
    }

    protected override  ComputeName(): string {
        return this.TypeDefinition.Name.GetString(this.Reader).EscapeTypeNameIdentifier();
    }

    protected override ComputeNamespace(): string | undefined {
        const declaringType = this.DeclaringType;
        if (declaringType != undefined)
            return declaringType.Namespace;
        return this.TypeDefinition.Namespace.GetStringOrNull(this.Reader)?.EscapeTypeNameIdentifier();
    }

    protected override  ComputeAttributeFlags(): TypeAttributes { return this.TypeDefinition.Attributes; }

    public override SpecializeBaseType(instantiation: RoType[]): RoType | undefined {
        const baseTypeHandle = this.TypeDefinition.BaseType;
        if (baseTypeHandle.IsNil)
            return undefined;
        return baseTypeHandle.ResolveTypeDefRefOrSpec(this.GetEcmaModule(), instantiation.ToTypeContext());
    }

    // public  override IEnumerable<RoType> SpecializeInterfaces(RoType[] instantiation)
    // {
    //     MetadataReader reader = Reader;
    //     EcmaModule module = GetEcmaModule();
    //     TypeContext typeContext = instantiation.ToTypeContext();
    //     foreach (InterfaceImplementationHandle h in TypeDefinition.GetInterfaceImplementations())
    //     {
    //         InterfaceImplementation ifc = h.GetInterfaceImplementation(reader);
    //         yield return ifc.Interface.ResolveTypeDefRefOrSpec(module, typeContext);
    //     }
    // }

    // protected  override IEnumerable<CustomAttributeData> GetTrueCustomAttributes() => TypeDefinition.GetCustomAttributes().ToTrueCustomAttributes(GetEcmaModule());

    // public  override bool IsCustomAttributeDefined(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name) => TypeDefinition.GetCustomAttributes().IsCustomAttributeDefined(ns, name, GetEcmaModule());
    // public  override CustomAttributeData? TryFindCustomAttribute(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name) => TypeDefinition.GetCustomAttributes().TryFindCustomAttribute(ns, name, GetEcmaModule());

    public override get MetadataToken(): number { return this._handle.GetToken(); }

    // public  override bool IsGenericTypeDefinition => GetGenericParameterCount() != 0;

    // public  override int GetGenericParameterCount() => GetGenericTypeParametersNoCopy().Length;
    // public  override RoType[] GetGenericTypeParametersNoCopy() => _lazyGenericParameters ??= ComputeGenericTypeParameters();
    // private RoType[] ComputeGenericTypeParameters()
    // {
    //     EcmaModule module = GetEcmaModule();
    //     GenericParameterHandleCollection gps = TypeDefinition.GetGenericParameters();
    //     if (gps.Count == 0)
    //         return Array.Empty<RoType>();

    //     RoType[] genericParameters = new RoType[gps.Count];
    //     foreach (GenericParameterHandle h in gps)
    //     {
    //         RoType gp = h.ResolveGenericParameter(module);
    //         genericParameters[gp.GenericParameterPosition] = gp;
    //     }
    //     return genericParameters;
    // }
    // private volatile RoType[]? _lazyGenericParameters;

    // protected public  override RoType ComputeEnumUnderlyingType()
    // {
    //     //
    //     // This performs the functional equivalent of the base Type GetEnumUnderlyingType without going through all the BindingFlag lookup overhead.
    //     //

    //     if (!IsEnum)
    //         throw new ArgumentException(SR.Arg_MustBeEnum);

    //     MetadataReader reader = Reader;
    //     TypeContext typeContext = Instantiation.ToTypeContext();
    //     RoType? underlyingType = undefined;
    //     foreach (FieldDefinitionHandle handle in TypeDefinition.GetFields())
    //     {
    //         FieldDefinition fd = handle.GetFieldDefinition(reader);
    //         if ((fd.Attributes & FieldAttributes.Static) != 0)
    //             continue;
    //         if (underlyingType != undefined)
    //             throw new ArgumentException(SR.Argument_InvalidEnum);
    //         underlyingType = fd.DecodeSignature(GetEcmaModule(), typeContext);
    //     }

    //     if (underlyingType == undefined)
    //         throw new ArgumentException(SR.Argument_InvalidEnum);
    //     return underlyingType;
    // }

    // protected  override void GetPackSizeAndSize(out int packSize, out int size)
    // {
    //     TypeLayout layout = TypeDefinition.GetLayout();
    //     packSize = layout.PackingSize;
    //     size = layout.Size;
    // }

    // public  override bool IsTypeNameEqual(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name)
    // {
    //     MetadataReader reader = Reader;
    //     TypeDefinition td = TypeDefinition;
    //     return td.Name.Equals(name, reader) && td.Namespace.Equals(ns, reader);
    // }

    // private new MetadataLoadContext Loader => _module.Loader;
    private get Reader(): MetadataReader { return this.GetEcmaModule().Reader; }

    private readonly get TypeDefinition(): TypeDefinition { return this._neverAccessThisExceptThroughTypeDefinitionProperty; }
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)]  // Block from debugger watch windows so they don't AV the debugged process.
    private readonly _neverAccessThisExceptThroughTypeDefinitionProperty: TypeDefinition;
}