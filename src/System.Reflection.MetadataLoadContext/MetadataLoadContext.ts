import { Throw } from 'System';
import { MemoryStream, Stream } from 'System.IO';
import {
    RoAssembly,
    RoAssemblyName,
    AssemblyNameData
} from 'System.Reflection.TypeLoading';
import { EcmaAssembly } from 'System.Reflection.TypeLoading.Ecma';
import { PEReader } from 'System.Reflection.PortableExecutable';


export class MetadataLoadContext {
    // This maintains the canonical list of Assembly instances for a given def name. Each defname can only appear
    // once in the list and its appearance prevents further assemblies with the same identity from loading unless the Mvids's match.
    // Null entries do *not* appear here.
    private readonly _loadedAssemblies = new Map<RoAssemblyName, RoAssembly>();

    public static FromBuffer(buffer: Uint8Array): RoAssembly {
        const stream = new MemoryStream(buffer);
        const context = new MetadataLoadContext();
        return context.LoadFromStreamCore(stream);
    }

    private LoadFromStreamCore(peStream: Stream): RoAssembly {
        const peReader = PEReader.FromStream(peStream);
        if (peReader.HasMetadata == false)
            Throw.BadImageFormatException('NoMetadataInPeImage');

        const location = ""; // location is not available for streams, because it should be a file stream
        const reader = peReader.GetMetadataReader();
        const candidate: RoAssembly = new EcmaAssembly(this, peReader, reader, location);
        const defNameData: AssemblyNameData = candidate.GetAssemblyNameDataNoCopy();
        // const pkt = defNameData.PublicKeyToken ?? new Uint8Array();
        // if (pkt.Length == 0 && defNameData.PublicKey != undefined && defNameData.PublicKey.Length != 0) {
        //     pkt = defNameData.PublicKey.ComputePublicKeyToken()!;
        // }
        // const defName = new RoAssemblyName(defNameData.Name, defNameData.Version, defNameData.CultureName, pkt, defNameData.Flags);

        // const winner = this._loadedAssemblies.get(defName);

        // if (winner == candidate) {
        //     // We won the race.
        //     this.RegisterForDisposal(peReader);

        //     // We do not add to the _binds list because the binding list is only for assemblies that have been resolved through
        //     // the Resolve method. This allows the resolver to have complete control over selecting the appropriate assembly
        //     // based on Version, CultureName and PublicKeyToken.

        //     return winner;
        // }
        // else {
        //     // We lost the race but check for a Mvid mismatch.
        //     if (candidate.ManifestModule.ModuleVersionId != winner.ManifestModule.ModuleVersionId) {
        //         Throw.FileLoadException('FileLoadDuplicateAssemblies', defName);
        //     }
        // }

        // return winner;
        throw new Error("Not implemented");


    }
}