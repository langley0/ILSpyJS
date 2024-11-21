import { Version } from "System";
import { AssemblyHashAlgorithm } from "System.Configuration.Assemblies";
import { 
    AssemblyName,
    AssemblyNameFlags,
    AssemblyContentType,
    ProcessorArchitecture
} from "System.Reflection";

// const AssemblyHashAlgorithm = global::System.Configuration.Assemblies.AssemblyHashAlgorithm;

//
// Collects together everything needed to generate an AssemblyName quickly. We don't want to do all the metadata analysis every time
// GetName() is called.
//
export class AssemblyNameData {
    public Flags: AssemblyNameFlags = AssemblyNameFlags.None;
    public Name?: string;
    public  Version? : Version;
    public CultureName? : string;
    public PublicKey? : Uint8Array;
    public PublicKeyToken?: Uint8Array;
    public  ContentType: AssemblyContentType = AssemblyContentType.Default;
    public  HashAlgorithm: AssemblyHashAlgorithm = AssemblyHashAlgorithm.None;
    public  ProcessorArchitecture: ProcessorArchitecture = ProcessorArchitecture.None;

    // Creates a newly allocated AssemblyName that is safe to return out of an api.
    public CreateAssemblyName(): AssemblyName {
        const an = new AssemblyName();

        an.Flags = this.Flags;
        an.Name = this.Name;
        an.Version = this.Version,
        an.CultureName = this.CultureName,
        an.ContentType = this.ContentType,
        an.HashAlgorithm = this.HashAlgorithm,
        an.ProcessorArchitecture = this.ProcessorArchitecture

        // Yes, *we* have to clone the array. AssemblyName.SetPublicKey() violates framework guidelines and doesn't make a copy.
        an.SetPublicKey(this.PublicKey?.slice());
        an.SetPublicKeyToken(this.PublicKeyToken?.slice());
        return an;
    }
}