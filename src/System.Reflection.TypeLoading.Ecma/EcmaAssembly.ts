import { RoAssembly } from "System.Reflection.TypeLoading";
import { AssemblyNameData } from "System.Reflection.TypeLoading";
import { PEReader } from "System.Reflection.PortableExecutable";
import { MetadataReader } from "System.Reflection.Metadata";
import { MetadataLoadContext } from "System.Reflection.MetadataLoadContext";

export class EcmaAssembly extends RoAssembly {
    private readonly _location: string;
    // private readonly _manifestModule: EcmaModule;
    // private readonly  _neverAccessThisExceptThroughAssemblyDefinitionProperty: AssemblyDefinition;

    public constructor(loader: MetadataLoadContext, peReader: PEReader, reader: MetadataReader, location: string) {
        super(loader, reader.AssemblyFiles.Count)
        // assert(loader != undefined);
        // assert(peReader != undefined);
        // assert(reader != undefined);
        // assert(location != undefined);

        // this._location = location;
        // this._neverAccessThisExceptThroughAssemblyDefinitionProperty = reader.GetAssemblyDefinition();

        // this._manifestModule = new EcmaModule(this, location, peReader, reader);
        throw new Error("Not implemented");
    }

    // internal sealed override RoModule GetRoManifestModule() => _manifestModule;
    // internal EcmaModule GetEcmaManifestModule() => _manifestModule;

    // public sealed override MethodInfo? EntryPoint => GetEcmaManifestModule().ComputeEntryPoint(fileRefEntryPointAllowed: true);

    // public sealed override string ImageRuntimeVersion => Reader.MetadataVersion;
    // public sealed override bool IsDynamic => false;
    // public sealed override string Location => _location;

    // public sealed override IEnumerable<CustomAttributeData> CustomAttributes => AssemblyDefinition.GetCustomAttributes().ToTrueCustomAttributes(GetEcmaManifestModule());

    // protected sealed override AssemblyNameData[] ComputeAssemblyReferences()
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

    // protected sealed override void IterateTypeForwards(TypeForwardHandler handler)
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

    // internal MetadataReader Reader => _manifestModule.Reader;

    // private ref readonly AssemblyDefinition AssemblyDefinition { get { Loader.DisposeCheck(); return ref _neverAccessThisExceptThroughAssemblyDefinitionProperty; } }
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)]  // Block from debugger watch windows so they don't AV the debugged process.


    protected override ComputeNameData(): AssemblyNameData {
        throw new Error("Not implemented");
        // const reader = this.Reader;
        // AssemblyDefinition ad = AssemblyDefinition;
        // AssemblyNameData data = new AssemblyNameData
        // {
        //     Name = ad.Name.GetString(reader),
        //     Version = ad.Version,
        //     CultureName = ad.Culture.GetStringOrNull(reader) ?? string.Empty
        // };
        // byte[] pk = ad.PublicKey.GetBlobBytes(reader);
        // data.PublicKey = pk;
        // if (pk.Length != 0)
        // {
        //     // AssemblyName will automatically compute the PKT on demand but given that we're doing all this work and caching it, we might
        //     // as well do this now.
        //     data.PublicKeyToken = pk.ComputePublicKeyToken();
        // }

        // AssemblyNameFlags anFlagsAndContentType = ad.Flags.ToAssemblyNameFlags() | AssemblyNameFlags.PublicKey;
        // data.Flags = anFlagsAndContentType.ExtractAssemblyNameFlags();

        // // We've finished setting the AssemblyName properties that actually pertain to binding and the Ecma-355
        // // concept of an assembly name.
        // //
        // // The rest of the properties are properties historically set by the runtime Reflection and thumbtacked
        // // onto the AssemblyName object in the CLR tradition of treating AssemblyName as a dumping ground for all
        // // kinds of info. Nevertheless, some of this info is potentially useful and not exposed elsewhere on Assembly
        // // so we'll be nice and set it.
        // data.HashAlgorithm = ad.HashAlgorithm.ToConfigurationAssemblyHashAlgorithm();
        // data.ContentType = anFlagsAndContentType.ExtractAssemblyContentType();

        // ManifestModule.GetPEKind(out PortableExecutableKinds peKind, out ImageFileMachine machine);
        // switch (machine)
        // {
        //     case ImageFileMachine.AMD64:
        //         data.ProcessorArchitecture = ProcessorArchitecture.Amd64;
        //         break;

        //     case ImageFileMachine.ARM:
        //         data.ProcessorArchitecture = ProcessorArchitecture.Arm;
        //         break;

        //     case ImageFileMachine.IA64:
        //         data.ProcessorArchitecture = ProcessorArchitecture.IA64;
        //         break;

        //     case ImageFileMachine.I386:
        //         if ((peKind & PortableExecutableKinds.Required32Bit) != 0)
        //             data.ProcessorArchitecture = ProcessorArchitecture.X86;
        //         else
        //             data.ProcessorArchitecture = ProcessorArchitecture.MSIL;
        //         break;

        //     default:
        //         // No real precedent for what to do here - CLR will never get as far as giving you an Assembly object
        //         // if the PE file specifies an unsupported machine. Since this Reflection implementation is a metadata inspection
        //         // layer, and the library will never make any decisions based on this value, throwing isn't really the best response here.
        //         data.ProcessorArchitecture = ProcessorArchitecture.None;
        //         break;
        // }
        // return data;
    }
}