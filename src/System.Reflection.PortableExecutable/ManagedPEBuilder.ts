import { Throw } from 'System';
import {
    Blob,
    BlobContentId,
    BlobBuilder,
    MetadataRootBuilder,
    MethodDefinitionHandle,
} from 'System.Reflection.Metadata';
import { PEBuilder } from './PEBuilder';
import { PEHeaderBuilder } from './PEHeaderBuilder';
import { ManagedTextSection } from './ManagedTextSection';
import { CorFlags } from './CorFlags';
import { PEDirectoriesBuilder } from './PEDirectoriesBuilder';
import { ResourceSectionBuilder } from './ResourceSectionBuilder';
import { DebugDirectoryBuilder } from './DebugDirectory/DebugDirectoryBuilder';

export class ManagedPEBuilder extends PEBuilder {
    public ManagedResourcesDataAlignment = ManagedTextSection.ManagedResourcesDataAlignment;
    public MappedFieldDataAlignment = ManagedTextSection.MappedFieldDataAlignment;

    private static readonly DefaultStrongNameSignatureSize = 128;

    private readonly TextSectionName = ".text";
    private readonly ResourceSectionName = ".rsrc";
    private readonly RelocationSectionName = ".reloc";

    private readonly _peDirectoriesBuilder: PEDirectoriesBuilder;
    private readonly _metadataRootBuilder: MetadataRootBuilder;
    private readonly _ilStream: BlobBuilder;
    private readonly _mappedFieldDataOpt?: BlobBuilder;
    private readonly _managedResourcesOpt?: BlobBuilder;
    private readonly _nativeResourcesOpt?: ResourceSectionBuilder;
    private readonly _strongNameSignatureSize: number;
    private readonly _entryPointOpt: MethodDefinitionHandle;
    private readonly _debugDirectoryBuilderOpt?: DebugDirectoryBuilder;
    private readonly _corFlags: CorFlags;

    private _lazyEntryPointAddress?: number;
    private _lazyStrongNameSignature?: Blob;

    public constructor(
        header: PEHeaderBuilder,
        metadataRootBuilder: MetadataRootBuilder,
        ilStream: BlobBuilder,
        mappedFieldData: BlobBuilder | undefined = undefined,
        managedResources: BlobBuilder | undefined = undefined,
        nativeResources: ResourceSectionBuilder | undefined = undefined,
        debugDirectoryBuilder: DebugDirectoryBuilder | undefined = undefined,
        strongNameSignatureSize: number = ManagedPEBuilder.DefaultStrongNameSignatureSize,
        entryPoint: MethodDefinitionHandle = new MethodDefinitionHandle(),
        flags: CorFlags = CorFlags.ILOnly,
        deterministicIdProvider: ((blobs: Blob[]) => BlobContentId) | undefined = undefined,
    ) {
        super(header, deterministicIdProvider);

        if (strongNameSignatureSize < 0) {
            Throw.ArgumentOutOfRange("strongNameSignatureSize");
        }

        this._metadataRootBuilder = metadataRootBuilder;
        this._ilStream = ilStream;
        this._mappedFieldDataOpt = mappedFieldData;
        this._managedResourcesOpt = managedResources;
        this._nativeResourcesOpt = nativeResources;
        this._strongNameSignatureSize = strongNameSignatureSize;
        this._entryPointOpt = entryPoint;
        this._debugDirectoryBuilderOpt = debugDirectoryBuilder ?? this.CreateDefaultDebugDirectoryBuilder();
        this._corFlags = flags;

        this._peDirectoriesBuilder = new PEDirectoriesBuilder();
    }

    private CreateDefaultDebugDirectoryBuilder(): DebugDirectoryBuilder | undefined {
        if (this.IsDeterministic) {
            var builder = new DebugDirectoryBuilder();
            builder.AddReproducibleEntry();
            return builder;
        }

        return undefined;
    }

    // protected override ImmutableArray<Section> CreateSections()
    // {
    //     var builder = ImmutableArray.CreateBuilder<Section>(3);
    //     builder.Add(new Section(TextSectionName, SectionCharacteristics.MemRead | SectionCharacteristics.MemExecute | SectionCharacteristics.ContainsCode));

    //     if (_nativeResourcesOpt != null)
    //     {
    //         builder.Add(new Section(ResourceSectionName, SectionCharacteristics.MemRead | SectionCharacteristics.ContainsInitializedData));
    //     }

    //     if (Header.Machine == Machine.I386 || Header.Machine == 0)
    //     {
    //         builder.Add(new Section(RelocationSectionName, SectionCharacteristics.MemRead | SectionCharacteristics.MemDiscardable | SectionCharacteristics.ContainsInitializedData));
    //     }

    //     return builder.ToImmutable();
    // }

    // protected override BlobBuilder SerializeSection(string name, SectionLocation location) =>
    //     name switch
    //     {
    //         TextSectionName => SerializeTextSection(location),
    //         ResourceSectionName => SerializeResourceSection(location),
    //         RelocationSectionName => SerializeRelocationSection(location),
    //         _ => throw new ArgumentException(SR.Format(SR.UnknownSectionName, name), nameof(name)),
    //     };

    // private BlobBuilder SerializeTextSection(SectionLocation location)
    // {
    //     var sectionBuilder = new BlobBuilder();
    //     var metadataBuilder = new BlobBuilder();

    //     var metadataSizes = _metadataRootBuilder.Sizes;

