import { BlobBuilder } from 'System.Reflection.Metadata';
import { DebugDirectoryEntryType } from './DebugDirectoryEntryType';
import { DebugDirectoryEntry } from './DebugDirectoryEntry';
import { SectionLocation } from '../SectionLocation';

interface Entry {
    Stamp: number;
    Version: number;
    Type: DebugDirectoryEntryType;
    DataSize: number;
}


export class DebugDirectoryBuilder {

    private readonly _entries: Entry[];
    private readonly _dataBuilder?: BlobBuilder;

    public constructor() {
        this._entries = [];
    }

    AddEntry(type: DebugDirectoryEntryType, version: number, stamp: number, dataSize: number) {
        this._entries.push(
            {
                Stamp: stamp,
                Version: version,
                Type: type,
                DataSize: dataSize,
            });
    }

    // /// <summary>
    // /// Adds an entry.
    // /// </summary>
    // /// <param name="type">Entry type.</param>
    // /// <param name="version">Entry version.</param>
    // /// <param name="stamp">Entry stamp.</param>
    // public void AddEntry(DebugDirectoryEntryType type, uint version, uint stamp)
    //     => AddEntry(type, version, stamp, dataSize: 0);

    // /// <summary>
    // /// Adds an entry.
    // /// </summary>
    // /// <typeparam name="TData">Type of data passed to <paramref name="dataSerializer"/>.</typeparam>
    // /// <param name="type">Entry type.</param>
    // /// <param name="version">Entry version.</param>
    // /// <param name="stamp">Entry stamp.</param>
    // /// <param name="data">Data passed to <paramref name="dataSerializer"/>.</param>
    // /// <param name="dataSerializer">Serializes data to a <see cref="BlobBuilder"/>.</param>
    // public void AddEntry<TData>(DebugDirectoryEntryType type, uint version, uint stamp, TData data, Action<BlobBuilder, TData> dataSerializer)
    // {
    //     if (dataSerializer is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(dataSerializer));
    //     }

    //     int start = _dataBuilder.Count;
    //     dataSerializer(_dataBuilder, data);
    //     int dataSize = _dataBuilder.Count - start;

    //     AddEntry(type, version, stamp, dataSize);
    // }

    // /// <summary>
    // /// Adds a CodeView entry.
    // /// </summary>
    // /// <param name="pdbPath">Path to the PDB. Shall not be empty.</param>
    // /// <param name="pdbContentId">Unique id of the PDB content.</param>
    // /// <param name="portablePdbVersion">Version of Portable PDB format (e.g. 0x0100 for 1.0), or 0 if the PDB is not portable.</param>
    // /// <exception cref="ArgumentNullException"><paramref name="pdbPath"/> is undefined.</exception>
    // /// <exception cref="ArgumentException"><paramref name="pdbPath"/> contains NUL character.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="portablePdbVersion"/> is smaller than 0x0100.</exception>
    // public void AddCodeViewEntry(
    //     string pdbPath,
    //     BlobContentId pdbContentId,
    //     ushort portablePdbVersion)
    // {
    //     AddCodeViewEntry(pdbPath, pdbContentId, portablePdbVersion, age: 1);
    // }

    // /// <summary>
    // /// Adds a CodeView entry.
    // /// </summary>
    // /// <param name="pdbPath">Path to the PDB. Shall not be empty.</param>
    // /// <param name="pdbContentId">Unique id of the PDB content.</param>
    // /// <param name="portablePdbVersion">Version of Portable PDB format (e.g. 0x0100 for 1.0), or 0 if the PDB is not portable.</param>
    // /// <param name="age">Age (iteration) of the PDB. Shall be 1 for Portable PDBs.</param>
    // /// <exception cref="ArgumentNullException"><paramref name="pdbPath"/> is undefined.</exception>
    // /// <exception cref="ArgumentException"><paramref name="pdbPath"/> contains NUL character.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="age"/> is less than 1.</exception>
    // /// <exception cref="ArgumentOutOfRangeException"><paramref name="portablePdbVersion"/> is smaller than 0x0100.</exception>
    // public void AddCodeViewEntry(
    //     string pdbPath,
    //     BlobContentId pdbContentId,
    //     ushort portablePdbVersion,
    //     int age)
    // {
    //     if (pdbPath is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(pdbPath));
    //     }

    //     if (age < 1)
    //     {
    //         Throw.ArgumentOutOfRange(nameof(age));
    //     }

    //     // We allow NUL characters to allow for padding for backward compat purposes.
    //     if (pdbPath.Length == 0 || pdbPath[0] == '\0')
    //     {
    //         Throw.InvalidArgument(SR.ExpectedNonEmptyString, nameof(pdbPath));
    //     }

    //     if (portablePdbVersion > 0 && portablePdbVersion < PortablePdbVersions.MinFormatVersion)
    //     {
    //         Throw.ArgumentOutOfRange(nameof(portablePdbVersion));
    //     }

