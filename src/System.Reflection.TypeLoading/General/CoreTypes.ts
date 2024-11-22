// namespace System.Reflection.TypeLoading
import { MetadataLoadContext } from "System.Reflection";
import { CoreType, RoType } from "System.Reflection.TypeLoading";

export class CoreTypes {
    private readonly _coreTypes: (RoType | undefined)[]
    private readonly _exceptions: (Error | undefined)[]

    public constructor(loader: MetadataLoadContext, coreAssemblyName?: string) {
        const numCoreTypes = CoreType.NumCoreTypes;
        const coreTypes = new Array<RoType | undefined>(numCoreTypes);
        const exceptions = new Array<Error | undefined>(numCoreTypes);
        const coreAssembly = loader.TryGetCoreAssembly(coreAssemblyName);
        if (coreAssembly == undefined) {
            // If the core assembly was not found, don't continue.
            throw new Error("Core assembly not found");
        }
        else {
            for (let i = 0; i < numCoreTypes; i++) {
                const { ns, name } = CoreType.GetFullName(i);
                const type: RoType | undefined = coreAssembly.GetTypeCore(ns, name, false);
                coreTypes[i] = type;
                if (type == undefined) {
                    exceptions[i] = new Error("Core type not found");
                }
            }
        }
        this._coreTypes = coreTypes;
        this._exceptions = exceptions;
    }

    /// <summary>
    /// Returns undefined if the specific core type did not exist or could not be loaded. Call GetException(coreType) to get detailed info.
    /// </summary>
    public At(coreType: CoreType): RoType | undefined { return this._coreTypes[coreType]; }
    public GetException(coreType: CoreType): Error | undefined { return this._exceptions[coreType]; }
}