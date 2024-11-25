import { AssemblyNameData } from "System.Reflection.TypeLoading/AssemblyNameData";
import { RoAssembly } from "./RoAssembly";
import { MethodInfo, ModuleResolveEventHandler, } from "System.Reflection";
import { Stream } from "System.IO";
import { RoModule } from "System.Reflection.TypeLoading/Modules/RoModule";
import { AssemblyFileInfo } from "./AssemblyFileInfo";


export abstract class RoStubAssembly extends RoAssembly {
    public constructor() { super(null!, 0); }
    // public override get Location(): string { throw null!; }
    // public override  EntryPoint(): MethodInfo { throw null!; }
    // public override  ImageRuntimeVersion(): string { throw null!; }
    // public override  IsDynamic(): boolean { throw null!; }
    public override get ModuleResolve(): ModuleResolveEventHandler | undefined { throw null!; }
    // public  override IEnumerable<CustomAttributeData> CustomAttributes { throw null!; }
    // public override GetManifestResourceInfo(resourceName: string): ManifestResourceInfo | undefined { throw null!; }
    // public override GetManifestResourceNames(): string[] { throw null!; }
    // public override  GetManifestResourceStream(name: string): Stream { throw null!; }
    // protected override ComputeAssemblyReferences(): AssemblyNameData[] { throw null!; }
    protected override  ComputeNameData(): AssemblyNameData { throw null!; }
    public override  GetRoManifestModule(): RoModule { throw null!; }
    // protected override  IterateTypeForwards(handler: TypeForwardHandler): void { throw null!; }
    protected override  LoadModule(moduleName: string, containsMetadata: boolean): RoModule { throw null!; }
    protected override GetAssemblyFileInfosFromManifest(includeManifestModule: boolean, includeResourceModules: boolean): Array<AssemblyFileInfo> { throw null!; }
    protected override  CreateModule(peStream: Stream, containsMetadata: boolean): RoModule { throw null!; }
}