    //     int dataSize = WriteCodeViewData(_dataBuilder, pdbPath, pdbContentId.Guid, age);

    //     AddEntry(
    //         type: DebugDirectoryEntryType.CodeView,
    //         version: (portablePdbVersion == 0) ? 0 : PortablePdbVersions.DebugDirectoryEntryVersion(portablePdbVersion),
    //         stamp: pdbContentId.Stamp,
    //         dataSize);
    // }

    // /// <summary>
    // /// Adds Reproducible entry.
    // /// </summary>
    public AddReproducibleEntry() {
        this.AddEntry(DebugDirectoryEntryType.Reproducible, 0, 0, 0);
    }

    // private static int WriteCodeViewData(BlobBuilder builder, string pdbPath, Guid pdbGuid, int age)
    // {
    //     int start = builder.Count;

    //     builder.WriteByte((byte)'R');
    //     builder.WriteByte((byte)'S');
    //     builder.WriteByte((byte)'D');
    //     builder.WriteByte((byte)'S');

    //     // PDB id:
    //     builder.WriteGuid(pdbGuid);

    //     // age
    //     builder.WriteInt32(age);

    //     // UTF-8 encoded zero-terminated path to PDB
    //     builder.WriteUTF8(pdbPath, allowUnpairedSurrogates: true);
    //     builder.WriteByte(0);

    //     return builder.Count - start;
    // }

    // /// <summary>
    // /// Adds PDB checksum entry.
    // /// </summary>
    // /// <param name="algorithmName">Hash algorithm name (e.g. "SHA256").</param>
    // /// <param name="checksum">Checksum.</param>
    // /// <exception cref="ArgumentNullException"><paramref name="algorithmName"/> or <paramref name="checksum"/> is undefined.</exception>
    // /// <exception cref="ArgumentException"><paramref name="algorithmName"/> or <paramref name="checksum"/> is empty.</exception>
    // public void AddPdbChecksumEntry(string algorithmName, ImmutableArray<byte> checksum)
    // {
    //     if (algorithmName is undefined)
    //     {
    //         Throw.ArgumentNull(nameof(algorithmName));
    //     }

    //     if (algorithmName.Length == 0)
    //     {
    //         Throw.ArgumentEmptyString(nameof(algorithmName));
    //     }

    //     if (checksum.IsDefault)
    //     {
    //         Throw.ArgumentNull(nameof(checksum));
    //     }

    //     if (checksum.Length == 0)
    //     {
    //         Throw.ArgumentEmptyArray(nameof(checksum));
    //     }

    //     int dataSize = WritePdbChecksumData(_dataBuilder, algorithmName, checksum);

    //     AddEntry(
    //         type: DebugDirectoryEntryType.PdbChecksum,
    //         version: 0x00000001,
    //         stamp: 0x00000000,
    //         dataSize);
    // }

    // private static int WritePdbChecksumData(BlobBuilder builder, string algorithmName, ImmutableArray<byte> checksum)
    // {
    //     int start = builder.Count;

    //     // NUL-terminated algorithm name:
    //     builder.WriteUTF8(algorithmName, allowUnpairedSurrogates: true);
    //     builder.WriteByte(0);

    //     // checksum:
    //     builder.WriteBytes(checksum);

    //     return builder.Count - start;
    // }

    public get TableSize(): number {
        return DebugDirectoryEntry.Size * this._entries.length
    }
    public get Size(): number {
        return this.TableSize + (this._dataBuilder?.Count ?? 0);
    }

    /// <summary>
    /// Serialize the Debug Table and Data.
    /// </summary>
    /// <param name="builder">Builder.</param>
    /// <param name="sectionLocation">The containing PE section location.</param>
    /// <param name="sectionOffset">Offset of the table within the containing section.</param>
    public Serialize(builder: BlobBuilder, sectionLocation: SectionLocation, sectionOffset: number)
    {
        let dataOffset = sectionOffset + this.TableSize;
        for (var entry of this._entries)
        {
            let addressOfRawData;
            let pointerToRawData;
            if (entry.DataSize > 0)
            {
                addressOfRawData = sectionLocation.RelativeVirtualAddress + dataOffset;
                pointerToRawData = sectionLocation.PointerToRawData + dataOffset;
            }
            else
            {
                addressOfRawData = 0;
                pointerToRawData = 0;
            }

            builder.WriteUInt32(0); // characteristics, always 0
            builder.WriteUInt32(entry.Stamp);
            builder.WriteUInt32(entry.Version);
            builder.WriteInt32(entry.Type);
            builder.WriteInt32(entry.DataSize);
            builder.WriteInt32(addressOfRawData);
            builder.WriteInt32(pointerToRawData);

            dataOffset += entry.DataSize;
        }

        builder.LinkSuffix(this._dataBuilder);
    }
}