import assert from "assert";
import { EntityHandle, TypeDefinitionHandle } from "System.Reflection.Metadata";
import { EcmaModule, EcmaDefinitionType } from "System.Reflection.TypeLoading.Ecma";

const s_resolveTypeDef: (handle: EntityHandle, module: EcmaModule) => EcmaDefinitionType =
    (h, m) => new EcmaDefinitionType(TypeDefinitionHandle.FromEntityHandle(h), m);

// public static RoType ResolveTypeDefRefOrSpec(this EntityHandle handle, EcmaModule module, in TypeContext typeContext)
// {
//     assert(!handle.IsNil);
//     assert(module != undefined);
//     return handle.Kind switch
//     {
//         HandleKind.TypeDefinition => ((TypeDefinitionHandle)handle).ResolveTypeDef(module),
//         HandleKind.TypeReference => ((TypeReferenceHandle)handle).ResolveTypeRef(module),
//         HandleKind.TypeSpecification => ((TypeSpecificationHandle)handle).ResolveTypeSpec(module, typeContext),
//         _ => throw new BadImageFormatException(),
//     };
// }

export function ResolveTypeDef(handle: TypeDefinitionHandle, module: EcmaModule): EcmaDefinitionType {
    assert(!handle.IsNil);
    assert(module != undefined);

    // return module.TypeDefTable.GetOrAdd(handle, module, s_resolveTypeDef);
    throw new Error("not implemented");
}



// public static RoDefinitionType ResolveTypeRef(this TypeReferenceHandle handle, EcmaModule module)
// {
//     assert(!handle.IsNil);
//     assert(module != undefined);

//     return module.TypeRefTable.GetOrAdd(handle, module, s_resolveTypeRef);
// }

// private static readonly Func<EntityHandle, EcmaModule, RoDefinitionType> s_resolveTypeRef =
//     (h, m) => ComputeTypeRefResolution((TypeReferenceHandle)h, m);

// private static RoDefinitionType ComputeTypeRefResolution(TypeReferenceHandle handle, EcmaModule module)
// {
//     MetadataReader reader = module.Reader;
//     TypeReference tr = handle.GetTypeReference(reader);
//     ReadOnlySpan<byte> ns = tr.Namespace.AsReadOnlySpan(reader);
//     ReadOnlySpan<byte> name = tr.Name.AsReadOnlySpan(reader);

//     EntityHandle scope = tr.ResolutionScope;
//     if (scope.IsNil)
//     {
//         // Special case for non-prime Modules - the type is somewhere in the Assembly. Technically, we're supposed
//         // to walk the manifest module's ExportedType table for non-forwarder entries that have a matching name and
//         // namespace (Ecma-355 11.22.38).
//         //
//         // Pragmatically speaking, searching the entire assembly should get us the same result and avoids writing a significant
//         // code path that will get almost no test coverage as this is an obscure case not produced by mainstream tools..
//         RoDefinitionType? type = module.GetEcmaAssembly().GetTypeCore(ns, name, ignoreCase: false, out Exception? e);
//         if (type == undefined)
//             throw e!;
//         return type;
//     }

//     HandleKind scopeKind = scope.Kind;
//     switch (scopeKind)
//     {
//         case HandleKind.AssemblyReference:
//             {
//                 AssemblyReferenceHandle arh = (AssemblyReferenceHandle)scope;
//                 RoAssembly assembly = arh.ResolveAssembly(module);
//                 RoDefinitionType? type = assembly.GetTypeCore(ns, name, ignoreCase: false, out Exception? e);
//                 if (type == undefined)
//                     throw e!;
//                 return type;
//             }

//         case HandleKind.TypeReference:
//             {
//                 RoDefinitionType outerType = ((TypeReferenceHandle)scope).ResolveTypeRef(module);
//                 RoDefinitionType? nestedType = outerType.GetNestedTypeCore(name);
//                 return nestedType ?? throw new TypeLoadException(SR.Format(SR.Format(SR.TypeNotFound, outerType.ToString() + "[]", outerType.Assembly.FullName)));
//             }

//         case HandleKind.ModuleDefinition:
//             {
//                 RoDefinitionType? type = module.GetTypeCore(ns, name, ignoreCase: false, out Exception? e);
//                 if (type == undefined)
//                     throw e!;
//                 return type;
//             }

//         case HandleKind.ModuleReference:
//             {
//                 string moduleName = ((ModuleReferenceHandle)scope).GetModuleReference(module.Reader).Name.GetString(module.Reader);
//                 RoModule? targetModule = module.GetRoAssembly().GetRoModule(moduleName);
//                 if (targetModule == undefined)
//                     throw new BadImageFormatException(SR.Format(SR.BadImageFormat_TypeRefModuleNotInManifest, module.Assembly.FullName, $"0x{handle.GetToken():x8}"));

//                 RoDefinitionType? type = targetModule.GetTypeCore(ns, name, ignoreCase: false, out Exception? e);
//                 if (type == undefined)
//                     throw e!;
//                 return type;
//             }

//         default:
//             throw new BadImageFormatException(SR.Format(SR.BadImageFormat_TypeRefBadScopeType, module.Assembly.FullName, $"0x{handle.GetToken():x8}"));
//     }
// }

// public static RoType ResolveTypeSpec(this TypeSpecificationHandle handle, EcmaModule module, in TypeContext typeContext)
// {
//     assert(!handle.IsNil);
//     assert(module != undefined);

//     return handle.GetTypeSpecification(module.Reader).DecodeSignature(module, typeContext);
// }

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

// public static RoAssembly ResolveAssembly(this AssemblyReferenceHandle handle, EcmaModule module)
// {
//     RoAssembly? assembly = handle.TryResolveAssembly(module, out Exception? e);
//     if (assembly == undefined)
//         throw e!;
//     return assembly;
// }

// public static RoAssembly? TryResolveAssembly(this AssemblyReferenceHandle handle, EcmaModule module, out Exception? e)
// {
//     e = undefined;
//     RoAssembly assembly = handle.ResolveToAssemblyOrExceptionAssembly(module);
//     if (assembly is RoExceptionAssembly exceptionAssembly)
//     {
//         e = exceptionAssembly.Exception;
//         return undefined;
//     }
//     return assembly;
// }

// public static RoAssembly ResolveToAssemblyOrExceptionAssembly(this AssemblyReferenceHandle handle, EcmaModule module)
// {
//     return module.AssemblyRefTable.GetOrAdd(handle, module, s_resolveAssembly);
// }

// private static readonly Func<EntityHandle, EcmaModule, RoAssembly> s_resolveAssembly =
//     (h, m) =>
//     {
//         RoAssemblyName roAssemblyName = ((AssemblyReferenceHandle)h).ToRoAssemblyName(m.Reader);
//         return m.Loader.ResolveToAssemblyOrExceptionAssembly(roAssemblyName);
//     };

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
