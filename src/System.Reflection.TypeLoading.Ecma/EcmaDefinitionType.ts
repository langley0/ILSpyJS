import assert from "assert";
import {
    MetadataReader,
    TypeDefinitionHandle,
    TypeDefinition,
} from "System.Reflection.Metadata";
import {
    EscapeTypeNameIdentifier,
    RoDefinitionType,
    RoModule,
    RoType,
    ToTypeContext,
} from "System.Reflection.TypeLoading";
import { EcmaModule, GetTokenFromTypeDefinitionHandle, ResolveTypeDef, ResolveTypeDefRefOrSpec } from "System.Reflection.TypeLoading.Ecma";
import { CustomAttributeData } from "System.Reflection/CustomAttributeData";
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

        return ResolveTypeDef(this.TypeDefinition.GetDeclaringType(), this.GetEcmaModule());
    }

    protected override  ComputeName(): string {
        return EscapeTypeNameIdentifier(this.TypeDefinition.Name.GetString(this.Reader));
    }

    protected override ComputeNamespace(): string | undefined {
        const declaringType = this.DeclaringType;
        if (declaringType != undefined)
            return declaringType.Namespace;
        const h = this.TypeDefinition.Namespace.GetStringOrNull(this.Reader);
        if (h == undefined)
            return undefined;

        return EscapeTypeNameIdentifier(h);
    }

    protected override  ComputeAttributeFlags(): TypeAttributes { return this.TypeDefinition.Attributes; }

    public override SpecializeBaseType(instantiation: RoType[]): RoType | undefined {
        const baseTypeHandle = this.TypeDefinition.BaseType;
        if (baseTypeHandle.IsNil)
            return undefined;
        return ResolveTypeDefRefOrSpec(baseTypeHandle, this.GetEcmaModule(), ToTypeContext(instantiation));
    }

    // public  override  SpecializeInterfaces(instantiation: RoType[] ): Array<RoType>
    // {
    //     const reader = this.Reader;
    //     const module = this.GetEcmaModule();
    //     const typeContext = ToTypeContext(instantiation);
    //     for (const h of TypeDefinition.GetInterfaceImplementations())
    //     {
    //         const ifc = h.GetInterfaceImplementation(reader);
    //         yield return ifc.Interface.ResolveTypeDefRefOrSpec(module, typeContext);
    //     }
    // }

    protected  override GetTrueCustomAttributes(): Array<CustomAttributeData> { 
        //return this.TypeDefinition.GetCustomAttributes().ToTrueCustomAttributes(GetEcmaModule());
        throw new Error("Not implemented");
     }

    public  override  IsCustomAttributeDefined(ns: Uint8Array,  name: Uint8Array): boolean {
        //return this.TypeDefinition.GetCustomAttributes().IsCustomAttributeDefined(ns, name, GetEcmaModule());
        throw new Error("Not implemented");
    }
    public  override  TryFindCustomAttribute( ns: Uint8Array,  name: Uint8Array): CustomAttributeData| undefined {
        //return  this.TypeDefinition.GetCustomAttributes().TryFindCustomAttribute(ns, name, GetEcmaModule());
        throw new Error("Not implemented");
    }

    public override get MetadataToken(): number { return GetTokenFromTypeDefinitionHandle(this._handle); }


    public override get IsGenericTypeDefinition(): boolean { return this.GetGenericParameterCount() != 0; }

    public override  GetGenericParameterCount(): number { return this.GetGenericTypeParametersNoCopy().length; }
    public override  GetGenericTypeParametersNoCopy(): RoType[] {
        this._lazyGenericParameters ??= this.ComputeGenericTypeParameters();
        return this._lazyGenericParameters;
    }
    private ComputeGenericTypeParameters(): RoType[] {
        // const module = this.GetEcmaModule();
        // const gps = this.TypeDefinition.GetGenericParameters();
        // if (gps.Count == 0)
        //     return [];

        // const genericParameters = new Array<RoType>(gps.Count);
        // for (const h in gps) {
        //     const gp = h.ResolveGenericParameter(module);
        //     genericParameters[gp.GenericParameterPosition] = gp;
        // }
        // return genericParameters;
        throw new Error("Not implemented");
    }
    private _lazyGenericParameters: RoType[] | undefined;

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

    public override  IsTypeNameEqual(ns: Uint8Array, name: Uint8Array): boolean {
        const reader = this.Reader;
        const td = this.TypeDefinition;
        return td.Name.GetString(reader) == Buffer.from(name).toString() && td.Namespace.GetString(reader) == Buffer.from(ns).toString();
    }

    // private new MetadataLoadContext Loader => _module.Loader;
    private get Reader(): MetadataReader { return this.GetEcmaModule().Reader; }

    private get TypeDefinition(): TypeDefinition { return this._neverAccessThisExceptThroughTypeDefinitionProperty; }
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)]  // Block from debugger watch windows so they don't AV the debugged process.
    private readonly _neverAccessThisExceptThroughTypeDefinitionProperty: TypeDefinition;

     //=======================================================================================================
    // BindingFlags-related helpers
    // internal sealed override IEnumerable<ConstructorInfo> SpecializeConstructors(NameFilter? filter, RoInstantiationProviderType declaringType)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (MethodDefinitionHandle handle in TypeDefinition.GetMethods())
    //     {
    //         MethodDefinition methodDefinition = handle.GetMethodDefinition(reader);
    //         if (filter == null || filter.Matches(methodDefinition.Name, reader))
    //         {
    //             if (methodDefinition.IsConstructor(reader))
    //                 yield return new RoDefinitionConstructor<EcmaMethodDecoder>(declaringType, new EcmaMethodDecoder(handle, GetEcmaModule()));
    //         }
    //     }
    // }

    // internal sealed override IEnumerable<MethodInfo> SpecializeMethods(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (MethodDefinitionHandle handle in TypeDefinition.GetMethods())
    //     {
    //         MethodDefinition methodDefinition = handle.GetMethodDefinition(reader);
    //         if (filter == null || filter.Matches(methodDefinition.Name, reader))
    //         {
    //             if (!methodDefinition.IsConstructor(reader))
    //                 yield return new RoDefinitionMethod<EcmaMethodDecoder>(declaringType, reflectedType, new EcmaMethodDecoder(handle, GetEcmaModule()));
    //         }
    //     }
    // }

    // internal sealed override IEnumerable<EventInfo> SpecializeEvents(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (EventDefinitionHandle handle in TypeDefinition.GetEvents())
    //     {
    //         if (filter == null || filter.Matches(handle.GetEventDefinition(reader).Name, reader))
    //             yield return new EcmaEvent(declaringType, handle, reflectedType);
    //     }
    // }

    // internal sealed override IEnumerable<FieldInfo> SpecializeFields(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (FieldDefinitionHandle handle in TypeDefinition.GetFields())
    //     {
    //         if (filter == null || filter.Matches(handle.GetFieldDefinition(reader).Name, reader))
    //             yield return new EcmaField(declaringType, handle, reflectedType);
    //     }
    // }

    // internal sealed override IEnumerable<PropertyInfo> SpecializeProperties(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (PropertyDefinitionHandle handle in TypeDefinition.GetProperties())
    //     {
    //         if (filter == null || filter.Matches(handle.GetPropertyDefinition(reader).Name, reader))
    //             yield return new EcmaProperty(declaringType, handle, reflectedType);
    //     }
    // }

    // internal sealed override IEnumerable<RoType> GetNestedTypesCore(NameFilter? filter)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (TypeDefinitionHandle handle in TypeDefinition.GetNestedTypes())
    //     {
    //         TypeDefinition nestedTypeDefinition = handle.GetTypeDefinition(reader);
    //         if (filter == null || filter.Matches(nestedTypeDefinition.Name, reader))
    //             yield return handle.ResolveTypeDef(GetEcmaModule());
    //     }
    // }

    public override  GetNestedTypeCore(utf8Name: Uint8Array): RoDefinitionType | undefined {
        // let match: RoDefinitionType |undefined = undefined;
        // const reader = this.Reader;
        // for (const handle of TypeDefinition.GetNestedTypes())
        // {
        //     TypeDefinition nestedTypeDefinition = handle.GetTypeDefinition(reader);
        //     if (nestedTypeDefinition.Name.Equals(utf8Name, reader))
        //     {
        //         if (match != null)
        //             throw ThrowHelper.GetAmbiguousMatchException(match);
        //         match = handle.ResolveTypeDef(GetEcmaModule());
        //     }
        // }
        // return match;
        throw new Error("Not implemented");
    }
}