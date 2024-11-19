import { Throw } from "System";
import { Machine } from 'System.Reflection.Metadata';
import { BitArithmetic } from 'System.Reflection';
import { PEBuilder } from './PEBuilder';
import { PEHeaders } from "./PEHeaders";
import { PEHeader } from "./PEHeader";
import { CoffHeader } from "./CoffHeader";
import { SectionHeader } from "./SectionHeader";
import {
    Characteristics,
    Subsystem,
    DllCharacteristics,
} from './PEFileFlags';

export class PEHeaderBuilder {
    // COFF:
    public readonly Machine: Machine;
    public readonly ImageCharacteristics: Characteristics;

    // PE:
    public readonly MajorLinkerVersion: number;
    public readonly MinorLinkerVersion: number;

    public readonly ImageBase: bigint;
    public readonly SectionAlignment: number;
    public readonly FileAlignment: number;

    public readonly MajorOperatingSystemVersion: number;
    public readonly MinorOperatingSystemVersion: number;

    public readonly MajorImageVersion: number;
    public readonly MinorImageVersion: number;

    public readonly MajorSubsystemVersion: number;
    public readonly MinorSubsystemVersion: number;

    public readonly Subsystem: Subsystem;
    public readonly DllCharacteristics: DllCharacteristics;

    public readonly SizeOfStackReserve: bigint;
    public readonly SizeOfStackCommit: bigint;
    public readonly SizeOfHeapReserve: bigint;
    public readonly SizeOfHeapCommit: bigint;

    /// <summary>
    /// Creates PE header builder.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">
    /// <paramref name="fileAlignment"/> is not power of 2 between 512 and 64K, or
    /// <paramref name="sectionAlignment"/> not power of 2 or it's less than <paramref name="fileAlignment"/>.
    /// </exception>
    public constructor(
        machine: Machine = 0,
        sectionAlignment: number = 0x2000,
        fileAlignment: number = 0x200,
        imageBase: bigint = BigInt(0x00400000),
        majorLinkerVersion: number = 0x30, // (what is ref.emit using?)
        minorLinkerVersion: number = 0,
        majorOperatingSystemVersion: number = 4,
        minorOperatingSystemVersion: number = 0,
        majorImageVersion: number = 0,
        minorImageVersion: number = 0,
        majorSubsystemVersion: number = 4,
        minorSubsystemVersion: number = 0,
        subsystem: Subsystem = Subsystem.WindowsCui,
        dllCharacteristics: DllCharacteristics = DllCharacteristics.DynamicBase | DllCharacteristics.NxCompatible | DllCharacteristics.NoSeh | DllCharacteristics.TerminalServerAware,
        imageCharacteristics: Characteristics = Characteristics.Dll,
        sizeOfStackReserve: bigint = BigInt(0x00100000),
        sizeOfStackCommit: bigint = BigInt(0x1000),
        sizeOfHeapReserve: bigint = BigInt(0x00100000),
        sizeOfHeapCommit: bigint = BigInt(0x1000)) {
        if (fileAlignment < 512 || fileAlignment > 64 * 1024 || BitArithmetic.Count32Bits(fileAlignment) != 1) {
            Throw.ArgumentOutOfRange("fileAlignment");
        }

        if (sectionAlignment < fileAlignment || BitArithmetic.Count32Bits(sectionAlignment) != 1) {
            Throw.ArgumentOutOfRange("sectionAlignment");
        }

        this.Machine = machine;
        this.SectionAlignment = sectionAlignment;
        this.FileAlignment = fileAlignment;
        this.ImageBase = imageBase;
        this.MajorLinkerVersion = majorLinkerVersion;
        this.MinorLinkerVersion = minorLinkerVersion;
        this.MajorOperatingSystemVersion = majorOperatingSystemVersion;
        this.MinorOperatingSystemVersion = minorOperatingSystemVersion;
        this.MajorImageVersion = majorImageVersion;
        this.MinorImageVersion = minorImageVersion;
        this.MajorSubsystemVersion = majorSubsystemVersion;
        this.MinorSubsystemVersion = minorSubsystemVersion;
        this.Subsystem = subsystem;
        this.DllCharacteristics = dllCharacteristics;
        this.ImageCharacteristics = imageCharacteristics;
        this.SizeOfStackReserve = sizeOfStackReserve;
        this.SizeOfStackCommit = sizeOfStackCommit;
        this.SizeOfHeapReserve = sizeOfHeapReserve;
        this.SizeOfHeapCommit = sizeOfHeapCommit;
    }

    public static CreateExecutableHeader(): PEHeaderBuilder {
        return new PEHeaderBuilder(
            0,
            0x2000,
            0x200,
            BigInt(0x00400000),
            0x30, // (what is ref.emit using?)
            0,
            4,
            0,
            0,
            0,
            4,
            0,
            Subsystem.WindowsCui,
            DllCharacteristics.DynamicBase | DllCharacteristics.NxCompatible | DllCharacteristics.NoSeh | DllCharacteristics.TerminalServerAware,
            Characteristics.ExecutableImage, // changed!
            BigInt(0x00100000),
            BigInt(0x1000),
            BigInt(0x00100000),
            BigInt(0x1000));
    }

    public static CreateLibraryHeader(): PEHeaderBuilder {
        return new PEHeaderBuilder(
            0,
            0x2000,
            0x200,
            BigInt(0x00400000),
            0x30, // (what is ref.emit using?)
            0,
            4,
            0,
            0,
            0,
            4,
            0,
            Subsystem.WindowsCui,
            DllCharacteristics.DynamicBase | DllCharacteristics.NxCompatible | DllCharacteristics.NoSeh | DllCharacteristics.TerminalServerAware,
            Characteristics.ExecutableImage | Characteristics.Dll, // changed!
            BigInt(0x00100000),
            BigInt(0x1000),
            BigInt(0x00100000),
            BigInt(0x1000));
    }

    get Is32Bit(): boolean {
        return this.Machine != Machine.Amd64 && this.Machine != Machine.IA64 && this.Machine != Machine.Arm64 && this.Machine != Machine.LoongArch64 && this.Machine != Machine.RiscV64;
    }

    ComputeSizeOfPEHeaders(sectionCount: number): number {
        return PEBuilder.DosHeaderSize +
            PEHeaders.PESignatureSize +
            CoffHeader.Size +
            PEHeader.Size(this.Is32Bit) +
            SectionHeader.Size * sectionCount;
    }
}