import assert from 'assert';
import { sizeof } from 'System';
import {
    PEMagic,
    Subsystem,
    DllCharacteristics,
} from "./PEFileFlags";
import { PEBinaryReader } from "./PEBinaryReader";
import { DirectoryEntry } from "./DirectoryEntry";

export class PEHeader {
    readonly _magic: PEMagic;
    readonly _majorLinkerVersion: number;
    readonly _minorLinkerVersion: number;
    readonly _sizeOfCode: number;
    readonly _sizeOfInitializedData: number;
    readonly _sizeOfUninitializedData: number;
    readonly _addressOfEntryPoint: number;
    readonly _baseOfCode: number;
    readonly _baseOfData: number;
    readonly _imageBase: number;
    readonly _sectionAlignment: number;
    readonly _fileAlignment: number;
    readonly _majorOperatingSystemVersion: number;
    readonly _minorOperatingSystemVersion: number;
    readonly _majorImageVersion: number;
    readonly _minorImageVersion: number;
    readonly _majorSubsystemVersion: number;
    readonly _minorSubsystemVersion: number;
    readonly _sizeOfImage: number;
    readonly _sizeOfHeaders: number;
    readonly _checkSum: number;
    readonly _subsystem: Subsystem;
    readonly _dllCharacteristics: DllCharacteristics;
    readonly _sizeOfStackReserve: number;
    readonly _sizeOfStackCommit: number;
    readonly _sizeOfHeapReserve: number;
    readonly _sizeOfHeapCommit: number;
    readonly _numberOfRvaAndSizes: number;
    readonly _exportTableDirectory: DirectoryEntry;
    readonly _importTableDirectory: DirectoryEntry;
    readonly _resourceTableDirectory: DirectoryEntry;
    readonly _exceptionTableDirectory: DirectoryEntry;
    readonly _certificateTableDirectory: DirectoryEntry;
    readonly _baseRelocationTableDirectory: DirectoryEntry;
    readonly _debugTableDirectory: DirectoryEntry;
    readonly _copyrightTableDirectory: DirectoryEntry;
    readonly _globalPointerTableDirectory: DirectoryEntry;
    readonly _threadLocalStorageTableDirectory: DirectoryEntry;
    readonly _loadConfigTableDirectory: DirectoryEntry;
    readonly _boundImportTableDirectory: DirectoryEntry;
    readonly _importAddressTableDirectory: DirectoryEntry;
    readonly _delayImportTableDirectory: DirectoryEntry;
    readonly _corHeaderTableDirectory: DirectoryEntry;


    /// <summary>
    /// Identifies the format of the image file.
    /// </summary>
    public get Magic(): PEMagic {
        return this._magic;
    }

    /// <summary>
    /// The linker major version number.
    /// </summary>
    public get MajorLinkerVersion(): number {
        return this._majorLinkerVersion;
    }

    /// <summary>
    /// The linker minor version number.
    /// </summary>
    public get MinorLinkerVersion(): number {
        return this._minorLinkerVersion;
    }

    /// <summary>
    /// The size of the code (text) section, or the sum of all code sections if there are multiple sections.
    /// </summary>
    public get SizeOfCode(): number {
        return this._sizeOfCode;
    }

    /// <summary>
    /// The size of the initialized data section, or the sum of all such sections if there are multiple data sections.
    /// </summary>
    public get SizeOfInitializedData(): number {
        return this._sizeOfInitializedData;
    }

    /// <summary>
    /// The size of the uninitialized data section (BSS), or the sum of all such sections if there are multiple BSS sections.
    /// </summary>
    public get SizeOfUninitializedData(): number {
        return this._sizeOfUninitializedData;
    }

    /// <summary>
    /// The address of the entry point relative to the image base when the PE file is loaded into memory.
    /// For program images, this is the starting address. For device drivers, this is the address of the initialization function.
    /// An entry point is optional for DLLs. When no entry point is present, this field must be zero.
    /// </summary>
    public get AddressOfEntryPoint(): number {
        return this._addressOfEntryPoint;
    }

    /// <summary>
    /// The address that is relative to the image base of the beginning-of-code section when it is loaded into memory.
    /// </summary>
    public get BaseOfCode(): number {
        return this._baseOfCode;
    }

