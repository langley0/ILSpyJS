import assert from "assert";
import { Throw } from 'System';
import {
    Blob,
    BlobContentId,
    BlobBuilder,
    MethodDefinitionHandle,
    Machine,
} from 'System.Reflection.Metadata';
import {
    MetadataRootBuilder,
    MetadataTokens,
} from 'System.Reflection.Metadata.Ecma335';

import {
    PEBuilder, Section,
    PEHeaderBuilder,
    ManagedTextSection,
    CorFlags,
    PEDirectoriesBuilder,
    ResourceSectionBuilder,
    DebugDirectoryBuilder,
    DirectoryEntry,
    SectionLocation,
    SectionCharacteristics,
} from 'System.Reflection.PortableExecutable';

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
        entryPoint: MethodDefinitionHandle = MethodDefinitionHandle.FromRowId(0),
        flags: CorFlags = CorFlags.ILOnly,
        deterministicIdProvider: ((blobs: ArrayLike<Blob>) => BlobContentId) | undefined = undefined,
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
            const builder = new DebugDirectoryBuilder();
            builder.AddReproducibleEntry();
            return builder;
        }

        return undefined;
    }

    protected override CreateSections(): ArrayLike<Section> {
        const builder = new Array<Section>();
        builder.push(new Section(this.TextSectionName, SectionCharacteristics.MemRead | SectionCharacteristics.MemExecute | SectionCharacteristics.ContainsCode));

        if (this._nativeResourcesOpt != undefined) {
            builder.push(new Section(this.ResourceSectionName, SectionCharacteristics.MemRead | SectionCharacteristics.ContainsInitializedData));
        }

        if (this.Header.Machine == Machine.I386 || this.Header.Machine == 0) {
            builder.push(new Section(this.RelocationSectionName, SectionCharacteristics.MemRead | SectionCharacteristics.MemDiscardable | SectionCharacteristics.ContainsInitializedData));
        }

        return builder;
    }

    protected override  SerializeSection(name: string, location: SectionLocation): BlobBuilder {
        if (name == this.TextSectionName) {
            return this.SerializeTextSection(location);
        } else if (name == this.ResourceSectionName) {
            return this.SerializeResourceSection(location);
        }
        else if (name == this.RelocationSectionName) {
            return this.SerializeRelocationSection(location);
        }
        else {
            Throw.ArgumentException("UnknownSectionName", name);
        }
    }

    private SerializeTextSection(location: SectionLocation): BlobBuilder {
        const sectionBuilder = new BlobBuilder();
        const metadataBuilder = new BlobBuilder();

        const metadataSizes = this._metadataRootBuilder.Sizes;

        const textSection = new ManagedTextSection(
            this.Header.ImageCharacteristics,
            this.Header.Machine,
            this._ilStream.Count,
            metadataSizes.MetadataSize,
            this._managedResourcesOpt?.Count ?? 0,
            this._strongNameSignatureSize,
            this._debugDirectoryBuilderOpt?.Size ?? 0,
            this._mappedFieldDataOpt?.Count ?? 0);

        const methodBodyStreamRva = location.RelativeVirtualAddress + textSection.OffsetToILStream;
        const mappedFieldDataStreamRva = location.RelativeVirtualAddress + textSection.CalculateOffsetToMappedFieldDataStream();
        this._metadataRootBuilder.Serialize(metadataBuilder, methodBodyStreamRva, mappedFieldDataStreamRva);

        let debugDirectoryEntry: DirectoryEntry;
        let debugTableBuilderOpt: BlobBuilder | undefined = undefined;
        if (this._debugDirectoryBuilderOpt) {
            const debugDirectoryOffset = textSection.ComputeOffsetToDebugDirectory();
            debugTableBuilderOpt = new BlobBuilder(this._debugDirectoryBuilderOpt.TableSize);
            this._debugDirectoryBuilderOpt.Serialize(debugTableBuilderOpt, location, debugDirectoryOffset);

            // Only the size of the fixed part of the debug table goes here.
            debugDirectoryEntry = new DirectoryEntry(
                location.RelativeVirtualAddress + debugDirectoryOffset,
                this._debugDirectoryBuilderOpt.TableSize);
        }
        else {
            debugTableBuilderOpt = undefined;
            debugDirectoryEntry = DirectoryEntry.Empty;
        }

        this._lazyEntryPointAddress = textSection.GetEntryPointAddress(location.RelativeVirtualAddress);

        this._lazyStrongNameSignature = textSection.Serialize(
            sectionBuilder,
            location.RelativeVirtualAddress,
            this._entryPointOpt.IsNil ? 0 : MetadataTokens.GetToken(this._entryPointOpt.EntityHandle),
            this._corFlags,
            this.Header.ImageBase,
            metadataBuilder,
            this._ilStream,
            this._mappedFieldDataOpt,
            this._managedResourcesOpt,
            debugTableBuilderOpt);

        this._peDirectoriesBuilder.AddressOfEntryPoint = this._lazyEntryPointAddress;
        this._peDirectoriesBuilder.DebugTable = debugDirectoryEntry;
        this._peDirectoriesBuilder.ImportAddressTable = textSection.GetImportAddressTableDirectoryEntry(location.RelativeVirtualAddress);
        this._peDirectoriesBuilder.ImportTable = textSection.GetImportTableDirectoryEntry(location.RelativeVirtualAddress);
        this._peDirectoriesBuilder.CorHeaderTable = textSection.GetCorHeaderDirectoryEntry(location.RelativeVirtualAddress);

        return sectionBuilder;
    }

    private SerializeResourceSection(location: SectionLocation): BlobBuilder {
        assert(this._nativeResourcesOpt != undefined);

        const sectionBuilder = new BlobBuilder();
        this._nativeResourcesOpt.Serialize(sectionBuilder, location);

        this._peDirectoriesBuilder.ResourceTable = new DirectoryEntry(location.RelativeVirtualAddress, sectionBuilder.Count);
        return sectionBuilder;
    }

    private SerializeRelocationSection(location: SectionLocation): BlobBuilder {
        assert(this._lazyEntryPointAddress !== undefined);

        const sectionBuilder = new BlobBuilder();
        ManagedPEBuilder.WriteRelocationSection(sectionBuilder, this.Header.Machine, this._lazyEntryPointAddress);

        this._peDirectoriesBuilder.BaseRelocationTable = new DirectoryEntry(location.RelativeVirtualAddress, sectionBuilder.Count);
        return sectionBuilder;
    }

    private static WriteRelocationSection(builder: BlobBuilder, machine: Machine, entryPointAddress: number) {
        assert(builder.Count == 0);

        builder.WriteUInt32(((entryPointAddress + 2) / 0x1000) * 0x1000);
        builder.WriteUInt32((machine == Machine.IA64) ? 14 : 12);
        const offsetWithinPage = (entryPointAddress + 2) % 0x1000;
        const relocType = (machine == Machine.Amd64 || machine == Machine.IA64 || machine == Machine.Arm64) ? 10 : 3;
        const s = ((relocType << 12) | offsetWithinPage);
        builder.WriteUInt16(s);
        if (machine == Machine.IA64) {
            builder.WriteUInt32(relocType << 12);
        }

        builder.WriteUInt16(0); // next chunk's RVA
    }

    protected override GetDirectories(): PEDirectoriesBuilder {
        return this._peDirectoriesBuilder;
    }

    // public void Sign(BlobBuilder peImage, Func<IEnumerable<Blob>, byte[]> signatureProvider)
    // {
    //     if (peImage is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(peImage));
    //     }
    //     if (signatureProvider is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(signatureProvider));
    //     }

    //     Sign(peImage!, _lazyStrongNameSignature, signatureProvider!);
    // }
}