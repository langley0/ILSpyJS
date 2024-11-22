import assert from "assert";
import { Throw } from 'System';
import { MemoryStream, Stream } from 'System.IO';
import {
    MetadataAssemblyResolver,
    AssemblyName,
} from "System.Reflection";
import {
    RoType,
    CoreType,
    CoreTypes,
    RoAssembly,
    RoAssemblyName,
    AssemblyNameData,
    ComputePublicKeyToken,
    ToRoAssemblyName,
} from 'System.Reflection.TypeLoading';
import {
    EcmaAssembly,
} from 'System.Reflection.TypeLoading.Ecma';
import { PEReader } from 'System.Reflection.PortableExecutable';

/// <summary>
/// A MetadataLoadContext represents a closed universe of Type objects loaded for inspection-only purposes.
/// Each MetadataLoadContext can have its own binding rules and is isolated from all other MetadataLoadContexts.
///
/// A MetadataLoadContext serves as a dictionary that binds assembly names to Assembly instances that were previously
/// loaded into the context or need to be loaded.
///
/// Assemblies are treated strictly as metadata. There are no restrictions on loading assemblies based
/// on target platform, CPU architecture or pointer size. There are no restrictions on the assembly designated
/// as the core assembly ("mscorlib").
/// </summary>
/// <remarks>
/// Also, as long as the metadata is "syntactically correct", the MetadataLoadContext strives to report it "as is" (as long it
/// can do so in a way that can be distinguished from valid data) and refrains from judging whether it's "executable."
/// This is both for performance reasons (checks cost time) and its intended role as metadata inspection tool.
/// Examples of things that MetadataLoadContexts let go unchecked include creating generic instances that violate generic
/// parameter constraints, and loading type hierarchies that would be unloadable in an actual runtime (deriving from sealed classes,
/// overriding members that don't exist in the ancestor classes, failing to implement all abstract methods, etc.)
///
/// You cannot invoke methods, set or get field or property values or instantiate objects using
/// the Type objects from a MetadataLoadContext. You can however, use FieldInfo.GetRawConstantValue(),
/// ParameterInfo.RawDefaultValue and PropertyInfo.GetRawConstantValue(). You can retrieve custom attributes
/// in CustomAttributeData format but not as instantiated custom attributes. The CustomAttributeExtensions
/// extension api will not work with these Types nor will the IsDefined() family of api.
///
/// There is no default binding policy. You must use a MetadataAssemblyResolver-derived class to load dependencies as needed.
/// The MetadataLoadContext strives to avoid loading dependencies unless needed.
/// Therefore, it is possible to do useful analysis of an assembly even
/// in the absence of dependencies. For example, retrieving an assembly's name and the names of its (direct)
/// dependencies can be done without having any of those dependencies on hand.
///
/// To bind assemblies, the MetadataLoadContext calls the Resolve method on the correspding MetadataAssemblyResolver.
/// That method should load the requested assembly and return it.
/// To do this, it can use LoadFromAssemblyPath() or one of its variants (LoadFromStream(), LoadFromByteArray()).
///
/// Once an assembly has been bound, no assembly with the same assembly name identity
/// can be bound again from a different location unless the Mvids are identical.
///
/// Once loaded, the underlying file may be locked for the duration of the MetadataLoadContext's lifetime. You can
/// release the locks by disposing the MetadataLoadContext object. The behavior of any Type, Assembly or other reflection
/// objects handed out by the MetadataLoadContext is undefined after disposal. Though objects provided by the MetadataLoadContext
/// strive to throw an ObjectDisposedException, this is not guaranteed. Some apis may return fixed or previously
/// cached data. Accessing objects *during* a Dispose may result in a unmanaged access violation and failfast.
///
/// Comparing Type, Member and Assembly objects:
///   The right way to compare two Reflection objects dispensed by the MetadataLoadContext are:
///       m1 == m2
///       m1.Equals(m2)
///   but not
///       object.ReferenceEquals(m1, m2)   /// WRONG
///       (object)m1 == (object)m2         /// WRONG
///
///   Note that the following descriptions are not literal descriptions of how Equals() is implemented. The MetadataLoadContext
///   reserves the right to implement Equals() as "object.ReferenceEquals()" and intern the associated objects in such
///   a way that Equals() works "as if" it were comparing those things.
///
/// - Each MetadataLoadContext permits only one Assembly instance per assembly identity so equality of assemblies is the same as the
///   equality of their assembly identity.
///
/// - Modules are compared by comparing their containing assemblies and their row indices in the assembly's manifest file table.
///
/// - Defined types are compared by comparing their containing modules and their row indices in the module's TypeDefinition table.
///
/// - Constructed types (arrays, byrefs, pointers, generic instances) are compared by comparing all of their component types.
///
/// - Generic parameter types are compared by comparing their containing Modules and their row indices in the module's GenericParameter table.
///
/// - Constructors, methods, fields, events and properties are compared by comparing their declaring types, their row indices in their respective
///   token tables and their ReflectedType property.
///
/// - Parameters are compared by comparing their declaring member and their position index.
///
/// Multithreading:
///   The MetadataLoadContext and the reflection objects it hands out are all multithread-safe and logically immutable,
///   except that no Loads or inspections of reflection objects can be done during or after disposing the owning MetadataLoadContext.
///
/// Support for NetCore Reflection apis:
///   .NETCore added a number of apis (IsSZArray, IsVariableBoundArray, IsTypeDefinition, IsGenericTypeParameter, IsGenericMethodParameter,
///      HasSameMetadataDefinitionAs, to name a few.) to the Reflection surface area.
///
///   The Reflection objects dispensed by MetadataLoadContexts support all the new apis *provided* that you are using the netcore build of System.Reflection.MetadataLoadContext.dll.
///
///   If you are using the netstandard build of System.Reflection.MetadataLoadContext.dll, the NetCore-specific apis are not supported. Attempting to invoke
///   them will generate a NotImplementedException or NullReferenceException (unfortunately, we can't improve the exceptions thrown because
///   they are being thrown by code this library doesn't control.)
/// </remarks>
export class MetadataLoadContext {
    /// <summary>
    /// Create a new MetadataLoadContext object.
    /// </summary>
    /// <param name="resolver">A <see cref="MetadataAssemblyResolver"/> instance.</param>
    /// <param name="coreAssemblyName">
    /// The name of the assembly that contains the core types such as System.Object. Typically, this would be "mscorlib".
    /// </param>
    public constructor(resolver: MetadataAssemblyResolver, coreAssemblyName?: string) {
        this.resolver = resolver;

        if (coreAssemblyName != undefined) {
            // Validate now that the value is a parsable assembly name.
            new AssemblyName(coreAssemblyName);
        }

        // Resolve the core assembly now
        this._coreTypes = new CoreTypes(this, coreAssemblyName);
    }

