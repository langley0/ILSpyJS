import assert from "assert";
import { AssemblyReferenceHandle, EntityHandle, HandleKind, ModuleReferenceHandle, TypeDefinitionHandle, TypeReferenceHandle, TypeSpecificationHandle } from "System.Reflection.Metadata";
import { EcmaModule, EcmaDefinitionType, ToRoAssemblyName, GetTokenFromTypeReferenceHandle } from "System.Reflection.TypeLoading.Ecma";
import { RoAssembly, RoDefinitionType, RoExceptionAssembly, TypeContext } from "System.Reflection.TypeLoading";
import { Throw } from "System/Throw";

const s_resolveTypeDef = (h: EntityHandle, m: EcmaModule) => new EcmaDefinitionType(TypeDefinitionHandle.FromEntityHandle(h), m);

export function ResolveTypeDefRefOrSpec(handle: EntityHandle, module: EcmaModule, typeContext: TypeContext): RoDefinitionType {
    assert(!handle.IsNil);
    assert(module != undefined);

    switch (handle.Kind) {
        case HandleKind.TypeDefinition: return ResolveTypeDef(TypeDefinitionHandle.FromEntityHandle(handle), module);
        case HandleKind.TypeReference: return ResolveTypeRef(TypeReferenceHandle.FromEntityHandle(handle), module);
        case HandleKind.TypeSpecification: return ResolveTypeSpec(TypeSpecificationHandle.FromEntityHandle(handle), module, typeContext);
        default:
            Throw.BadImageFormatException();
    }
}

export function ResolveTypeDef(handle: TypeDefinitionHandle, module: EcmaModule): EcmaDefinitionType {
    assert(!handle.IsNil);
    assert(module != undefined);

    return module.TypeDefTable.GetOrAdd(handle.ToEntityHandle(), module, s_resolveTypeDef);
}


const s_resolveTypeRef = (h: EntityHandle, m: EcmaModule) => ComputeTypeRefResolution(TypeReferenceHandle.FromEntityHandle(h), m);

export function ResolveTypeRef(handle: TypeReferenceHandle, module: EcmaModule): RoDefinitionType {
    assert(!handle.IsNil);
    assert(module != undefined);

    return module.TypeRefTable.GetOrAdd(handle.ToEntityHandle(), module, s_resolveTypeRef);
}

export function ComputeTypeRefResolution(handle: TypeReferenceHandle, module: EcmaModule): RoDefinitionType {
    const reader = module.Reader;
    const tr = reader.GetTypeReference(handle);
    const ns = tr.Namespace.GetBytes(reader);
    const name = tr.Name.GetBytes(reader);

    const scope = tr.ResolutionScope;
    if (scope.IsNil) {
        // Special case for non-prime Modules - the type is somewhere in the Assembly. Technically, we're supposed
        // to walk the manifest module's ExportedType table for non-forwarder entries that have a matching name and
        // namespace (Ecma-355 11.22.38).
        //
        // Pragmatically speaking, searching the entire assembly should get us the same result and avoids writing a significant
        // code path that will get almost no test coverage as this is an obscure case not produced by mainstream tools..
        const type = module.GetEcmaAssembly().GetTypeCore(ns, name, false);
        if (type == undefined)
            throw new Error("Type not found");
        return type;
    }

    const scopeKind = scope.Kind;
    switch (scopeKind) {
        case HandleKind.AssemblyReference:
            {
                const arh = AssemblyReferenceHandle.FromEntityHandle(scope);
                const assembly: RoAssembly = ResolveAssembly(arh, module);
                const type: RoDefinitionType | undefined = assembly.GetTypeCore(ns, name, false);
                if (type == undefined)
                    throw new Error("Type not found");
                return type;
            }

        case HandleKind.TypeReference:
            {
                const outerType = ResolveTypeRef(TypeReferenceHandle.FromEntityHandle(scope), module);
                const nestedType = outerType.GetNestedTypeCore(name);
                if (nestedType == undefined) {
                    throw new Error(`TypeNotFound, ${outerType.ToString()} [], ${outerType.Assembly.FullName}`);
                }
                return nestedType;
            }

        case HandleKind.ModuleDefinition:
            {
                const type = module.GetTypeCore(ns, name, false);
                if (type == undefined)
                    throw new Error("Type not found");
                return type;
            }

        case HandleKind.ModuleReference:
            {
                const moduleName = module.Reader.GetModuleReference(ModuleReferenceHandle.FromEntityHandle(scope)).Name.GetString(module.Reader);
                const targetModule = module.GetRoAssembly().GetRoModuleByName(moduleName);
                if (targetModule == undefined)
                    Throw.BadImageFormatException(`BadImageFormat_TypeRefModuleNotInManifest, ${module.Assembly.FullName}, ${GetTokenFromTypeReferenceHandle(handle)}`);

                const type = targetModule.GetTypeCore(ns, name, false);
                if (type == undefined)
                    throw new Error("Type not found");

                return type;
            }

        default:
            Throw.BadImageFormatException(`SR.BadImageFormat_TypeRefBadScopeType ${module.Assembly.FullName}, ${GetTokenFromTypeReferenceHandle(handle)}`);
    }
}

