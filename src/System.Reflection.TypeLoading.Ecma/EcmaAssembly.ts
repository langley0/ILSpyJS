import assert from "assert";
import { Throw } from "System/Throw";
import { Stream } from "System.IO";
import {
    ProcessorArchitecture,
    ImageFileMachine,
    AssemblyNameFlags,
    PortableExecutableKinds,
    MetadataLoadContext,
    ModuleResolveEventHandler,
    ResolveEventArgs,
} from "System.Reflection";
import { AssemblyFileInfo, RoAssembly, RoModule } from "System.Reflection.TypeLoading";
import { EcmaModule } from "System.Reflection.TypeLoading.Ecma";
import {
    AssemblyNameData,
    ComputePublicKeyToken,
    ConvertAssemblyFlagsToAssemblyNameFlags,
    ExtractAssemblyNameFlags,
    ExtractAssemblyContentType,
    RoDefinitionType,
} from "System.Reflection.TypeLoading";
import { PEReader } from "System.Reflection.PortableExecutable";
import { MetadataReader, AssemblyDefinition } from "System.Reflection.Metadata";

export class EcmaAssembly extends RoAssembly {
    private readonly _location: string;
    private readonly _manifestModule: EcmaModule;
    private readonly _neverAccessThisExceptThroughAssemblyDefinitionProperty: AssemblyDefinition;

    public constructor(loader: MetadataLoadContext, peReader: PEReader, reader: MetadataReader, location: string) {
        super(loader, reader.AssemblyFiles.Count)
        assert(loader != undefined);
        assert(peReader != undefined);
        assert(reader != undefined);
        assert(location != undefined);

        this._location = location;
        this._neverAccessThisExceptThroughAssemblyDefinitionProperty = reader.GetAssemblyDefinition();

        this._manifestModule = new EcmaModule(this, location, peReader, reader);

    }

    public override  GetRoManifestModule(): RoModule { return this._manifestModule; }
    public GetEcmaManifestModule(): EcmaModule { return this._manifestModule; }

    // public  override MethodInfo? EntryPoint => GetEcmaManifestModule().ComputeEntryPoint(fileRefEntryPointAllowed: true);

    // public  override string ImageRuntimeVersion => Reader.MetadataVersion;
    // public  override bool IsDynamic => false;
    // public  override string Location => _location;

    // public  override IEnumerable<CustomAttributeData> CustomAttributes => AssemblyDefinition.GetCustomAttributes().ToTrueCustomAttributes(GetEcmaManifestModule());

    // protected  override AssemblyNameData[] ComputeAssemblyReferences()
    // {
    //     MetadataReader reader = Reader;
    //     AssemblyNameData[] assemblyReferences = new AssemblyNameData[reader.AssemblyReferences.Count];
    //     int index = 0;
    //     foreach (AssemblyReferenceHandle handle in reader.AssemblyReferences)
    //     {
    //         AssemblyReference ar = handle.GetAssemblyReference(reader);
    //         AssemblyNameData data = new AssemblyNameData();

    //         AssemblyNameFlags flags = ar.Flags.ToAssemblyNameFlags();
    //         data.Flags = flags;
    //         data.Name = ar.Name.GetString(reader);
    //         data.Version = ar.Version.AdjustForUnspecifiedVersionComponents()!;
    //         data.CultureName = ar.Culture.GetStringOrNull(reader) ?? string.Empty;
    //         if ((flags & AssemblyNameFlags.PublicKey) != 0)
    //         {
    //             byte[] pk = ar.PublicKeyOrToken.GetBlobBytes(reader);
    //             data.PublicKey = pk;
    //             if (pk.Length != 0)
    //             {
    //                 // AssemblyName will automatically compute the PKT on demand but given that we're doing all this work and caching it, we might
    //                 // as well do this now.
    //                 data.PublicKeyToken = pk.ComputePublicKeyToken();
    //             }
    //         }
    //         else
    //         {
    //             data.PublicKeyToken = ar.PublicKeyOrToken.GetBlobBytes(reader);
    //         }

