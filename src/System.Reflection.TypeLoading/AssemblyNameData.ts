import { AssemblyName } from "System.Reflection";

// const AssemblyHashAlgorithm = global::System.Configuration.Assemblies.AssemblyHashAlgorithm;

//
// Collects together everything needed to generate an AssemblyName quickly. We don't want to do all the metadata analysis every time
// GetName() is called.
//
export class AssemblyNameData {
    // public AssemblyNameFlags Flags;
    // public string? Name;
    // public Version? Version;
    // public string? CultureName;
    // public byte[]? PublicKey;
    // public byte[]? PublicKeyToken;
    // public AssemblyContentType ContentType;
    // public AssemblyHashAlgorithm HashAlgorithm;
    // public ProcessorArchitecture ProcessorArchitecture;

    // Creates a newly allocated AssemblyName that is safe to return out of an api.
    public CreateAssemblyName(): AssemblyName {
        const an = new AssemblyName();

        // an.Flags = this.Flags;
        // an.Name = this.Name;
        // an.Version = this.Version,
        // an.CultureName = this.CultureName,
        // an.ContentType = this.ContentType,
        // an.HashAlgorithm = this.HashAlgorithm,
        // an.ProcessorArchitecture = this.ProcessorArchitecture

        // // Yes, *we* have to clone the array. AssemblyName.SetPublicKey() violates framework guidelines and doesn't make a copy.
        // an.SetPublicKey(this.PublicKey.CloneArray());
        // an.SetPublicKeyToken(this.PublicKeyToken.CloneArray());
        return an;
    }
}