import assert from "assert";
import { sizeof, Throw } from "System";
import { Stream } from "System.IO";
import { StreamExtensions } from "System.Reflection.Internal";
import { COR20Constants } from "System.Reflection.Metadata.Ecma335";
import {
    SectionHeader,
    CoffHeader,
    CorHeader,
    PEHeader,
    PEBinaryReader,
    DirectoryEntry,
    Subsystem,
    Characteristics,
} from "System.Reflection.PortableExecutable";

export class PEHeaders {
    private readonly _coffHeader: CoffHeader;
    private readonly _peHeader?: PEHeader;
    private readonly _sectionHeaders: Array<SectionHeader>;
    private readonly _corHeader?: CorHeader;
    private readonly _isLoadedImage: boolean;

    private readonly _metadataStartOffset: number = -1;
    private readonly _metadataSize: number;
    private readonly _coffHeaderStartOffset: number = -1;
    private readonly _corHeaderStartOffset: number = -1;
    private readonly _peHeaderStartOffset: number = -1;

    public static DosSignature = 0x5A4D;     // 'M' 'Z'
    public static PESignatureOffsetLocation = 0x3C;
    public static PESignature = 0x00004550;    // PE00
    public static PESignatureSize = sizeof('uint');

    // /// <summary>
    // /// Reads PE headers from the current location in the stream.
    // /// </summary>
    // /// <param name="peStream">Stream containing PE image starting at the stream's current position and ending at the end of the stream.</param>
    // /// <exception cref="BadImageFormatException">The data read from stream have invalid format.</exception>
    // /// <exception cref="IOException">Error reading from the stream.</exception>
    // /// <exception cref="ArgumentException">The stream doesn't support seek operations.</exception>
    // /// <exception cref="ArgumentNullException"><paramref name="peStream"/> is undefined.</exception>
    // public PEHeaders(peStream: Stream)
    //    : this(peStream, 0)
    // {
    // }

    // /// <summary>
    // /// Reads PE headers from the current location in the stream.
    // /// </summary>
    // /// <param name="peStream">Stream containing PE image of the given size starting at its current position.</param>
    // /// <param name="size">Size of the PE image.</param>
    // /// <exception cref="BadImageFormatException">The data read from stream have invalid format.</exception>
    // /// <exception cref="IOException">Error reading from the stream.</exception>
    // /// <exception cref="ArgumentException">The stream doesn't support seek operations.</exception>
    // /// <exception cref="ArgumentNullException"><paramref name="peStream"/> is undefined.</exception>
    // /// <exception cref="ArgumentOutOfRangeException">Size is negative or extends past the end of the stream.</exception>
    // public PEHeaders(Stream peStream, int size)
    //     : this(peStream, size, isLoadedImage: false)
    // {
    // }

    /// <summary>
    /// Reads PE headers from the current location in the stream.
    /// </summary>
    /// <param name="peStream">Stream containing PE image of the given size starting at its current position.</param>
    /// <param name="size">Size of the PE image.</param>
    /// <param name="isLoadedImage">True if the PE image has been loaded into memory by the OS loader.</param>
    /// <exception cref="BadImageFormatException">The data read from stream have invalid format.</exception>
    /// <exception cref="IOException">Error reading from the stream.</exception>
    /// <exception cref="ArgumentException">The stream doesn't support seek operations.</exception>
    /// <exception cref="ArgumentNullException"><paramref name="peStream"/> is undefined.</exception>
    /// <exception cref="ArgumentOutOfRangeException">Size is negative or extends past the end of the stream.</exception>
    public constructor(peStream: Stream, size: number = 0, isLoadedImage: boolean = false) {
        if (!peStream.CanRead || !peStream.CanSeek) {
            throw new Error("Stream must be readable and seekable.");
        }

        this._isLoadedImage = isLoadedImage;

        const actualSize = StreamExtensions.GetAndValidateSize(peStream, size, "peStream");
        var reader = new PEBinaryReader(peStream, actualSize);

        const isCoffOnly = this.SkipDosHeader(reader);

        this._coffHeaderStartOffset = reader.CurrentOffset;
        this._coffHeader = new CoffHeader(reader);

        if (!isCoffOnly) {
            this._peHeaderStartOffset = reader.CurrentOffset;
            this._peHeader = new PEHeader(reader);
        }

        this._sectionHeaders = this.ReadSectionHeaders(reader);

        if (!isCoffOnly) {

            const offset = this.TryCalculateCorHeaderOffset();
            if (offset != undefined) {
                this._corHeaderStartOffset = offset;
                reader.Seek(offset);
                this._corHeader = new CorHeader(reader);
            }
        }

        const [_metadataStartOffset, _metadataSize] = this.CalculateMetadataLocation(actualSize);
        this._metadataStartOffset = _metadataStartOffset;
        this._metadataSize = _metadataSize;
    }

