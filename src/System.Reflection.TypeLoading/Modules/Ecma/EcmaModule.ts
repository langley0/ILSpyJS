// namespace System.Reflection.TypeLoading.Ecma

import assert from "assert";
import { RoModule } from "System.Reflection.TypeLoading";
import { EcmaAssembly, GuardedPEReader } from "System.Reflection.TypeLoading.Ecma";
import { MetadataReader } from "System.Reflection.Metadata";
import { ModuleDefinition } from "System.Reflection.Metadata";
import { PEReader } from "System.Reflection.PortableExecutable";
import { Guid } from "System/Guid";

export class EcmaModule extends RoModule {
    private static readonly ModuleTypeToken = 0x02000001;

    private readonly _assembly: EcmaAssembly;
    private readonly _guardedPEReader: GuardedPEReader;

    //
    // "fullyQualifiedName" determines the string returned by Module.FullyQualifiedName. It is typically set to the full path of the
    // file on disk containing the module.
    //
    public constructor(assembly: EcmaAssembly, fullyQualifiedName: string, peReader: PEReader, reader: MetadataReader) {
        super(fullyQualifiedName);

        assert(assembly != undefined);
        assert(fullyQualifiedName != undefined);
        assert(peReader != undefined);
        assert(reader != undefined);

        this._assembly = assembly;
        this._guardedPEReader = new GuardedPEReader(assembly.Loader, peReader, reader);
        this._neverAccessThisExceptThroughModuleDefinitionProperty = reader.GetModuleDefinition();
    }

    // public  override RoAssembly GetRoAssembly() => _assembly;
    // public EcmaAssembly GetEcmaAssembly() => _assembly;

    // public  override bool IsResource() => false;
    // public  override int MDStreamVersion => throw new NotSupportedException(SR.NotSupported_MDStreamVersion);
    // public  override int MetadataToken => 0x00000001; // The Module Table is exactly 1 record long so the token is always mdtModule | 0x000001
    public  override get ModuleVersionId(): Guid { return this.Reader.GetGuid(this.ModuleDefinition.Mvid); }
    // public  override string ScopeName => ModuleDefinition.Name.GetString(Reader);

    // public  override IEnumerable<CustomAttributeData> CustomAttributes => ModuleDefinition.GetCustomAttributes().ToTrueCustomAttributes(this);

    // public MethodInfo? ComputeEntryPoint(bool fileRefEntryPointAllowed)
    // {
    //     PEHeaders peHeaders = PEReader.PEHeaders;
    //     CorHeader corHeader = peHeaders.CorHeader!;

    //     if ((corHeader.Flags & CorFlags.NativeEntryPoint) != 0)
    //         return undefined;

    //     int entryPointToken = corHeader.EntryPointTokenOrRelativeVirtualAddress;
    //     Handle handle = entryPointToken.ToHandle();
    //     if (handle.IsNil)
    //         return undefined;

    //     HandleKind kind = handle.Kind;
    //     switch (kind)
    //     {
    //         case HandleKind.MethodDefinition:
    //             {
    //                 MethodDefinitionHandle mdh = (MethodDefinitionHandle)handle;
    //                 return mdh.ResolveMethod<MethodInfo>(this, default);
    //             }

    //         case HandleKind.AssemblyFile:
    //             {
    //                 if (!fileRefEntryPointAllowed)
    //                     throw new BadImageFormatException();

    //                 MetadataReader reader = Reader;
    //                 string moduleName = ((AssemblyFileHandle)handle).GetAssemblyFile(reader).Name.GetString(reader);
    //                 EcmaModule? roModule = (EcmaModule?)(Assembly.GetModule(moduleName));
    //                 return roModule!.ComputeEntryPoint(fileRefEntryPointAllowed: false);
    //             }

    //         default:
    //             throw new BadImageFormatException();
    //     }
    // }

    // public  override void GetPEKind(out PortableExecutableKinds peKind, out ImageFileMachine machine)
    // {
    //     PEHeaders peHeaders = PEReader.PEHeaders;
    //     PEMagic peMagic = peHeaders.PEHeader!.Magic;
    //     Machine coffMachine = peHeaders.CoffHeader.Machine;
    //     CorFlags corFlags = peHeaders.CorHeader!.Flags;

    //     peKind = default;
    //     if ((corFlags & CorFlags.ILOnly) != 0)
    //         peKind |= PortableExecutableKinds.ILOnly;

    //     if ((corFlags & CorFlags.Prefers32Bit) != 0)
    //         peKind |= PortableExecutableKinds.Preferred32Bit;
    //     else if ((corFlags & CorFlags.Requires32Bit) != 0)
    //         peKind |= PortableExecutableKinds.Required32Bit;

    //     if (peMagic == PEMagic.PE32Plus)
    //         peKind |= PortableExecutableKinds.PE32Plus;

    //     machine = (ImageFileMachine)coffMachine;
    // }

    // //
    // // Search for members on <Module> type.
    // //
    // public  override FieldInfo? GetField(string name, BindingFlags bindingAttr) => GetModuleType().GetField(name, bindingAttr);
    // public  override FieldInfo[] GetFields(BindingFlags bindingFlags) => GetModuleType().GetFields(bindingFlags);
    // public  override MethodInfo[] GetMethods(BindingFlags bindingFlags) => GetModuleType().GetMethods(bindingFlags);
    // protected  override MethodInfo? GetMethodImpl(string name, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers) => GetModuleType().InternalGetMethodImpl(name, bindingAttr, binder, callConvention, types, modifiers);
    // private EcmaDefinitionType GetModuleType() => ModuleTypeToken.ToTypeDefinitionHandle().ResolveTypeDef(this);

    // public  override Type[] GetTypes()
    // {
    //     // Note: we don't expect this process to generate any loader exceptions so no need to implement the ReflectionTypeLoadException
    //     // logic.

    //     EnsureTypeDefTableFullyFilled();
    //     return TypeDefTable.ToArray<Type>(skip: 1); // 0x02000001 is the <Module> type which is always skipped by this api.
    // }

    // public  override IEnumerable<RoType>? GetDefinedRoTypes()
    // {
    //     EnsureTypeDefTableFullyFilled();
    //     return TypeDefTable.EnumerateValues(skip: 1)!; // 0x02000001 is the <Module> type which is always skipped by this api.
    // }

    public get PEReader(): PEReader {
        return this._guardedPEReader.PEReader;
    }
    public get Reader(): MetadataReader {
        return this._guardedPEReader.Reader;
    }

    private get ModuleDefinition(): ModuleDefinition { return this._neverAccessThisExceptThroughModuleDefinitionProperty; } 
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)]  // Block from debugger watch windows so they don't AV the debugged process.
    private readonly _neverAccessThisExceptThroughModuleDefinitionProperty: ModuleDefinition;
}