    //     /// <summary>
    //     /// Loads an assembly from a specific path on the disk and binds its assembly name to it in the MetadataLoadContext. If a prior
    //     /// assembly with the same name was already loaded into the MetadataLoadContext, the prior assembly will be returned. If the
    //     /// two assemblies do not have the same Mvid, this method throws a FileLoadException.
    //     /// </summary>
    //     public Assembly LoadFromAssemblyPath(string assemblyPath)
    //     {
    //         if (assemblyPath is undefined)
    //             throw new ArgumentNullException(nameof(assemblyPath));

    //         if (IsDisposed)
    //             throw new ObjectDisposedException(nameof(MetadataLoadContext));
    //         return LoadFromStreamCore(File.OpenRead(assemblyPath));
    //     }

    //     /// <summary>
    //     /// Loads an assembly from a byte array and binds its assembly name to it in the MetadataLoadContext. If a prior
    //     /// assembly with the same name was already loaded into the MetadataLoadContext, the prior assembly will be returned. If the
    //     /// two assemblies do not have the same Mvid, this method throws a FileLoadException.
    //     /// </summary>
    //     public Assembly LoadFromByteArray(byte[] assembly)
    //     {
    //         if (assembly is undefined)
    //             throw new ArgumentNullException(nameof(assembly));

    //         if (IsDisposed)
    //             throw new ObjectDisposedException(nameof(MetadataLoadContext));
    //         return LoadFromStreamCore(new MemoryStream(assembly));
    //     }

    //     /// <summary>
    //     /// Loads an assembly from a stream and binds its assembly name to it in the MetadataLoadContext. If a prior
    //     /// assembly with the same name was already loaded into the MetadataLoadContext, the prior assembly will be returned. If the
    //     /// two assemblies do not have the same Mvid, this method throws a FileLoadException.
    //     ///
    //     /// The MetadataLoadContext takes ownership of the Stream passed into this method. The original owner must not mutate its position, dispose the Stream or
    //     /// assume that its position will stay unchanged.
    //     /// </summary>
    //     public Assembly LoadFromStream(Stream assembly)
    //     {
    //         if (assembly is undefined)
    //             throw new ArgumentNullException(nameof(assembly));

    //         if (IsDisposed)
    //             throw new ObjectDisposedException(nameof(MetadataLoadContext));
    //         assembly.Position = 0;
    //         return LoadFromStreamCore(assembly);
    //     }

