import { Assembly } from "System.Reflection";
import { AssemblyNameData } from "./AssemblyNameData";
import { MetadataLoadContext } from "System.Reflection.MetadataLoadContext";
import { RoModule } from "System.Reflection.TypeLoading";

export abstract class RoAssembly extends Assembly {
    private readonly _loadedModules?: RoModule[]; // Any loaded modules indexed by [rid - 1]. Does NOT include the manifest module.

    protected constructor(loader: MetadataLoadContext, assemblyFileCount: number) {
        super();

        this.Loader = loader;
        this.IsSingleModule = (assemblyFileCount == 0);
        this._loadedModules = (assemblyFileCount == 0) ? new Array<RoModule>() : new Array<RoModule>(assemblyFileCount).map(() => new RoModule(""));
    }

    // public sealed override Module ManifestModule => GetRoManifestModule();
    // public abstract RoModule GetRoManifestModule();
    protected readonly IsSingleModule: boolean;

    // public sealed override string ToString() => Loader.GetDisposedString() ?? base.ToString();

    //         // Naming
    //         public sealed override AssemblyName GetName(boolean copiedName) => GetAssemblyNameDataNoCopy().CreateAssemblyName();
    public GetAssemblyNameDataNoCopy(): AssemblyNameData {
        this._lazyAssemblyNameData ??= this.ComputeNameData();
        return this._lazyAssemblyNameData;
    }
    protected abstract ComputeNameData(): AssemblyNameData;
    private _lazyAssemblyNameData?: AssemblyNameData;

    //         public sealed override string FullName => _lazyFullName ??= GetName().FullName;
    //         private volatile string? _lazyFullName;

    //         public const string ThrowingMessageInRAF = "This member throws an exception for assemblies embedded in a single-file app";

    //         // Location and codebase
    //         public abstract override string Location { get; }
    // #if NET
    //         [Obsolete(Obsoletions.CodeBaseMessage, DiagnosticId = Obsoletions.CodeBaseDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    // #endif
    //         public sealed override string CodeBase => throw new NotSupportedException(SR.NotSupported_AssemblyCodeBase);
    // #if NET
    //         [Obsolete(Obsoletions.CodeBaseMessage, DiagnosticId = Obsoletions.CodeBaseDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         [RequiresAssemblyFiles(ThrowingMessageInRAF)]
    // #endif
    //         public sealed override string EscapedCodeBase => throw new NotSupportedException(SR.NotSupported_AssemblyCodeBase);

    //         // Custom Attributes
    //         public sealed override IList<CustomAttributeData> GetCustomAttributesData() => CustomAttributes.ToReadOnlyCollection();
    //         public abstract override IEnumerable<CustomAttributeData> CustomAttributes { get; }

    //         // Apis to retrieved types physically defined in this module.
    //         public sealed override Type[] GetTypes() => IsSingleModule ? ManifestModule.GetTypes() : base.GetTypes();
    //         public sealed override IEnumerable<TypeInfo> DefinedTypes => GetDefinedRoTypes()!;

    //         private IEnumerable<RoType>? GetDefinedRoTypes() => IsSingleModule ? GetRoManifestModule().GetDefinedRoTypes() : MultiModuleGetDefinedRoTypes();
    //         private IEnumerable<RoType> MultiModuleGetDefinedRoTypes()
    //         {
    //             foreach (RoModule module in ComputeRoModules(getResourceModules: false))
    //             {
    //                 foreach (RoType t in module.GetDefinedRoTypes()!)
    //                 {
    //                     yield return t;
    //                 }
    //             }
    //         }

    //         // Apis to retrieve public types physically defined in this module.
    //         public sealed override Type[] GetExportedTypes()
    //         {
    //             // todo: use IEnumerable<T> extension instead: ExportedTypes.ToArray();
    //             List<Type> list = new List<Type>(ExportedTypes);
    //             return list.ToArray();
    //         }

    //         public sealed override IEnumerable<Type> ExportedTypes
    //         {
    //             get
    //             {
    //                 foreach (RoType type in GetDefinedRoTypes()!)
    //                 {
    //                     if (type.IsVisibleOutsideAssembly())
    //                         yield return type;
    //                 }
    //             }
    //         }

    //         // Api to retrieve types by name. Retrieves both types physically defined in this module and types this assembly forwards from another assembly.
    //         public sealed override Type? GetType(string name, boolean throwOnError, boolean ignoreCase)
    //         {
    //             if (name is undefined)
    //             {
    //                 throw new ArgumentNullException(nameof(name));
    //             }

    //             // Known compat disagreement: This api is supposed to throw an ArgumentException if the name has an assembly qualification
    //             // (though the intended meaning seems clear.) This is difficult for us to implement as we don't have our own type name parser.
    //             // (We can't just throw in the assemblyResolve delegate because assembly qualifications are permitted inside generic arguments,
    //             // just not in the top level type name.) In the bigger scheme of things, this does not seem worth worrying about.

    //             return Helpers.LoadTypeFromAssemblyQualifiedName(name, defaultAssembly: this, ignoreCase: ignoreCase, throwOnError: throwOnError);
    //         }