    //     var textSection = new ManagedTextSection(
    //         imageCharacteristics: Header.ImageCharacteristics,
    //         machine: Header.Machine,
    //         ilStreamSize: _ilStream.Count,
    //         metadataSize: metadataSizes.MetadataSize,
    //         resourceDataSize: _managedResourcesOpt?.Count ?? 0,
    //         strongNameSignatureSize: _strongNameSignatureSize,
    //         debugDataSize: _debugDirectoryBuilderOpt?.Size ?? 0,
    //         mappedFieldDataSize: _mappedFieldDataOpt?.Count ?? 0);

    //     int methodBodyStreamRva = location.RelativeVirtualAddress + textSection.OffsetToILStream;
    //     int mappedFieldDataStreamRva = location.RelativeVirtualAddress + textSection.CalculateOffsetToMappedFieldDataStream();
    //     _metadataRootBuilder.Serialize(metadataBuilder, methodBodyStreamRva, mappedFieldDataStreamRva);

    //     DirectoryEntry debugDirectoryEntry;
    //     BlobBuilder? debugTableBuilderOpt;
    //     if (_debugDirectoryBuilderOpt != null)
    //     {
    //         int debugDirectoryOffset = textSection.ComputeOffsetToDebugDirectory();
    //         debugTableBuilderOpt = new BlobBuilder(_debugDirectoryBuilderOpt.TableSize);
    //         _debugDirectoryBuilderOpt.Serialize(debugTableBuilderOpt, location, debugDirectoryOffset);

    //         // Only the size of the fixed part of the debug table goes here.
    //         debugDirectoryEntry = new DirectoryEntry(
    //             location.RelativeVirtualAddress + debugDirectoryOffset,
    //             _debugDirectoryBuilderOpt.TableSize);
    //     }
    //     else
    //     {
    //         debugTableBuilderOpt = null;
    //         debugDirectoryEntry = default(DirectoryEntry);
    //     }

    //     _lazyEntryPointAddress = textSection.GetEntryPointAddress(location.RelativeVirtualAddress);

    //     textSection.Serialize(
    //         sectionBuilder,
    //         location.RelativeVirtualAddress,
    //         _entryPointOpt.IsNil ? 0 : MetadataTokens.GetToken(_entryPointOpt),
    //         _corFlags,
    //         Header.ImageBase,
    //         metadataBuilder,
    //         _ilStream,
    //         _mappedFieldDataOpt,
    //         _managedResourcesOpt,
    //         debugTableBuilderOpt,
    //         out _lazyStrongNameSignature);

    //     _peDirectoriesBuilder.AddressOfEntryPoint = _lazyEntryPointAddress;
    //     _peDirectoriesBuilder.DebugTable = debugDirectoryEntry;
    //     _peDirectoriesBuilder.ImportAddressTable = textSection.GetImportAddressTableDirectoryEntry(location.RelativeVirtualAddress);
    //     _peDirectoriesBuilder.ImportTable = textSection.GetImportTableDirectoryEntry(location.RelativeVirtualAddress);
    //     _peDirectoriesBuilder.CorHeaderTable = textSection.GetCorHeaderDirectoryEntry(location.RelativeVirtualAddress);

    //     return sectionBuilder;
    // }

    // private BlobBuilder SerializeResourceSection(SectionLocation location)
    // {
    //     Debug.Assert(_nativeResourcesOpt != null);

    //     var sectionBuilder = new BlobBuilder();
    //     _nativeResourcesOpt.Serialize(sectionBuilder, location);

    //     _peDirectoriesBuilder.ResourceTable = new DirectoryEntry(location.RelativeVirtualAddress, sectionBuilder.Count);
    //     return sectionBuilder;
    // }

    // private BlobBuilder SerializeRelocationSection(SectionLocation location)
    // {
    //     var sectionBuilder = new BlobBuilder();
    //     WriteRelocationSection(sectionBuilder, Header.Machine, _lazyEntryPointAddress);

    //     _peDirectoriesBuilder.BaseRelocationTable = new DirectoryEntry(location.RelativeVirtualAddress, sectionBuilder.Count);
    //     return sectionBuilder;
    // }

    // private static void WriteRelocationSection(BlobBuilder builder, Machine machine, int entryPointAddress)
    // {
    //     Debug.Assert(builder.Count == 0);

    //     builder.WriteUInt32((((uint)entryPointAddress + 2) / 0x1000) * 0x1000);
    //     builder.WriteUInt32((machine == Machine.IA64) ? 14u : 12u);
    //     uint offsetWithinPage = ((uint)entryPointAddress + 2) % 0x1000;
    //     uint relocType = (machine == Machine.Amd64 || machine == Machine.IA64 || machine == Machine.Arm64) ? 10u : 3u;
    //     ushort s = (ushort)((relocType << 12) | offsetWithinPage);
    //     builder.WriteUInt16(s);
    //     if (machine == Machine.IA64)
    //     {
    //         builder.WriteUInt32(relocType << 12);
    //     }

    //     builder.WriteUInt16(0); // next chunk's RVA
    // }

    // protected internal override PEDirectoriesBuilder GetDirectories()
    // {
    //     return _peDirectoriesBuilder;
    // }

    // public void Sign(BlobBuilder peImage, Func<IEnumerable<Blob>, byte[]> signatureProvider)
    // {
    //     if (peImage is null)
    //     {
    //         Throw.ArgumentNull(nameof(peImage));
    //     }
    //     if (signatureProvider is null)
    //     {
    //         Throw.ArgumentNull(nameof(signatureProvider));
    //     }

    //     Sign(peImage!, _lazyStrongNameSignature, signatureProvider!);
    // }
}