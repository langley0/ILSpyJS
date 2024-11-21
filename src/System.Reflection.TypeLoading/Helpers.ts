import { AssemblyName, AssemblyNameFlags, AssemblyFlags, AssemblyContentType } from "System.Reflection";

export function ComputePublicKeyToken(pkt: Uint8Array): Uint8Array | undefined {
    // @TODO - https://github.com/dotnet/corefxlab/issues/2447 - This is not the best way to compute the PKT as AssemblyName
    // throws if the PK isn't a valid PK blob. That's not something we should block a metadata inspection tool for so we
    // should compute the PKT ourselves as soon as we can convince the libraries analyzers to let us use SHA1.
    const an = new AssemblyName();
    an.SetPublicKey(pkt);
    return an.GetPublicKeyToken();
}

export function ConvertAssemblyFlagsToAssemblyNameFlags(assemblyFlags: AssemblyFlags): AssemblyNameFlags {
    let assemblyNameFlags = AssemblyNameFlags.None;

    if ((assemblyFlags & AssemblyFlags.Retargetable) != 0) {
        assemblyNameFlags |= AssemblyNameFlags.Retargetable;
    }

    return assemblyNameFlags;
}

export function ExtractAssemblyNameFlags(combinedFlags: AssemblyNameFlags): AssemblyNameFlags {
    return combinedFlags & 0xFFFFF10F;
}

export function ExtractAssemblyContentType(flags: AssemblyNameFlags): AssemblyContentType {
    return (((flags) >> 9) & 0x7);
}