export function ResolveTypeSpec(handle: TypeSpecificationHandle, module: EcmaModule, typeContext: TypeContext): RoDefinitionType {
    assert(!handle.IsNil);
    assert(module != undefined);

    // return module.Reader.GetTypeSpecification(handle).DecodeSignature(module, typeContext);
    throw new Error("Not implemented");
}

// public static EcmaGenericParameterType ResolveGenericParameter(this GenericParameterHandle handle, EcmaModule module)
// {
//     assert(!handle.IsNil);
//     assert(module != undefined);

//     return module.GenericParamTable.GetOrAdd(handle, module, s_resolveGenericParam);
// }

// private static readonly Func<EntityHandle, EcmaModule, EcmaGenericParameterType> s_resolveGenericParam =
//     (EntityHandle h, EcmaModule module) =>
//     {
//         MetadataReader reader = module.Reader;
//         GenericParameterHandle gph = (GenericParameterHandle)h;
//         GenericParameter gp = gph.GetGenericParameter(reader);
//         return gp.Parent.Kind switch
//         {
//             HandleKind.TypeDefinition => new EcmaGenericTypeParameterType(gph, module),
//             HandleKind.MethodDefinition => new EcmaGenericMethodParameterType(gph, module),
//             _ => throw new BadImageFormatException(), // Not a legal token type to be found in a GenericParameter.Parent record.
//         };
//     };

export function ResolveAssembly(handle: AssemblyReferenceHandle, module: EcmaModule): RoAssembly {
    const assembly = TryResolveAssembly(handle, module);
    if (assembly == undefined)
        throw new Error("Assembly not found");
    return assembly;
}

export function TryResolveAssembly(handle: AssemblyReferenceHandle, module: EcmaModule): RoAssembly | undefined {
    const assembly = ResolveToAssemblyOrExceptionAssembly(handle, module);
    const exceptionAssembly = assembly as RoExceptionAssembly;
    if (exceptionAssembly !== undefined) {
        return undefined;
    }
    return assembly;
}

export function ResolveToAssemblyOrExceptionAssembly(handle: AssemblyReferenceHandle, module: EcmaModule): RoAssembly {
    return module.AssemblyRefTable.GetOrAdd(handle.ToEntityHandle(), module, s_resolveAssembly);
}

const s_resolveAssembly = (h: EntityHandle, m: EcmaModule): RoAssembly => {
    const roAssemblyName = ToRoAssemblyName(AssemblyReferenceHandle.FromEntityHandle(h), m.Reader);
    return m.Loader.ResolveToAssemblyOrExceptionAssembly(roAssemblyName);
};

// public static T ResolveMethod<T>(this MethodDefinitionHandle handle, EcmaModule module, in TypeContext typeContext) where T : MethodBase
// {
//     MetadataReader reader = module.Reader;
//     MethodDefinition methodDefinition = handle.GetMethodDefinition(reader);
//     RoInstantiationProviderType declaringType = methodDefinition.GetDeclaringType().ResolveAndSpecializeType(module, typeContext);
//     EcmaMethodDecoder decoder = new EcmaMethodDecoder(handle, module);
//     if (methodDefinition.IsConstructor(reader))
//         return (T)(object)(new RoDefinitionConstructor<EcmaMethodDecoder>(declaringType, decoder));
//     else
//         return (T)(object)(new RoDefinitionMethod<EcmaMethodDecoder>(declaringType, declaringType, decoder));
// }

// private static RoInstantiationProviderType ResolveAndSpecializeType(this TypeDefinitionHandle handle, EcmaModule module, in TypeContext typeContext)
// {
//     RoDefinitionType declaringType = handle.ResolveTypeDef(module);
//     if (typeContext.GenericTypeArguments != undefined && declaringType.IsGenericTypeDefinition)
//         return declaringType.GetUniqueConstructedGenericType(typeContext.GenericTypeArguments);
//     return declaringType;
// }