    //         assemblyReferences[index++] = data;
    //     }

    //     return assemblyReferences;
    // }

    // protected  override void IterateTypeForwards(TypeForwardHandler handler)
    // {
    //     MetadataReader reader = Reader;
    //     foreach (ExportedTypeHandle exportedTypeHandle in reader.ExportedTypes)
    //     {
    //         ExportedType exportedType = reader.GetExportedType(exportedTypeHandle);
    //         if (!exportedType.IsForwarder)
    //             continue;

    //         EntityHandle implementation = exportedType.Implementation;
    //         if (implementation.Kind != HandleKind.AssemblyReference) // This check also weeds out nested types. This is intentional.
    //             continue;

    //         RoAssembly redirectedAssembly = ((AssemblyReferenceHandle)implementation).ResolveToAssemblyOrExceptionAssembly(GetEcmaManifestModule());
    //         ReadOnlySpan<byte> ns = exportedType.Namespace.AsReadOnlySpan(reader);
    //         ReadOnlySpan<byte> name = exportedType.Name.AsReadOnlySpan(reader);
    //         handler(redirectedAssembly, ns, name);
    //     }
    // }

    public get Reader(): MetadataReader {
        return this._manifestModule.Reader;
    }

    private get AssemblyDefinition(): AssemblyDefinition {
        return this._neverAccessThisExceptThroughAssemblyDefinitionProperty;
    }

    // [DebuggerBrowsable(DebuggerBrowsableState.Never)]  // Block from debugger watch windows so they don't AV the debugged process.
    protected override ComputeNameData(): AssemblyNameData {
        const reader = this.Reader;
        const ad = this.AssemblyDefinition;
        const data = new AssemblyNameData();
        data.Name = ad.Name.GetString(reader);
        data.Version = ad.Version;
        data.CultureName = ad.Culture.GetStringOrNull(reader) ?? "";

        const pk = ad.PublicKey.GetBlobBytes(reader);
        data.PublicKey = pk;
        if (pk.length != 0) {
            // AssemblyName will automatically compute the PKT on demand but given that we're doing all this work and caching it, we might
            // as well do this now.
            data.PublicKeyToken = ComputePublicKeyToken(pk);
        }

        const anFlagsAndContentType = ConvertAssemblyFlagsToAssemblyNameFlags(ad.Flags) | AssemblyNameFlags.PublicKey;
        data.Flags = ExtractAssemblyNameFlags(anFlagsAndContentType);

        // We've finished setting the AssemblyName properties that actually pertain to binding and the Ecma-355
        // concept of an assembly name.
        //
        // The rest of the properties are properties historically set by the runtime Reflection and thumbtacked
        // onto the AssemblyName object in the CLR tradition of treating AssemblyName as a dumping ground for all
        // kinds of info. Nevertheless, some of this info is potentially useful and not exposed elsewhere on Assembly
        // so we'll be nice and set it.
        data.HashAlgorithm = ad.HashAlgorithm;
        data.ContentType = ExtractAssemblyContentType(anFlagsAndContentType);

        // ManifestModule.GetPEKind(out PortableExecutableKinds peKind, out ImageFileMachine machine);
        // Hardcoding the values here because we don't have a way to get them from the manifest module.
        // TODO : fix this
        let peKind!: PortableExecutableKinds;
        let machine!: ImageFileMachine;
        if ("test" === "test") {
            machine = ImageFileMachine.I386;
            peKind = PortableExecutableKinds.ILOnly;
        }

        switch (machine) {
            case ImageFileMachine.AMD64:
                data.ProcessorArchitecture = ProcessorArchitecture.Amd64;
                break;

            case ImageFileMachine.ARM:
                data.ProcessorArchitecture = ProcessorArchitecture.Arm;
                break;

            case ImageFileMachine.IA64:
                data.ProcessorArchitecture = ProcessorArchitecture.IA64;
                break;

            case ImageFileMachine.I386:
                if ((peKind & PortableExecutableKinds.Required32Bit) != 0)
                    data.ProcessorArchitecture = ProcessorArchitecture.X86;
                else
                    data.ProcessorArchitecture = ProcessorArchitecture.MSIL;
                break;

            default:
                // No real precedent for what to do here - CLR will never get as far as giving you an Assembly object
                // if the PE file specifies an unsupported machine. Since this Reflection implementation is a metadata inspection
                // layer, and the library will never make any decisions based on this value, throwing isn't really the best response here.
                data.ProcessorArchitecture = ProcessorArchitecture.None;
                break;
        }
        return data;
    }

