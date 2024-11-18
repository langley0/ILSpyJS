import { sizeof } from "System";
import { SectionCharacteristics } from "./SectionCharacteristics";
import { PEBinaryReader } from "./PEBinaryReader";

export class SectionHeader {
    private readonly _name: string;
    private readonly _virtualSize: number;
    private readonly _virtualAddress: number;
    private readonly _sizeOfRawData: number;
    private readonly _pointerToRawData: number;
    private readonly _pointerToRelocations: number;
    private readonly _pointerToLineNumbers: number;
    private readonly _numberOfRelocations: number;
    private readonly _numberOfLineNumbers: number;
    private readonly _sectionCharacteristics: SectionCharacteristics;


    /// <summary>
    /// The name of the section.
    /// </summary>
    public get Name(): string {
        return this._name;
    }

    /// <summary>
    /// The total size of the section when loaded into memory.
    /// If this value is greater than <see cref="SizeOfRawData"/>, the section is zero-padded.
    /// This field is valid only for PE images and should be set to zero for object files.
    /// </summary>
    public get VirtualSize(): number {
        return this._virtualSize;
    }

    /// <summary>
    /// For PE images, the address of the first byte of the section relative to the image base when the
    /// section is loaded into memory. For object files, this field is the address of the first byte before
    /// relocation is applied; for simplicity, compilers should set this to zero. Otherwise,
    /// it is an arbitrary value that is subtracted from offsets during relocation.
    /// </summary>
    public get VirtualAddress(): number {
        return this._virtualAddress;
    }

    /// <summary>
    /// The size of the section (for object files) or the size of the initialized data on disk (for image files).
    /// For PE images, this must be a multiple of <see cref="PEHeader.FileAlignment"/>.
    /// If this is less than <see cref="VirtualSize"/>, the remainder of the section is zero-filled.
    /// Because the <see cref="SizeOfRawData"/> field is rounded but the <see cref="VirtualSize"/> field is not,
    /// it is possible for <see cref="SizeOfRawData"/> to be greater than <see cref="VirtualSize"/> as well.
    ///  When a section contains only uninitialized data, this field should be zero.
    /// </summary>
    public get SizeOfRawData(): number {
        return this._sizeOfRawData;
    }

    /// <summary>
    /// The file pointer to the first page of the section within the COFF file.
    /// For PE images, this must be a multiple of <see cref="PEHeader.FileAlignment"/>.
    /// For object files, the value should be aligned on a 4 byte boundary for best performance.
    /// When a section contains only uninitialized data, this field should be zero.
    /// </summary>
    public get PointerToRawData(): number {
        return this._pointerToRawData;
    }

    /// <summary>
    /// The file pointer to the beginning of relocation entries for the section.
    /// This is set to zero for PE images or if there are no relocations.
    /// </summary>
    public get PointerToRelocations(): number {
        return this._pointerToRelocations;
    }

    /// <summary>
    /// The file pointer to the beginning of line-number entries for the section.
    /// This is set to zero if there are no COFF line numbers.
    /// This value should be zero for an image because COFF debugging information is deprecated.
    /// </summary>
    public get PointerToLineNumbers(): number {
        return this._pointerToLineNumbers;
    }

    /// <summary>
    /// The number of relocation entries for the section. This is set to zero for PE images.
    /// </summary>
    public get NumberOfRelocations(): number {
        return this._numberOfRelocations;
    }

    /// <summary>
    /// The number of line-number entries for the section.
    ///  This value should be zero for an image because COFF debugging information is deprecated.
    /// </summary>
    public get NumberOfLineNumbers(): number {
        return this._numberOfLineNumbers;
    }

    /// <summary>
    /// The flags that describe the characteristics of the section.
    /// </summary>
    public get SectionCharacteristics(): SectionCharacteristics {
        return this._sectionCharacteristics;
    }

    public static readonly NameSize = 8;

    public static readonly Size = this.NameSize +
        sizeof('int') +   // VirtualSize
        sizeof('int') +   // VirtualAddress
        sizeof('int') +   // SizeOfRawData
        sizeof('int') +   // PointerToRawData
        sizeof('int') +   // PointerToRelocations
        sizeof('int') +   // PointerToLineNumbers
        sizeof('short') + // NumberOfRelocations
        sizeof('short') + // NumberOfLineNumbers
        sizeof('int');    // SectionCharacteristics


    public constructor(reader: PEBinaryReader) {
        this._name = reader.ReadNullPaddedUTF8(SectionHeader.NameSize);
        this._virtualSize = reader.ReadInt32();
        this._virtualAddress = reader.ReadInt32();
        this._sizeOfRawData = reader.ReadInt32();
        this._pointerToRawData = reader.ReadInt32();
        this._pointerToRelocations = reader.ReadInt32();
        this._pointerToLineNumbers = reader.ReadInt32();
        this._numberOfRelocations = reader.ReadUInt16();
        this._numberOfLineNumbers = reader.ReadUInt16();
        this._sectionCharacteristics = reader.ReadUInt32() as SectionCharacteristics;
    }
}