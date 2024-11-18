import { DirectoryEntry } from './DirectoryEntry';
import { CorFlags } from './CorFlags';
import { PEBinaryReader } from './PEBinaryReader';

export class CorHeader {
    private readonly _majorRuntimeVersion: number;
    private readonly _minorRuntimeVersion: number;
    private readonly _metadataDirectory: DirectoryEntry;
    private readonly _flags: CorFlags;
    private readonly _entryPointTokenOrRelativeVirtualAddress: number;
    private readonly _resourcesDirectory: DirectoryEntry;
    private readonly _strongNameSignatureDirectory: DirectoryEntry;
    private readonly _codeManagerTableDirectory: DirectoryEntry;
    private readonly _vtableFixupsDirectory: DirectoryEntry;
    private readonly _exportAddressTableJumpsDirectory: DirectoryEntry;
    private readonly _managedNativeHeaderDirectory: DirectoryEntry;

    public get MajorRuntimeVersion(): number {
        return this._majorRuntimeVersion;
    }

    public get MinorRuntimeVersion(): number {
        return this._minorRuntimeVersion;
    }
    public get MetadataDirectory(): DirectoryEntry {
        return this._metadataDirectory;
    }
    public get Flags(): CorFlags {
        return this._flags;
    }
    public get EntryPointTokenOrRelativeVirtualAddress(): number {
        return this._entryPointTokenOrRelativeVirtualAddress;
    }
    public get ResourcesDirectory(): DirectoryEntry {
        return this._resourcesDirectory;
    }
    public get StrongNameSignatureDirectory(): DirectoryEntry {
        return this._strongNameSignatureDirectory;
    }
    public get CodeManagerTableDirectory(): DirectoryEntry {
        return this._codeManagerTableDirectory;
    }
    public get VtableFixupsDirectory(): DirectoryEntry {
        return this._vtableFixupsDirectory;
    }
    public get ExportAddressTableJumpsDirectory(): DirectoryEntry {
        return this._exportAddressTableJumpsDirectory;
    }
    public get ManagedNativeHeaderDirectory(): DirectoryEntry {
        return this._managedNativeHeaderDirectory;
    }

    constructor(reader: PEBinaryReader) {
        // byte count
        reader.ReadInt32();

        this._majorRuntimeVersion = reader.ReadUInt16();
        this._minorRuntimeVersion = reader.ReadUInt16();
        this._metadataDirectory = DirectoryEntry.FromReader(reader);
        this._flags = reader.ReadUInt32();
        this._entryPointTokenOrRelativeVirtualAddress = reader.ReadInt32();
        this._resourcesDirectory = DirectoryEntry.FromReader(reader);
        this._strongNameSignatureDirectory = DirectoryEntry.FromReader(reader);
        this._codeManagerTableDirectory = DirectoryEntry.FromReader(reader);
        this._vtableFixupsDirectory = DirectoryEntry.FromReader(reader);
        this._exportAddressTableJumpsDirectory = DirectoryEntry.FromReader(reader);
        this._managedNativeHeaderDirectory = DirectoryEntry.FromReader(reader);
    }
}