    //     /// <summary>
    //     /// Resolves the supplied assembly name to an assembly. If an assembly was previously bound by to this name, that assembly is returned.
    //     /// Otherwise, the MetadataLoadContext calls the specified MetadataAssemblyResolver. If the resolver returns undefined, this method throws a FileNotFoundException.
    //     ///
    //     /// Note that this behavior matches the behavior of AssemblyLoadContext.LoadFromAssemblyName() but does not match the behavior of
    //     /// Assembly.ReflectionOnlyLoad(). (the latter gives up without raising its resolve event.)
    //     /// </summary>
    //     public Assembly LoadFromAssemblyName(string assemblyName)
    //     {
    //         if (assemblyName is undefined)
    //             throw new ArgumentNullException(nameof(assemblyName));

    //         if (IsDisposed)
    //             throw new ObjectDisposedException(nameof(MetadataLoadContext));
    //         AssemblyName assemblyNameObject = new AssemblyName(assemblyName);
    //         RoAssemblyName refName = assemblyNameObject.ToRoAssemblyName();
    //         return ResolveAssembly(refName);
    //     }

    //     /// <summary>
    //     /// Resolves the supplied assembly name to an assembly. If an assembly was previously bound by to this name, that assembly is returned.
    //     /// Otherwise, the MetadataLoadContext calls the specified MetadataAssemblyResolver. If the resolver returns undefined, this method throws a FileNotFoundException.
    //     ///
    //     /// Note that this behavior matches the behavior of AssemblyLoadContext.LoadFromAssemblyName() resolve event but does not match the behavior of
    //     /// Assembly.ReflectionOnlyLoad(). (the latter gives up without raising its resolve event.)
    //     /// </summary>
    //     public Assembly LoadFromAssemblyName(AssemblyName assemblyName)
    //     {
    //         if (assemblyName is undefined)
    //             throw new ArgumentNullException(nameof(assemblyName));

    //         if (IsDisposed)
    //             throw new ObjectDisposedException(nameof(MetadataLoadContext));
    //         RoAssemblyName refName = assemblyName.ToRoAssemblyName();
    //         return ResolveAssembly(refName);
    //     }

    //     /// <summary>
    //     /// Returns the assembly that denotes the "system assembly" that houses the well-known types such as System.Int32.
    //     /// The core assembly is treated differently than other assemblies because references to these well-known types do
    //     /// not include the assembly reference, unlike normal types.
    //     ///
    //     /// Typically, this assembly is named "mscorlib", or "netstandard". If the core assembly cannot be found, the value will be
    //     /// undefined and many other reflection methods, including those that parse method signatures, will throw.
    //     ///
    //     /// The CoreAssembly is determined by passing the coreAssemblyName parameter passed to the MetadataAssemblyResolver constructor
    //     /// to the MetadataAssemblyResolver's Resolve method.
    //     /// If no coreAssemblyName argument was specified in the constructor of MetadataLoadContext, then default values are used
    //     /// including "mscorlib", "System.Runtime" and "netstandard".
    //     ///
    //     /// The designated core assembly does not need to contain the core types directly. It can type forward them to other assemblies.
    //     /// Thus, it is perfectly permissible to use the mscorlib facade as the designated core assembly.
    //     ///
    //     /// Note that "System.Runtime" is not an ideal core assembly as it excludes some of the interop-related pseudo-custom attribute types
    //     /// such as DllImportAttribute. However, it can serve if you have no interest in those attributes. The CustomAttributes api
    //     /// will skip those attributes if the core assembly does not include the necessary types.
    //     ///
    //     /// The CoreAssembly is not loaded until necessary. These APIs do not trigger the search for the core assembly:
    //     ///    MetadataLoadContext.LoadFromStream(), LoadFromAssemblyPath(), LoadFromByteArray()
    //     ///    Assembly.GetName(), Assembly.FullName, Assembly.GetReferencedAssemblies()
    //     ///    Assembly.GetTypes(), Assembly.DefinedTypes, Assembly.GetExportedTypes(), Assembly.GetForwardedTypes()
    //     ///    Assembly.GetType(string, bool, bool)
    //     ///    Type.Name, Type.FullName, Type.AssemblyQualifiedName
    //     ///
    //     /// If a core assembly cannot be found or if the core assembly is missing types, this will affect the behavior of the MetadataLoadContext as follows:
    //     ///
    //     /// - Apis that need to parse signatures or typespecs and return the results as Types will throw. For example,
    //     ///   MethodBase.ReturnType, MethodBase.GetParameters(), Type.BaseType, Type.GetInterfaces().
    //     ///
    //     /// - Apis that need to compare types to well known core types will not throw and the comparison will evaluate to "false."
    //     ///   For example, if you do not specify a core assembly, Type.IsPrimitive will return false for everything,
    //     ///   even types named "System.Int32". Similarly, Type.GetTypeCode() will return TypeCode.Object for everything.
    //     ///
    //     /// - If a metadata entity sets flags that surface as a pseudo-custom attribute, and the core assembly does not contain the pseudo-custom attribute
    //     ///   type, the necessary constructor or any of the parameter types of the constructor, the MetadataLoadContext will not throw. It will omit the pseudo-custom
    //     ///   attribute from the list of returned attributes.
    //     /// </summary>
    //     public Assembly? CoreAssembly
    //     {
    //         get
    //         {
    //             if (IsDisposed)
    //                 throw new ObjectDisposedException(nameof(MetadataLoadContext));

