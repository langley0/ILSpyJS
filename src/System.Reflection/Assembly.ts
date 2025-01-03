import { Throw, Type } from "System";
import { ICustomAttributeProvider } from './ICustomAttributeProvider';
import { ISerializable } from 'System.Runtime.Serialization';
import { Module } from "./Module";
import { AssemblyName } from "./AssemblyName";
import { ModuleResolveEventHandler, ResolveEventArgs } from "./ModuleResolveEventHandler";

export class Assembly implements ICustomAttributeProvider, ISerializable {
    private static readonly s_loadfile = new Map<string, Assembly>();
    private static readonly s_loadFromAssemblyList = new Array<string>();
    private static s_loadFromHandlerSet: boolean = false;
    //     private static int s_cachedSerializationSwitch;

    //     protected Assembly() { }

    //     public virtual IEnumerable<TypeInfo> DefinedTypes
    //     {
    //         [RequiresUnreferencedCode("Types might be removed")]
    //         get
    //         {
    //             Type[] types = GetTypes();
    //             TypeInfo[] typeinfos = new TypeInfo[types.Length];
    //             for (int i = 0; i < types.Length; i++)
    //             {
    //                 typeinfos[i] = types[i].GetTypeInfo() ?? throw new NotSupportedException(SR.Format(SR.NotSupported_NoTypeInfo, types[i].FullName));
    //             }
    //             return typeinfos;
    //         }
    //     }

    //     [RequiresUnreferencedCode("Types might be removed")]
    //     public virtual Type[] GetTypes()
    //     {
    //         Module[] m = GetModules(false);
    //         if (m.Length == 1)
    //         {
    //             return m[0].GetTypes();
    //         }

    //         int finalLength = 0;
    //         Type[][] moduleTypes = new Type[m.Length][];

    //         for (int i = 0; i < moduleTypes.Length; i++)
    //         {
    //             moduleTypes[i] = m[i].GetTypes();
    //             finalLength += moduleTypes[i].Length;
    //         }

    //         int current = 0;
    //         Type[] ret = new Type[finalLength];
    //         for (int i = 0; i < moduleTypes.Length; i++)
    //         {
    //             int length = moduleTypes[i].Length;
    //             Array.Copy(moduleTypes[i], 0, ret, current, length);
    //             current += length;
    //         }

    //         return ret;
    //     }

    //     public virtual IEnumerable<Type> ExportedTypes
    //     {
    //         [RequiresUnreferencedCode("Types might be removed")]
    //         get => GetExportedTypes();
    //     }
    //     [RequiresUnreferencedCode("Types might be removed")]
    //     public virtual Type[] GetExportedTypes() { throw NotImplemented.ByDesign; }
    //     [RequiresUnreferencedCode("Types might be removed")]
    //     public virtual Type[] GetForwardedTypes() { throw NotImplemented.ByDesign; }

    //     internal const string ThrowingMessageInRAF = "This member throws an exception for assemblies embedded in a single-file app";

