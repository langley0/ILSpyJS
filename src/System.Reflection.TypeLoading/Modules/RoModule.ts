import { Throw } from "System";
import assert from "assert";
import { Module, MetadataLoadContext } from "System.Reflection";
import { RoDefinitionType, RoAssembly, GetTypeCoreCache } from "System.Reflection.TypeLoading";
import { Guid } from "System";

export abstract class RoModule extends Module {
    private readonly _fullyQualifiedName: string;

    public static readonly FullyQualifiedNameForModulesLoadedFromByteArrays = "<Unknown>";

    public constructor(fullyQualifiedName: string) {
        super();
        assert(fullyQualifiedName != undefined);

        this._fullyQualifiedName = fullyQualifiedName;
    }

    //         public sealed override string ToString() => Loader.GetDisposedString() ?? base.ToString();

    //         public sealed override Assembly Assembly => GetRoAssembly();
    public abstract GetRoAssembly(): RoAssembly;

    //         public const string UnknownStringMessageInRAF = "Returns <Unknown> for modules with no file path";

    // #if NET
    //         [RequiresAssemblyFiles(UnknownStringMessageInRAF)]
    // #endif
    //         public sealed override string FullyQualifiedName => _fullyQualifiedName;
    //         public abstract override int MDStreamVersion { get; }
    //         public abstract override int MetadataToken { get; }
    public abstract override get ModuleVersionId(): Guid;

    // #if NET
    //         [RequiresAssemblyFiles(UnknownStringMessageInRAF)]
    // #endif
    //         public sealed override string Name
    //         {
    //             get
    //             {
    //                 string s = FullyQualifiedName;
    //                 int i = s.LastIndexOf(Path.DirectorySeparatorChar);
    //                 if (i == -1)
    //                     return s;

    //                 return s.Substring(i + 1);
    //             }
    //         }

    //         public abstract override string ScopeName { get; }

    //         public sealed override IList<CustomAttributeData> GetCustomAttributesData() => CustomAttributes.ToReadOnlyCollection();
    //         public abstract override IEnumerable<CustomAttributeData> CustomAttributes { get; }

    //         public sealed override object[] GetCustomAttributes(bool inherit) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);
    //         public sealed override object[] GetCustomAttributes(Type attributeType, bool inherit) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);
    //         public sealed override bool IsDefined(Type attributeType, bool inherit) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);

    //         public abstract override FieldInfo? GetField(string name, BindingFlags bindingAttr);
    //         public abstract override FieldInfo[] GetFields(BindingFlags bindingFlags);
    //         public abstract override MethodInfo[] GetMethods(BindingFlags bindingFlags);
    //         protected abstract override MethodInfo? GetMethodImpl(string name, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers);

    // #if NET8_0_OR_GREATER
    //         [Obsolete(Obsoletions.LegacyFormatterImplMessage, DiagnosticId = Obsoletions.LegacyFormatterImplDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         [EditorBrowsable(EditorBrowsableState.Never)]
    // #endif
    //         public sealed override void GetObjectData(SerializationInfo info, StreamingContext context) => throw new NotSupportedException();
    //         public abstract override void GetPEKind(out PortableExecutableKinds peKind, out ImageFileMachine machine);

    //         public abstract override Type[] GetTypes();
    //         public abstract IEnumerable<RoType>? GetDefinedRoTypes();
    //         public abstract override bool IsResource();

    //         public sealed override FieldInfo ResolveField(int metadataToken, Type[]? genericTypeArguments, Type[]? genericMethodArguments) => throw new NotSupportedException(SR.NotSupported_ResolvingTokens);
    //         public sealed override MemberInfo ResolveMember(int metadataToken, Type[]? genericTypeArguments, Type[]? genericMethodArguments) => throw new NotSupportedException(SR.NotSupported_ResolvingTokens);
    //         public sealed override MethodBase ResolveMethod(int metadataToken, Type[]? genericTypeArguments, Type[]? genericMethodArguments) => throw new NotSupportedException(SR.NotSupported_ResolvingTokens);
    //         public sealed override byte[] ResolveSignature(int metadataToken) => throw new NotSupportedException(SR.NotSupported_ResolvingTokens);
    //         public sealed override string ResolveString(int metadataToken) => throw new NotSupportedException(SR.NotSupported_ResolvingTokens);
    //         public sealed override Type ResolveType(int metadataToken, Type[]? genericTypeArguments, Type[]? genericMethodArguments) => throw new NotSupportedException(SR.NotSupported_ResolvingTokens);

    //         public sealed override Type? GetType(string className, bool throwOnError, bool ignoreCase)
    //         {
    //             //
    //             // This looks bogus and against the intended meaning of the api but it's pretty close to the .NET Framework behavior.
    //             // The .NET Framework Module.GetType() will search the entire assembly when encounting a non assembly-qualified type name but
    //             // *only* as long as it's a generic type argument, not the top level type. If you specify the name of a type in a
    //             // different module as the top level type, this api returns undefined (even if throwOnError is specified as true!)
    //             //
    //             Type type = Assembly.GetType(className, throwOnError: throwOnError, ignoreCase: ignoreCase)!;
    //             if (type.Module != this)
    //             {
    //                 // We should throw if throwOnError == true, but .NET Framework doesn't so we'll keep the same behavior for the few people using this.
    //                 return undefined;
    //             }
    //             return type;
    //         }

    /// <summary>
    /// Helper routine for the more general Module.GetType() family of apis. Also used in typeRef resolution.
    ///
    /// Resolves top-level named types only. No nested types. No constructed types. The input name must not be escaped.
    ///
    /// If a type is not contained or forwarded from the module, this method returns undefined (does not throw.)
    /// This supports the "throwOnError: false" behavior of Module.GetType(string, bool).
    /// </summary>
    public GetTypeCore(ns: Uint8Array, name: Uint8Array, ignoreCase: boolean): RoDefinitionType | undefined {
        if (ignoreCase) {
            throw new Error("NotSupported_CaseInsensitive");
        }

        const hashCode = GetTypeCoreCache.ComputeHashCode(name);
        let type = this._getTypeCoreCache.TryGet(ns, name, hashCode);
        if (type != undefined) {
            type = this.GetTypeCoreNoCache(ns, name);
            if (type == undefined) {
                throw new Error(`Type not found: ${ns} ${name}`);
            }
            this._getTypeCoreCache.GetOrAdd(ns, name, hashCode, type); // Type objects are unified independently of this cache so no need to check if we won the race to cache this Type
        }

        if (type == undefined) {
            return undefined;
        }

        return type;
    }
    protected abstract GetTypeCoreNoCache(ns: Uint8Array, name: Uint8Array): RoDefinitionType | undefined;
    public readonly _getTypeCoreCache: GetTypeCoreCache = new GetTypeCoreCache();

    public get Loader(): MetadataLoadContext { return this.GetRoAssembly().Loader; }
}