    //         /// <summary>
    //         /// Helper routine for the more general Assembly.GetType() family of apis. Also used in typeRef resolution.
    //         ///
    //         /// Resolves top-level named types only. No nested types. No constructed types. The input name must not be escaped.
    //         ///
    //         /// If a type is not contained or forwarded from the assembly, this method returns undefined (does not throw.)
    //         /// This supports the "throwOnError: false" behavior of Assembly.GetType(string, boolean).
    //         /// </summary>
    //         public RoDefinitionType? GetTypeCore(string ns, string name, boolean ignoreCase, out Exception? e) => GetTypeCore(ns.ToUtf8(), name.ToUtf8(), ignoreCase, out e);
    //         public RoDefinitionType? GetTypeCore(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name, boolean ignoreCase, out Exception? e)
    //         {
    //             RoDefinitionType? result = GetRoManifestModule().GetTypeCore(ns, name, ignoreCase, out e);
    //             if (IsSingleModule || result != undefined)
    //                 return result;

    //             foreach (RoModule module in ComputeRoModules(getResourceModules: false))
    //             {
    //                 if (module == ManifestModule)
    //                     continue;

    //                 result = module.GetTypeCore(ns, name, ignoreCase, out e);
    //                 if (result != undefined)
    //                     return result;
    //             }
    //             return undefined;
    //         }

    //         // Assembly dependencies
    //         public sealed override AssemblyName[] GetReferencedAssemblies()
    //         {
    //             // For compat, this api only searches the manifest module. Tools normally ensure the manifest module's assemblyRef
    //             // table represents the union of all module's assemblyRef table.
    //             AssemblyNameData[] data = GetReferencedAssembliesNoCopy();
    //             AssemblyName[] result = new AssemblyName[data.Length];
    //             for (number i = 0; i < data.Length; i++)
    //             {
    //                 result[i] = data[i].CreateAssemblyName();
    //             }
    //             return result;
    //         }

    //         private AssemblyNameData[] GetReferencedAssembliesNoCopy() => _lazyAssemblyReferences ??= ComputeAssemblyReferences();
    //         protected abstract AssemblyNameData[] ComputeAssemblyReferences();
    //         private volatile AssemblyNameData[]? _lazyAssemblyReferences;

    //         // Miscellaneous properties
    //         public sealed override boolean ReflectionOnly => true;
    // #if NET
    //         [Obsolete("The Global Assembly Cache is not supported.", DiagnosticId = "SYSLIB0005", UrlFormat = "https://aka.ms/dotnet-warnings/{0}")]
    // #endif
    //         public sealed override boolean GlobalAssemblyCache => false;
    //         public sealed override long HostContext => 0;
    //         public abstract override string ImageRuntimeVersion { get; }
    //         public abstract override boolean IsDynamic { get; }
    //         public abstract override MethodInfo? EntryPoint { get; }

    //         // Manifest resource support.
    //         public abstract override ManifestResourceInfo? GetManifestResourceInfo(string resourceName);
    //         public abstract override string[] GetManifestResourceNames();
    //         public abstract override Stream? GetManifestResourceStream(string name);
    //         public sealed override Stream? GetManifestResourceStream(Type type, string name)
    //         {
    //             StringBuilder sb = new StringBuilder();
    //             if (type == undefined)
    //             {
    //                 if (name == undefined)
    //                     throw new ArgumentNullException(nameof(type));
    //             }
    //             else
    //             {
    //                 string? ns = type.Namespace;
    //                 if (ns != undefined)
    //                 {
    //                     sb.Append(ns);
    //                     if (name != undefined)
    //                         sb.Append(Type.Delimiter);
    //                 }
    //             }

    //             if (name != undefined)
    //                 sb.Append(name);

    //             return GetManifestResourceStream(sb.ToString());
    //         }

    //         // Serialization
    // #if NET8_0_OR_GREATER
    //         [Obsolete(Obsoletions.LegacyFormatterImplMessage, DiagnosticId = Obsoletions.LegacyFormatterImplDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         [EditorBrowsable(EditorBrowsableState.Never)]
    // #endif
    //         public sealed override void GetObjectData(SerializationInfo info, StreamingContext context) => throw new NotSupportedException();

    //         // Satellite assemblies
    //         public sealed override Assembly GetSatelliteAssembly(CultureInfo culture) => throw new NotSupportedException(SR.NotSupported_SatelliteAssembly);
    //         public sealed override Assembly GetSatelliteAssembly(CultureInfo culture, Version? version) => throw new NotSupportedException(SR.NotSupported_SatelliteAssembly);

    //         // Operations that are invalid for ReflectionOnly objects.
    //         public sealed override object[] GetCustomAttributes(boolean inherit) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);
    //         public sealed override object[] GetCustomAttributes(Type attributeType, boolean inherit) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);
    //         public sealed override boolean IsDefined(Type attributeType, boolean inherit) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);
    //         // Compat quirk: Why ArgumentException instead of InvalidOperationException?
    //         public sealed override object CreateInstance(string typeName, boolean ignoreCase, BindingFlags bindingAttr, Binder? binder, object?[]? args, CultureInfo? culture, object?[]? activationAttributes) => throw new ArgumentException(SR.Arg_ReflectionOnlyInvoke);

    public readonly Loader: MetadataLoadContext;
}