    /// <summary>
    /// The address that is relative to the image base of the beginning-of-data section when it is loaded into memory.
    /// </summary>
    public get BaseOfData(): number {
        return this._baseOfData;
    }


    /// <summary>
    /// The preferred address of the first byte of image when loaded into memory;
    /// must be a multiple of 64K.
    /// </summary>
    public get ImageBase(): number {
        return this._imageBase;
    }

    /// <summary>
    /// The alignment (in bytes) of sections when they are loaded into memory. It must be greater than or equal to <see cref="FileAlignment"/>.
    /// The default is the page size for the architecture.
    /// </summary>
    public get SectionAlignment(): number {
        return this._sectionAlignment;
    }

    /// <summary>
    /// The alignment factor (in bytes) that is used to align the raw data of sections in the image file.
    /// The value should be a power of 2 between 512 and 64K, inclusive. The default is 512.
    /// If the <see cref="SectionAlignment"/> is less than the architecture's page size,
    /// then <see cref="FileAlignment"/> must match <see cref="SectionAlignment"/>.
    /// </summary>
    public get FileAlignment(): number {
        return this._fileAlignment;
    }

    /// <summary>
    /// The major version number of the required operating system.
    /// </summary>
    public get MajorOperatingSystemVersion(): number {
        return this._majorOperatingSystemVersion;
    }

    /// <summary>
    /// The minor version number of the required operating system.
    /// </summary>
    public get MinorOperatingSystemVersion(): number {
        return this._minorOperatingSystemVersion;
    }

    /// <summary>
    /// The major version number of the image.
    /// </summary>
    public get MajorImageVersion(): number {
        return this._majorImageVersion;
    }

    /// <summary>
    /// The minor version number of the image.
    /// </summary>
    public get MinorImageVersion(): number {
        return this._minorImageVersion;
    }

    /// <summary>
    /// The major version number of the subsystem.
    /// </summary>
    public get MajorSubsystemVersion(): number {
        return this._majorSubsystemVersion;
    }

    /// <summary>
    /// The minor version number of the subsystem.
    /// </summary>
    public get MinorSubsystemVersion(): number {
        return this._minorSubsystemVersion;
    }

    /// <summary>
    /// The size (in bytes) of the image, including all headers, as the image is loaded in memory.
    /// It must be a multiple of <see cref="SectionAlignment"/>.
    /// </summary>
    public get SizeOfImage(): number {
        return this._sizeOfImage;
    }

    /// <summary>
    /// The combined size of an MS DOS stub, PE header, and section headers rounded up to a multiple of FileAlignment.
    /// </summary>
    public get SizeOfHeaders(): number {
        return this._sizeOfHeaders;
    }

    /// <summary>
    /// The image file checksum.
    /// </summary>
    public get CheckSum(): number {
        return this._checkSum;
    }

    /// <summary>
    /// The subsystem that is required to run this image.
    /// </summary>
    public get Subsystem(): Subsystem {
        return this._subsystem;
    }

    public get DllCharacteristics(): DllCharacteristics {
        return this._dllCharacteristics;
    }

    /// <summary>
    /// The size of the stack to reserve. Only <see cref="SizeOfStackCommit"/> is committed;
    /// the rest is made available one page at a time until the reserve size is reached.
    /// </summary>
    public get SizeOfStackReserve(): number {
        return this._sizeOfStackReserve;
    }

    /// <summary>
    /// The size of the stack to commit.
    /// </summary>
    public get SizeOfStackCommit(): number {
        return this._sizeOfStackCommit;
    }

    /// <summary>
    /// The size of the local heap space to reserve. Only <see cref="SizeOfHeapCommit"/> is committed;
    /// the rest is made available one page at a time until the reserve size is reached.
    /// </summary>
    public get SizeOfHeapReserve(): number {
        return this._sizeOfHeapReserve;
    }

    /// <summary>
    /// The size of the local heap space to commit.
    /// </summary>
    public get SizeOfHeapCommit(): number {
        return this._sizeOfHeapCommit;
    }

    /// <summary>
    /// The number of data-directory entries in the remainder of the <see cref="PEHeader"/>. Each describes a location and size.
    /// </summary>
    public get NumberOfRvaAndSizes(): number {
        return this._numberOfRvaAndSizes;
    }