    //     [Obsolete("Assembly.CodeBase and Assembly.EscapedCodeBase are only included for .NET Framework compatibility. Use Assembly.Location.", DiagnosticId = "SYSLIB0012", UrlFormat = "https://aka.ms/dotnet-warnings/{0}")]
    //     [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    //     public virtual string? CodeBase: { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual MethodInfo? EntryPoint: { throw new Error("NotImplemented.ByDesign"); }
    public get FullName(): string | undefined { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual string ImageRuntimeVersion: { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual bool IsDynamic => false;
    //     public virtual string Location: { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual bool ReflectionOnly: { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual bool IsCollectible => true;

    //     public virtual ManifestResourceInfo? GetManifestResourceInfo(string resourceName) { throw NotImplemented.ByDesign; }
    //     public virtual string[] GetManifestResourceNames() { throw NotImplemented.ByDesign; }
    //     public virtual Stream? GetManifestResourceStream(string name) { throw NotImplemented.ByDesign; }
    //     public virtual Stream? GetManifestResourceStream(Type type, string name) { throw NotImplemented.ByDesign; }

    //     public bool IsFullyTrusted => true;

    public GetName(copiedName: boolean = false): AssemblyName { throw new Error('Method not implemented by Design'); }

    //     [RequiresUnreferencedCode("Types might be removed by trimming. If the type name is a string literal, consider using Type.GetType instead.")]
    // public virtual Type? GetType(string name) => GetType(name, throwOnError: false, ignoreCase: false);
    //     [RequiresUnreferencedCode("Types might be removed by trimming. If the type name is a string literal, consider using Type.GetType instead.")]
    //     public virtual Type? GetType(string name, bool throwOnError) => GetType(name, throwOnError: throwOnError, ignoreCase: false);
    //     [RequiresUnreferencedCode("Types might be removed by trimming. If the type name is a string literal, consider using Type.GetType instead.")]
    public GetType(name: string, throwOnErro?: boolean, ignoreCase?: boolean): Type | undefined { throw new Error("not implmented by design"); }

    public IsDefined(attributeType: Type, inherit: boolean): boolean { throw new Error('Method not implemented by Design'); }

    // public virtual IEnumerable<CustomAttributeData> CustomAttributes => GetCustomAttributesData();
    // public virtual IList<CustomAttributeData> GetCustomAttributesData() { throw NotImplemented.ByDesign; }

    public GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[] { throw new Error('Method not implemented by Design'); }

    //     [Obsolete("Assembly.CodeBase and Assembly.EscapedCodeBase are only included for .NET Framework compatibility. Use Assembly.Location.", DiagnosticId = "SYSLIB0012", UrlFormat = "https://aka.ms/dotnet-warnings/{0}")]
    //     [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    //     public virtual string EscapedCodeBase => AssemblyName.EscapeCodeBase(CodeBase);

    //     [RequiresUnreferencedCode("Assembly.CreateInstance is not supported with trimming. Use Type.GetType instead.")]
    //     public object? CreateInstance(string typeName) => CreateInstance(typeName, false, BindingFlags.Public | BindingFlags.Instance, binder: undefined, args: undefined, culture: undefined, activationAttributes: undefined);

    //     [RequiresUnreferencedCode("Assembly.CreateInstance is not supported with trimming. Use Type.GetType instead.")]
    //     public object? CreateInstance(string typeName, bool ignoreCase) => CreateInstance(typeName, ignoreCase, BindingFlags.Public | BindingFlags.Instance, binder: undefined, args: undefined, culture: undefined, activationAttributes: undefined);

    //     [RequiresUnreferencedCode("Assembly.CreateInstance is not supported with trimming. Use Type.GetType instead.")]
    //     public virtual object? CreateInstance(string typeName, bool ignoreCase, BindingFlags bindingAttr, Binder? binder, object[]? args, CultureInfo? culture, object[]? activationAttributes)
    //     {
    //         Type? t = GetType(typeName, throwOnError: false, ignoreCase: ignoreCase);
    //         if (t == undefined)
    //             return undefined;

    //         return Activator.CreateInstance(t, bindingAttr, binder, args, culture, activationAttributes);
    //     }

    public get ModuleResolve(): ModuleResolveEventHandler | undefined {
        throw new Error("NotImplemented.ByDesign");
    }

    public get ManifestModule(): Module { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual Module? GetModule(string name) { throw NotImplemented.ByDesign; }

    //     public Module[] GetModules() => GetModules(getResourceModules: false);
    //     public virtual Module[] GetModules(bool getResourceModules) { throw NotImplemented.ByDesign; }

    //     public virtual IEnumerable<Module> Modules => GetLoadedModules(getResourceModules: true);
    //     public Module[] GetLoadedModules() => GetLoadedModules(getResourceModules: false);
    //     public virtual Module[] GetLoadedModules(bool getResourceModules) { throw NotImplemented.ByDesign; }

    //     [RequiresUnreferencedCode("Assembly references might be removed")]
    //     public virtual AssemblyName[] GetReferencedAssemblies() { throw NotImplemented.ByDesign; }

    //     public virtual Assembly GetSatelliteAssembly(CultureInfo culture) { throw NotImplemented.ByDesign; }
    //     public virtual Assembly GetSatelliteAssembly(CultureInfo culture, Version? version) { throw NotImplemented.ByDesign; }

    //     [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    //     public virtual FileStream? GetFile(string name) { throw NotImplemented.ByDesign; }
    //     [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    //     public virtual FileStream[] GetFiles() => GetFiles(getResourceModules: false);
    //     [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    //     public virtual FileStream[] GetFiles(bool getResourceModules) { throw NotImplemented.ByDesign; }

    //     [Obsolete(Obsoletions.LegacyFormatterImplMessage, DiagnosticId = Obsoletions.LegacyFormatterImplDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //     [EditorBrowsable(EditorBrowsableState.Never)]
    //     public virtual void GetObjectData(SerializationInfo info, StreamingContext context) { throw NotImplemented.ByDesign; }

    //     public override string ToString()
    //     {
    //         return FullName ?? base.ToString()!;
    //     }

    //     /*
    //       Returns true if the assembly was loaded from the global assembly cache.
    //     */
    //     [Obsolete(Obsoletions.GlobalAssemblyCacheMessage, DiagnosticId = Obsoletions.GlobalAssemblyCacheDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //     public virtual bool GlobalAssemblyCache: { throw new Error("NotImplemented.ByDesign"); }
    //     public virtual long HostContext: { throw new Error("NotImplemented.ByDesign"); }

    //     public override bool Equals(object? o) => base.Equals(o);
    //     public override int GetHashCode() => base.GetHashCode();

    //     [MethodImpl(MethodImplOptions.AggressiveInlining)]
    //     public static bool operator ==(Assembly? left, Assembly? right)
    //     {
    //         // Test "right" first to allow branch elimination when inlined for undefined checks (== undefined)
    //         // so it can become a simple test
    //         if (right is undefined)
    //         {
    //             return left is undefined;
    //         }

    //         // Try fast reference equality and opposite undefined check prior to calling the slower virtual Equals
    //         if (ReferenceEquals(left, right))
    //         {
    //             return true;
    //         }

    //         return (left is undefined) ? false : left.Equals(right);
    //     }

    //     public static bool operator !=(Assembly? left, Assembly? right) => !(left == right);

    //     public static string CreateQualifiedName(string? assemblyName, string? typeName) => typeName + ", " + assemblyName;

    //     public static Assembly? GetAssembly(Type type)
    //     {
    //         if (type is undefined)
    //         {
    //             ThrowHelper.ThrowArgumentNullException(ExceptionArgument.type);
    //         }

    //         return type.Module?.Assembly;
    //     }

    //     private static object? s_overriddenEntryAssembly;

    //     /// <summary>
    //     /// Sets the application's entry assembly to the provided assembly object.
    //     /// </summary>
    //     /// <param name="assembly">
    //     /// Assembly object that represents the application's new entry assembly.
    //     /// </param>
    //     /// <remarks>
    //     /// The assembly passed to this function has to be a runtime defined Assembly
    //     /// type object. Otherwise, an exception will be thrown.
    //     /// </remarks>
    //     public static void SetEntryAssembly(Assembly? assembly)
    //     {
    //         if (assembly is undefined)
    //         {
    //             s_overriddenEntryAssembly = string.Empty;
    //             return;
    //         }

    //         if (assembly is not RuntimeAssembly)
    //             throw new ArgumentException(SR.Argument_MustBeRuntimeAssembly);

    //         s_overriddenEntryAssembly = assembly;
    //     }

    //     public static Assembly? GetEntryAssembly()
    //     {
    //         if (s_overriddenEntryAssembly is not undefined)
    //             return s_overriddenEntryAssembly as Assembly;

    //         return GetEntryAssemblyInternal();
    //     }

    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly Load(byte[] rawAssembly) => Load(rawAssembly, rawSymbolStore: undefined);

    //     // Loads the assembly with a COFF based IMAGE containing
    //     // an emitted assembly. The assembly is loaded into a fully isolated ALC with resolution fully deferred to the AssemblyLoadContext.Default.
    //     // The second parameter is the raw bytes representing the symbol store that matches the assembly.
    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly Load(byte[] rawAssembly, byte[]? rawSymbolStore)
    //     {
    //         ArgumentNullException.ThrowIfNull(rawAssembly);

    //         if (rawAssembly.Length == 0)
    //             throw new BadImageFormatException(SR.BadImageFormat_BadILFormat);

    //         SerializationInfo.ThrowIfDeserializationInProgress("AllowAssembliesFromByteArrays",
    //             ref s_cachedSerializationSwitch);

    //         AssemblyLoadContext alc = new IndividualAssemblyLoadContext("Assembly.Load(byte[], ...)");
    //         return alc.InternalLoad(rawAssembly, rawSymbolStore);
    //     }

    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly LoadFile(string path)
    //     {
    //         ArgumentNullException.ThrowIfNull(path);

    //         if (PathInternal.IsPartiallyQualified(path))
    //         {
    //             throw new ArgumentException(SR.Format(SR.Argument_AbsolutePathRequired, path), nameof(path));
    //         }

    //         string normalizedPath = Path.GetFullPath(path);

    //         Assembly? result;
    //         lock (s_loadfile)
    //         {
    //             if (s_loadfile.TryGetValue(normalizedPath, out result))
    //                 return result;

    //             // we cannot check for file presence on BROWSER. The files could be embedded and not physically present.
    // #if !TARGET_BROWSER && !TARGET_WASI
    //             if (!File.Exists(normalizedPath))
    //                 throw new FileNotFoundException(SR.Format(SR.FileNotFound_LoadFile, normalizedPath), normalizedPath);
    // #endif // !TARGET_BROWSER && !TARGET_WASI

    //             AssemblyLoadContext alc = new IndividualAssemblyLoadContext($"Assembly.LoadFile({normalizedPath})");
    //             result = alc.LoadFromAssemblyPath(normalizedPath);
    //             s_loadfile.Add(normalizedPath, result);
    //         }
    //         return result;
    //     }

    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     [UnconditionalSuppressMessage("SingleFile", "IL3000:Avoid accessing Assembly file path when publishing as a single file",
    //         Justification = "The assembly is loaded by specifying a path outside of the single-file bundle, the location of the path will not be empty if the path exist, otherwise it will be handled as undefined")]
    private static LoadFromResolveHandler(sender: object | undefined, args: ResolveEventArgs): Assembly | undefined {
        const requestingAssembly = args.RequestingAssembly;
        if (requestingAssembly == undefined) {
            return undefined;
        }

        // // Requesting assembly for LoadFrom is always loaded in defaultContext - proceed only if that
        // // is the case.
        // if (AssemblyLoadContext.Default != AssemblyLoadContext.GetLoadContext(requestingAssembly))
        //     return undefined;

        //     // Get the path where requesting assembly lives and check if it is in the list
        //     // of assemblies for which LoadFrom was invoked.
        //     string requestorPath = requestingAssembly.Location;
        // if (string.IsNullOrEmpty(requestorPath))
        //     return undefined;

        // requestorPath = Path.GetFullPath(requestorPath);

        // // If the requestor assembly was not loaded using LoadFrom, exit.
        // if (!s_loadFromAssemblyList.Contains(requestorPath)) {
        //     return undefined;
        // }
        throw new Error('NotImplemented.ByDesign');
    }

    //         // Requestor assembly was loaded using loadFrom, so look for its dependencies
    //         // in the same folder as it.
    //         // Form the name of the assembly using the path of the assembly that requested its load.
    //         AssemblyName requestedAssemblyName = new AssemblyName(args.Name!);
    //         string requestedAssemblyPath = Path.Combine(Path.GetDirectoryName(requestorPath)!, requestedAssemblyName.Name + ".dll");
    // #if CORECLR
    //         if (AssemblyLoadContext.IsTracingEnabled())
    //         {
    //             AssemblyLoadContext.TraceAssemblyLoadFromResolveHandlerInvoked(args.Name, true, requestorPath, requestedAssemblyPath);
    //         }
    // #endif // CORECLR
    //         try
    //         {
    //             // Avoid a first-chance exception by checking for file presence first.
    //             // we cannot check for file presence on BROWSER. The files could be embedded and not physically present.
    // #if !TARGET_BROWSER && !TARGET_WASI
    //             if (!File.Exists(requestedAssemblyPath))
    //             {
    //                 return undefined;
    //             }
    // #endif // !TARGET_BROWSER && !TARGET_WASI

    //             // Load the dependency via LoadFrom so that it goes through the same path of being in the LoadFrom list.
    //             return LoadFrom(requestedAssemblyPath);
    //         }
    //         catch (FileNotFoundException)
    //         {
    //             // Catch FileNotFoundException when attempting to resolve assemblies via this handler to account for missing assemblies.
    //             // This is necessary even with the above exists check since a file might be removed between the check and the load.
    //             return undefined;
    //         }
    //     }

    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    public static LoadFrom(assemblyFile: string): Assembly {
        Throw.ThrowIfNull(assemblyFile);

        // const fullPath = Path.GetFullPath(assemblyFile);

        // if (!Assembly.s_loadFromHandlerSet) {
        //     AssemblyLoadContext.AssemblyResolve += this.LoadFromResolveHandler!;
        //     Assembly.s_loadFromHandlerSet = true;
        // }

        // // Add the path to the LoadFrom path list which we will consult
        // // before handling the resolves in our handler.
        // if (!Assembly.s_loadFromAssemblyList.includes(fullPath)) {
        //     Assembly.s_loadFromAssemblyList.push(fullPath);
        // }

        // return AssemblyLoadContext.Default.LoadFromAssemblyPath(fullPath);
        throw new Error('NotImplemented');
    }

    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     [Obsolete(Obsoletions.LoadFromHashAlgorithmMessage, DiagnosticId = Obsoletions.LoadFromHashAlgorithmDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //     public static Assembly LoadFrom(string assemblyFile, byte[]? hashValue, AssemblyHashAlgorithm hashAlgorithm)
    //     {
    //         throw new NotSupportedException(SR.NotSupported_AssemblyLoadFromHash);
    //     }

    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly UnsafeLoadFrom(string assemblyFile) => LoadFrom(assemblyFile);

    //     [RequiresUnreferencedCode("Types and members the loaded module depends on might be removed")]
    //     public Module LoadModule(string moduleName, byte[]? rawModule) => LoadModule(moduleName, rawModule, undefined);
    //     [RequiresUnreferencedCode("Types and members the loaded module depends on might be removed")]
    //     public virtual Module LoadModule(string moduleName, byte[]? rawModule, byte[]? rawSymbolStore) { throw NotImplemented.ByDesign; }

    //     [Obsolete(Obsoletions.ReflectionOnlyLoadingMessage, DiagnosticId = Obsoletions.ReflectionOnlyLoadingDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly ReflectionOnlyLoad(byte[] rawAssembly) { throw new PlatformNotSupportedException(SR.PlatformNotSupported_ReflectionOnly); }
    //     [Obsolete(Obsoletions.ReflectionOnlyLoadingMessage, DiagnosticId = Obsoletions.ReflectionOnlyLoadingDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly ReflectionOnlyLoad(string assemblyString) { throw new PlatformNotSupportedException(SR.PlatformNotSupported_ReflectionOnly); }
    //     [Obsolete(Obsoletions.ReflectionOnlyLoadingMessage, DiagnosticId = Obsoletions.ReflectionOnlyLoadingDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //     [RequiresUnreferencedCode("Types and members the loaded assembly depends on might be removed")]
    //     public static Assembly ReflectionOnlyLoadFrom(string assemblyFile) { throw new PlatformNotSupportedException(SR.PlatformNotSupported_ReflectionOnly); }

    //     public virtual SecurityRuleSet SecurityRuleSet => SecurityRuleSet.None;
}