    /// <summary>
    /// Gets the offset (in bytes) from the start of the PE image to the start of the CLI metadata.
    /// or -1 if the image does not contain metadata.
    /// </summary>
    public get MetadataStartOffset(): number {
        return this._metadataStartOffset;
    }

    /// <summary>
    /// Gets the size of the CLI metadata 0 if the image does not contain metadata.)
    /// </summary>
    public get MetadataSize(): number {

        return this._metadataSize;
    }

    /// <summary>
    /// Gets the COFF header of the image.
    /// </summary>
    public get CoffHeader(): CoffHeader {

        return this._coffHeader;
    }

    /// <summary>
    /// Gets the byte offset from the start of the PE image to the start of the COFF header.
    /// </summary>
    public get CoffHeaderStartOffset(): number {

        return this._coffHeaderStartOffset;
    }

    /// <summary>
    /// Determines if the image is Coff only.
    /// </summary>
    public get IsCoffOnly(): boolean {

        return this._peHeader == undefined;
    }

    /// <summary>
    /// Gets the PE header of the image or undefined if the image is COFF only.
    /// </summary>
    public get PEHeader(): PEHeader | undefined {

        return this._peHeader;
    }

    /// <summary>
    /// Gets the byte offset from the start of the image to
    /// </summary>
    public get PEHeaderStartOffset(): number {

        return this._peHeaderStartOffset;
    }

    /// <summary>
    /// Gets the PE section headers.
    /// </summary>
    public get SectionHeaders(): Array<SectionHeader> {
        return this._sectionHeaders;
    }

    /// <summary>
    /// Gets the CLI header or undefined if the image does not have one.
    /// </summary>
    public get CorHeader(): CorHeader | undefined {
        return this._corHeader;
    }

    /// <summary>
    /// Gets the byte offset from the start of the image to the COR header or -1 if the image does not have one.
    /// </summary>
    public get CorHeaderStartOffset(): number {

        return this._corHeaderStartOffset;
    }

    /// <summary>
    /// Determines if the image represents a Windows console application.
    /// </summary>
    public get IsConsoleApplication(): boolean {

        return this._peHeader != undefined && this._peHeader.Subsystem == Subsystem.WindowsCui;

    }

    /// <summary>
    /// Determines if the image represents a dynamically linked library.
    /// </summary>
    public get IsDll(): boolean {

        return (this._coffHeader.Characteristics & Characteristics.Dll) != 0;

    }

    /// <summary>
    /// Determines if the image represents an executable.
    /// </summary>
    public get IsExe(): boolean {
        return (this._coffHeader.Characteristics & Characteristics.Dll) == 0;

    }

    private TryCalculateCorHeaderOffset(): number | undefined {
        assert(this._peHeader != undefined);
        const startOffset = this.TryGetDirectoryOffset(this._peHeader.CorHeaderTableDirectory, false);
        if (startOffset == undefined) {
            return undefined;
        }

        const length = this._peHeader.CorHeaderTableDirectory.Size;
        if (length < COR20Constants.SizeOfCorHeader) {
            throw new Error("Invalid COR header size");
        }
        return startOffset;
    }

    SkipDosHeader(reader: PEBinaryReader): boolean {
        // Look for DOS Signature "MZ"
        const dosSig = reader.ReadUInt16();
        let isCOFFOnly = false;

        if (dosSig != PEHeaders.DosSignature) {
            // If image doesn't start with DOS signature, let's assume it is a
            // COFF (Common Object File Format), aka .OBJ file.
            // See CLiteWeightStgdbRW::FindObjMetaData in ndp\clr\src\MD\enc\peparse.cpp

            if (dosSig != 0 || reader.ReadUInt16() != 0xffff) {
                isCOFFOnly = true;
                reader.Seek(0);
            }
            else {
                // Might need to handle other formats. Anonymous or LTCG objects, for example.
                throw new Error("Invalid DOS header");
            }
        }
        else {
            isCOFFOnly = false;
        }

        if (!isCOFFOnly) {
            // Skip the DOS Header
            reader.Seek(PEHeaders.PESignatureOffsetLocation);

            const ntHeaderOffset = reader.ReadInt32();
            reader.Seek(ntHeaderOffset);

            // Look for PESignature "PE\0\0"
            const ntSignature = reader.ReadUInt32();
            if (ntSignature != PEHeaders.PESignature) {
                throw new Error("Invalid NT header");
            }
        }

        return isCOFFOnly;
    }