    //=========================================================================================================
    // Modules
    public override get ModuleResolve(): ModuleResolveEventHandler | undefined {
        //return this._moduleResolve;
        throw new Error("Not implemented");
    }

    protected override  LoadModule(moduleName: string, containsMetadata: boolean): RoModule {
        const peStream = this.FindModuleNextToAssembly(moduleName);
        if (peStream != undefined)
            return this.CreateModule(peStream, containsMetadata);

        const moduleFromEvent = this.ModuleResolve?.(this, new ResolveEventArgs(moduleName));
        if (moduleFromEvent != undefined) {
            const roModuleFromEvent = moduleFromEvent as RoModule;
            if (!(roModuleFromEvent !== undefined && roModuleFromEvent.Loader == this.Loader)) {
                Throw.FileLoadException(`ModuleResolveEventReturnedExternalModule`);
            }
            return roModuleFromEvent;
        }

        Throw.FileNotFoundException(`.FileNotFoundModule, ${moduleName}`);
    }

    // [UnconditionalSuppressMessage("SingleFile", "IL3000: Avoid accessing Assembly file path when publishing as a single file",
    //     Justification = "The code has a fallback using a ModuleResolveEventHandler")]
    private FindModuleNextToAssembly(moduleName: string): Stream | undefined {
        // Assembly containingAssembly = this;
        // string location = containingAssembly.Location;
        // if (string.IsNullOrEmpty(location))
        //     return undefined;
        // string? directoryPath = Path.GetDirectoryName(location);
        // string modulePath = Path.Combine(directoryPath!, moduleName);
        // if (File.Exists(modulePath))
        //     return File.OpenRead(modulePath);

        // return undefined;
        throw new Error("Not implemented");
    }

    protected override CreateModule(peStream: Stream, containsMetadata: boolean): RoModule {
        // string location = RoModule.FullyQualifiedNameForModulesLoadedFromByteArrays;
        // if (peStream is FileStream fs)
        // {
        //     location = fs.Name;
        // }

        // if (!containsMetadata)
        // {
        //     peStream.Close();
        //     return new RoResourceModule(this, location);
        // }

        // PEReader peReader = new PEReader(peStream);
        // Loader.RegisterForDisposal(peReader);
        // return new EcmaModule(this, location, peReader, peReader.GetMetadataReader());
        throw new Error("Not implemented");
    }

    protected override  GetAssemblyFileInfosFromManifest(includeManifestModule: boolean, includeResourceModules: boolean): Array<AssemblyFileInfo> {
        // const reader = this.Reader;
        // if (includeManifestModule) {
        //     yield return new AssemblyFileInfo(reader.GetModuleDefinition().Name.GetString(reader), true, 0);
        // }

        // for (const h of reader.AssemblyFiles) {
        //     const af = h.GetAssemblyFile(reader);
        //     if (includeResourceModules || af.ContainsMetadata) {
        //         yield return new AssemblyFileInfo(af.Name.GetString(reader), af.ContainsMetadata, h.GetToken().GetTokenRowNumber());
        //     }
        // }
        throw new Error("Not implemented");
    }
}