    // #region Directory Entries

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_EXPORT.
    /// </remarks>
    public get ExportTableDirectory(): DirectoryEntry {
        return this._exportTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_IMPORT.
    /// </remarks>
    public get ImportTableDirectory(): DirectoryEntry {
        return this._importTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_RESOURCE.
    /// </remarks>
    public get ResourceTableDirectory(): DirectoryEntry {
        return this._resourceTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_EXCEPTION.
    /// </remarks>
    public get ExceptionTableDirectory(): DirectoryEntry {
        return this._exceptionTableDirectory;
    }

    /// <summary>
    /// The Certificate Table entry points to a table of attribute certificates.
    /// </summary>
    /// <remarks>
    /// These certificates are not loaded into memory as part of the image.
    /// As such, the first field of this entry, which is normally an RVA, is a file pointer instead.
    ///
    /// Aka IMAGE_DIRECTORY_ENTRY_SECURITY.
    /// </remarks>
    public get CertificateTableDirectory(): DirectoryEntry {
        return this._certificateTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_BASERELOC.
    /// </remarks>
    public get BaseRelocationTableDirectory(): DirectoryEntry {
        return this._baseRelocationTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_DEBUG.
    /// </remarks>
    public get DebugTableDirectory(): DirectoryEntry {
        return this._debugTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_COPYRIGHT or IMAGE_DIRECTORY_ENTRY_ARCHITECTURE.
    /// </remarks>
    public get CopyrightTableDirectory(): DirectoryEntry {
        return this._copyrightTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_GLOBALPTR.
    /// </remarks>
    public get GlobalPointerTableDirectory(): DirectoryEntry {
        return this._globalPointerTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_TLS.
    /// </remarks>
    public get ThreadLocalStorageTableDirectory(): DirectoryEntry {
        return this._threadLocalStorageTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG.
    /// </remarks>
    public get LoadConfigTableDirectory(): DirectoryEntry {
        return this._loadConfigTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT.
    /// </remarks>
    public get BoundImportTableDirectory(): DirectoryEntry {
        return this._boundImportTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_IAT.
    /// </remarks>
    public get ImportAddressTableDirectory(): DirectoryEntry {
        return this._importAddressTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT.
    /// </remarks>
    public get DelayImportTableDirectory(): DirectoryEntry {
        return this._delayImportTableDirectory;
    }

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR.
    /// </remarks>
    public get CorHeaderTableDirectory(): DirectoryEntry {
        return this._corHeaderTableDirectory;
    }


    static OffsetOfChecksum =
        sizeof('short') +                               // Magic
        sizeof('byte') +                                // MajorLinkerVersion
        sizeof('byte') +                                // MinorLinkerVersion
        sizeof('int') +                                 // SizeOfCode
        sizeof('int') +                                 // SizeOfInitializedData
        sizeof('int') +                                 // SizeOfUninitializedData
        sizeof('int') +                                 // AddressOfEntryPoint
        sizeof('int') +                                 // BaseOfCode
        sizeof('long') +                                // PE32:  BaseOfData , ImageBase 
        //                                              // PE32+: ImageBase (long)
        sizeof('int') +                                 // SectionAlignment
        sizeof('int') +                                 // FileAlignment
        sizeof('short') +                               // MajorOperatingSystemVersion
        sizeof('short') +                               // MinorOperatingSystemVersion
        sizeof('short') +                               // MajorImageVersion
        sizeof('short') +                               // MinorImageVersion
        sizeof('short') +                               // MajorSubsystemVersion
        sizeof('short') +                               // MinorSubsystemVersion
        sizeof('int') +                                 // Win32VersionValue
        sizeof('int') +                                 // SizeOfImage
        sizeof('int');                                  // SizeOfHeaders

    static Size(is32Bit: boolean) {
        return PEHeader.OffsetOfChecksum +
            sizeof('int') +                                     // Checksum
            sizeof('short') +                                   // Subsystem
            sizeof('short') +                                   // DllCharacteristics
            4 * (is32Bit ? sizeof('int') : sizeof('long')) +    // SizeOfStackReserve, SizeOfStackCommit, SizeOfHeapReserve, SizeOfHeapCommit
            sizeof('int') +                                     // LoaderFlags
            sizeof('int') +                                     // NumberOfRvaAndSizes
            16 * sizeof('long');                                // directory entries
    }

    constructor(reader: PEBinaryReader) {
        const magic = reader.ReadUInt16() as PEMagic;
        if (magic != PEMagic.PE32 && magic != PEMagic.PE32Plus) {
            throw new Error(`Invalid PE magic: ${magic}`);
        }

        this._magic = magic;
        this._majorLinkerVersion = reader.ReadByte();
        this._minorLinkerVersion = reader.ReadByte();
        this._sizeOfCode = reader.ReadInt32();
        this._sizeOfInitializedData = reader.ReadInt32();
        this._sizeOfUninitializedData = reader.ReadInt32();
        this._addressOfEntryPoint = reader.ReadInt32();
        this._baseOfCode = reader.ReadInt32();

        if (magic == PEMagic.PE32Plus) {
            this._baseOfData = 0; // not present
        }
        else {
            assert(magic == PEMagic.PE32);
            this._baseOfData = reader.ReadInt32();
        }

        if (magic == PEMagic.PE32Plus) {
            this._imageBase = Number(reader.ReadUInt64());
        }
        else {
            this._imageBase = reader.ReadUInt32();
        }

        // NT additional fields:
        this._sectionAlignment = reader.ReadInt32();
        this._fileAlignment = reader.ReadInt32();
        this._majorOperatingSystemVersion = reader.ReadUInt16();
        this._minorOperatingSystemVersion = reader.ReadUInt16();
        this._majorImageVersion = reader.ReadUInt16();
        this._minorImageVersion = reader.ReadUInt16();
        this._majorSubsystemVersion = reader.ReadUInt16();
        this._minorSubsystemVersion = reader.ReadUInt16();

        // Win32VersionValue (reserved, should be 0)
        reader.ReadUInt32();

        this._sizeOfImage = reader.ReadInt32();
        this._sizeOfHeaders = reader.ReadInt32();
        this._checkSum = reader.ReadUInt32();
        this._subsystem = reader.ReadUInt16();
        this._dllCharacteristics = reader.ReadUInt16();

        if (magic == PEMagic.PE32Plus) {
            this._sizeOfStackReserve = Number(reader.ReadUInt64());
            this._sizeOfStackCommit = Number(reader.ReadUInt64());
            this._sizeOfHeapReserve = Number(reader.ReadUInt64());
            this._sizeOfHeapCommit = Number(reader.ReadUInt64());
        }
        else {
            this._sizeOfStackReserve = reader.ReadUInt32();
            this._sizeOfStackCommit = reader.ReadUInt32();
            this._sizeOfHeapReserve = reader.ReadUInt32();
            this._sizeOfHeapCommit = reader.ReadUInt32();
        }

        // loader flags
        reader.ReadUInt32();

        this._numberOfRvaAndSizes = reader.ReadInt32();

        // directory entries:
        this._exportTableDirectory = DirectoryEntry.FromReader(reader);
        this._importTableDirectory = DirectoryEntry.FromReader(reader);
        this._resourceTableDirectory = DirectoryEntry.FromReader(reader);
        this._exceptionTableDirectory = DirectoryEntry.FromReader(reader);
        this._certificateTableDirectory = DirectoryEntry.FromReader(reader);
        this._baseRelocationTableDirectory = DirectoryEntry.FromReader(reader);
        this._debugTableDirectory = DirectoryEntry.FromReader(reader);
        this._copyrightTableDirectory = DirectoryEntry.FromReader(reader);
        this._globalPointerTableDirectory = DirectoryEntry.FromReader(reader);
        this._threadLocalStorageTableDirectory = DirectoryEntry.FromReader(reader);
        this._loadConfigTableDirectory = DirectoryEntry.FromReader(reader);
        this._boundImportTableDirectory = DirectoryEntry.FromReader(reader);
        this._importAddressTableDirectory = DirectoryEntry.FromReader(reader);
        this._delayImportTableDirectory = DirectoryEntry.FromReader(reader);
        this._corHeaderTableDirectory = DirectoryEntry.FromReader(reader);

        // ReservedDirectory (should be 0, 0)
        DirectoryEntry.FromReader(reader);
    }
}