    //             return _coreAssembly;
    //         }
    //     }

    //     /// <summary>
    //     /// Return an atomic snapshot of the assemblies that have been loaded into the MetadataLoadContext.
    //     /// </summary>
    //     public IEnumerable<Assembly> GetAssemblies()
    //     {
    //         if (IsDisposed)
    //             throw new ObjectDisposedException(nameof(MetadataLoadContext));

    //         return _loadedAssemblies.Values;
    //     }

    //     /// <summary>
    //     /// Releases any native resources (such as file locks on assembly files.) After disposal, it is not safe to use
    //     /// any Assembly objects dispensed by the MetadataLoadContext, nor any Reflection objects dispensed by those Assembly objects.
    //     /// Though objects provided by the MetadataLoadContext strive to throw an ObjectDisposedException, this is not guaranteed.
    //     /// Some apis may return fixed or previously cached data. Accessing objects *during* a Dispose may result in an
    //     /// unmanaged access violation and failfast.
    //     /// </summary>
    //     public void Dispose()
    //     {
    //         Dispose(true);
    //         GC.SuppressFinalize(this);
    //     }

    private readonly resolver: MetadataAssemblyResolver;


    // This maintains the canonical list of Assembly instances for a given def name. Each defname can only appear
    // once in the list and its appearance prevents further assemblies with the same identity from loading unless the Mvids's match.
    // undefined entries do *not* appear here.
    private readonly _loadedAssemblies = new Map<RoAssemblyName, RoAssembly>();

    public static FromBuffer(buffer: Uint8Array): RoAssembly {
        // const stream = new MemoryStream(buffer);
        // const context = new MetadataLoadContext();
        // return context.LoadFromStreamCore(stream);
        throw new Error("Not implemented");
    }

    private LoadFromStreamCore(peStream: Stream): RoAssembly {
        const peReader = PEReader.FromStream(peStream);
        if (peReader.HasMetadata == false)
            Throw.BadImageFormatException('NoMetadataInPeImage');

        const location = ""; // location is not available for streams, because it should be a file stream
        const reader = peReader.GetMetadataReader();
        const candidate: RoAssembly = new EcmaAssembly(this, peReader, reader, location);
        const defNameData: AssemblyNameData = candidate.GetAssemblyNameDataNoCopy();
        let pkt = defNameData.PublicKeyToken ?? new Uint8Array();
        if (pkt.length == 0 && defNameData.PublicKey != undefined && defNameData.PublicKey.length != 0) {
            pkt = ComputePublicKeyToken(defNameData.PublicKey)!;
        }
        const defName = new RoAssemblyName(defNameData.Name, defNameData.Version, defNameData.CultureName, pkt, defNameData.Flags);
        const winner = this._loadedAssemblies.get(defName);

        if (winner == candidate) {
            // We won the race.
            // this.RegisterForDisposal(peReader);

            // We do not add to the _binds list because the binding list is only for assemblies that have been resolved through
            // the Resolve method. This allows the resolver to have complete control over selecting the appropriate assembly
            // based on Version, CultureName and PublicKeyToken.

            return winner;
        }
        else {
            // We lost the race but check for a Mvid mismatch.
            if (candidate.ManifestModule.ModuleVersionId != winner?.ManifestModule.ModuleVersionId) {
                Throw.FileLoadException('FileLoadDuplicateAssemblies, ' + defName);
            }
        }

        return winner;
    }


    //=======================================================================================================
    // CoreAssembly
    private static readonly s_CoreNames = ["mscorlib", "System.Runtime", "netstandard"];

