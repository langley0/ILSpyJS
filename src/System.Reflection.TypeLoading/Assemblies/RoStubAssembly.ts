import { RoAssembly } from "./RoAssembly";

export abstract class RoStubAssembly extends RoAssembly
{
    public constructor() { super(null!, 0); }
    // public sealed override string Location => throw null!;
    // public sealed override MethodInfo EntryPoint => throw null!;
    // public sealed override string ImageRuntimeVersion => throw null!;
    // public sealed override bool IsDynamic => throw null!;
    // public sealed override event ModuleResolveEventHandler? ModuleResolve { add { throw null!; } remove { throw null!; } }
    // public sealed override IEnumerable<CustomAttributeData> CustomAttributes => throw null!;
    // public sealed override ManifestResourceInfo? GetManifestResourceInfo(string resourceName) => throw null!;
    // public sealed override string[] GetManifestResourceNames() => throw null!;
    // public sealed override Stream GetManifestResourceStream(string name) => throw null!;
    // protected sealed override AssemblyNameData[] ComputeAssemblyReferences() => throw null!;
    // protected sealed override AssemblyNameData ComputeNameData() => throw null!;
    // internal sealed override RoModule GetRoManifestModule() => throw null!;
    // protected sealed override void IterateTypeForwards(TypeForwardHandler handler) => throw null!;
    // protected sealed override RoModule LoadModule(string moduleName, bool containsMetadata) => throw null!;
    // protected sealed override IEnumerable<AssemblyFileInfo> GetAssemblyFileInfosFromManifest(bool includeManifestModule, bool includeResourceModules) => throw null!;
    // protected sealed override RoModule CreateModule(Stream peStream, bool containsMetadata) => throw null!;
}