    private ReadSectionHeaders(reader: PEBinaryReader): SectionHeader[] {
        const numberOfSections = this._coffHeader.NumberOfSections;
        if (numberOfSections < 0) {
            throw new Error("BadImageFormatException");
        }

        var builder = Array<SectionHeader>();

        for (let i = 0; i < numberOfSections; i++) {
            builder.push(new SectionHeader(reader));
        }

        return [...builder];
    }

    /// <summary>
    /// Gets the offset (in bytes) from the start of the image to the given directory data.
    /// </summary>
    /// <param name="directory">PE directory entry</param>
    /// <param name="offset">Offset from the start of the image to the given directory data</param>
    /// <returns>True if the directory data is found, false otherwise.</returns>
    public TryGetDirectoryOffset(directory: DirectoryEntry, canCrossSectionBoundary: boolean = true): number | undefined {
        const sectionIndex = this.GetContainingSectionIndex(directory.RelativeVirtualAddress);
        if (sectionIndex < 0) {
            return undefined;
        }

        const relativeOffset = directory.RelativeVirtualAddress - this._sectionHeaders[sectionIndex].VirtualAddress;
        if (!canCrossSectionBoundary && directory.Size > this._sectionHeaders[sectionIndex].VirtualSize - relativeOffset) {
            throw new Error("Directory crosses section boundary");
        }

        return this._isLoadedImage ? directory.RelativeVirtualAddress : this._sectionHeaders[sectionIndex].PointerToRawData + relativeOffset;
    }

    /// <summary>
    /// Searches sections of the PE image for the one that contains specified Relative Virtual Address.
    /// </summary>
    /// <param name="relativeVirtualAddress">Address.</param>
    /// <returns>
    /// Index of the section that contains <paramref name="relativeVirtualAddress"/>,
    /// or -1 if there is none.
    /// </returns>
    public GetContainingSectionIndex(relativeVirtualAddress: number): number {
        for (let i = 0; i < this._sectionHeaders.length; i++) {
            if (this._sectionHeaders[i].VirtualAddress <= relativeVirtualAddress &&
                relativeVirtualAddress < this._sectionHeaders[i].VirtualAddress + this._sectionHeaders[i].VirtualSize) {
                return i;
            }
        }

        return -1;
    }

    IndexOfSection(name: string): number {
        for (let i = 0; i < this._sectionHeaders.length; i++) {
            if (this._sectionHeaders[i].Name === name) {
                return i;
            }
        }

        return -1;
    }

    CalculateMetadataLocation(peImageSize: number): [start: number, size: number] {
        let start = 0;
        let size = 0;
        if (this.IsCoffOnly) {
            const cormeta = this.IndexOfSection(".cormeta");
            if (cormeta == -1) {
                return [-1, 0];
            }

            if (this._isLoadedImage) {
                start = this._sectionHeaders[cormeta].VirtualAddress;
                size = this._sectionHeaders[cormeta].VirtualSize;
            }
            else {
                start = this._sectionHeaders[cormeta].PointerToRawData;
                size = this._sectionHeaders[cormeta].SizeOfRawData;
            }
        }

        else if (!this._corHeader) {
            return [0, 0];
        }
        else {
            const _start = this.TryGetDirectoryOffset(this._corHeader.MetadataDirectory, false);
            if (_start == undefined) {
                throw new Error("Invalid metadata directory");
            }
            start = _start;
            size = this._corHeader.MetadataDirectory.Size;
        }

        if (start < 0 ||
            start >= peImageSize ||
            size <= 0 ||
            start > Number(peImageSize) - size) {
            throw new Error("InvalidMetadataSectionSpan");
        }

        return [start, size];
    }
}