    // Cache loaded coreAssembly and core types.
    public TryGetCoreAssembly(coreAssemblyName?: string): RoAssembly | undefined {
        assert(this._coreAssembly == undefined);
        if (coreAssemblyName == undefined) {
            this._coreAssembly = this.TryGetDefaultCoreAssembly();
        }
        else {
            const roAssemblyName = ToRoAssemblyName(new AssemblyName(coreAssemblyName));
            this._coreAssembly = this.TryResolveAssembly(roAssemblyName);
        }

        return this._coreAssembly;
    }

    private TryGetDefaultCoreAssembly(): RoAssembly | undefined {
        for (const coreName of MetadataLoadContext.s_CoreNames) {
            const roAssemblyName = ToRoAssemblyName(new AssemblyName(coreName));
            const roAssembly = this.TryResolveAssembly(roAssemblyName);

            // Stop on the first core assembly we find
            if (roAssembly != undefined) {
                return roAssembly;
            }
        }


        // e = new FileNotFoundException(SR.UnableToDetermineCoreAssembly);
        return undefined;
    }

    private _coreAssembly: RoAssembly | undefined;

    /// <summary>
    /// Returns a lazily created and cached Type instance corresponding to the indicated core type. This method throws
    /// if the core assembly name wasn't supplied, the core assembly could not be loaded for some reason or if the specified
    /// type does not exist in the core assembly.
    /// </summary>
    public GetCoreType(coreType: CoreType): RoType {
        const coreTypes = this.GetAllFoundCoreTypes();
        const t: RoType | undefined = this.TryGetCoreType(coreType);
        if (t == undefined) {
            const error = coreTypes.GetException(coreType);
            Throw.TypeLoadException(error?.message);
        }
        return t;
    }

    /// <summary>
    /// Returns a lazily created and cached Type instance corresponding to the indicated core type. This method returns undefined
    /// if the core assembly name wasn't supplied, the core assembly could not be loaded for some reason or if the specified
    /// type does not exist in the core assembly.
    /// </summary>
    public TryGetCoreType(coreType: CoreType): RoType | undefined {
        const coreTypes = this.GetAllFoundCoreTypes();
        return coreTypes.At(coreType);
    }

    /// <summary>
    /// Returns a cached array containing the resolved CoreTypes, indexed by the CoreType enum cast to an int.
    /// If the core assembly was not specified, not locatable or if one or more core types aren't present in the core assembly,
    /// the corresponding elements will be undefined.
    /// </summary>
    public GetAllFoundCoreTypes(): CoreTypes { return this._coreTypes; }
    private readonly _coreTypes: CoreTypes;

    // //
    // // Seriously, ugh - the default binder for Reflection has a dependency on checking types for equality with System.Object - for that
    // // one reason, we have to instance it per MetadataLoadContext.
    // //
    // public GetDefaultBinder(): Binder {
    //     this._lazyDefaultBinder = this._lazyDefaultBinder ?? new DefaultBinder(this);
    //     return this._lazyDefaultBinder;
    // }

    // private _lazyDefaultBinder: Binder | undefined;

    //=======================================================================================================
    // Resolving
    private readonly _binds = new Map<RoAssemblyName, RoAssembly>();

    public ResolveAssembly(refName: RoAssemblyName): RoAssembly {
        assert(refName != undefined);

        const assembly: RoAssembly | undefined = this.TryResolveAssembly(refName);
        if (assembly == undefined) {
            Throw.FileNotFoundException('FileNotFoundAssembly, ' + refName.FullName);
        }
        return assembly;
    }

    public TryResolveAssembly(refName: RoAssemblyName): RoAssembly | undefined {

        return this.ResolveToAssemblyOrExceptionAssembly(refName);
    }

    public ResolveToAssemblyOrExceptionAssembly(refName: RoAssemblyName): RoAssembly {
        assert(refName != undefined);

        const prior: RoAssembly | undefined = this._binds.get(refName)
        if (prior != undefined) {
            return prior;
        }

        const assembly: RoAssembly | undefined = this.TryFindAssemblyByCallingResolveHandler(refName);
        this._binds.set(refName, assembly);
        return assembly;
    }

    private TryFindAssemblyByCallingResolveHandler(refName: RoAssemblyName): RoAssembly {
        assert(refName != undefined);

        const assembly = this.resolver?.Resolve(this, refName.ToAssemblyName());

        if (assembly == undefined)
            Throw.RoExceptionAssembly(`SR.FileNotFoundAssembly, ${refName.FullName}`);

        const roAssembly = assembly as RoAssembly
        if (!(roAssembly !== undefined && roAssembly.Loader == this)) {
            Throw.FileLoadException(`ExternalAssemblyReturnedByMetadataAssemblyResolver`);
        }

        return roAssembly;
    }
}