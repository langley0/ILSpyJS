import assert from "assert";
import { Throw, sizeof } from "System";
import { BitArithmetic } from "System.Reflection";
import {
    Blob,
    BlobContentId,
    BlobBuilder,
    Machine,
    BlobWriter,
    MetadataRootBuilder,
    MethodDefinitionHandle,
} from 'System.Reflection.Metadata';

import { SectionCharacteristics } from './SectionCharacteristics';
import { SectionLocation } from './SectionLocation';
import { PEHeaderBuilder } from './PEHeaderBuilder';
import { PEMagic } from './PEFileFlags';
import { PEHeader } from './PEHeader';
import { PEHeaders } from './PEHeaders';
import { PEDirectoriesBuilder } from './PEDirectoriesBuilder';

export class Section {
    public readonly Name: string;
    public readonly Characteristics: SectionCharacteristics;

    public constructor(name: string, characteristics: SectionCharacteristics) {
        this.Name = name;
        this.Characteristics = characteristics;
    }
}

export class SerializedSection {
    public readonly Builder: BlobBuilder;

    public readonly Name: string;
    public readonly Characteristics: SectionCharacteristics;
    public readonly RelativeVirtualAddress: number;
    public readonly SizeOfRawData: number;
    public readonly PointerToRawData: number;

    public constructor(builder: BlobBuilder, name: string, characteristics: SectionCharacteristics, relativeVirtualAddress: number, sizeOfRawData: number, pointerToRawData: number) {
        this.Name = name;
        this.Characteristics = characteristics;
        this.Builder = builder;
        this.RelativeVirtualAddress = relativeVirtualAddress;
        this.SizeOfRawData = sizeOfRawData;
        this.PointerToRawData = pointerToRawData;
    }

    public get VirtualSize(): number {
        return this.Builder.Count;
    }
}

export abstract class PEBuilder {
    public readonly Header: PEHeaderBuilder;
    public readonly IdProvider: (blobs: ArrayLike<Blob>) => BlobContentId;
    public readonly IsDeterministic: boolean;

    private _lazySections?: ArrayLike<Section>;
    private _lazyChecksum?: Blob;

    protected constructor(header: PEHeaderBuilder, deterministicIdProvider?: (blobs: ArrayLike<Blob>) => BlobContentId) {
        this.IdProvider = deterministicIdProvider ?? BlobContentId.GetTimeBasedProvider();
        this.IsDeterministic = !!deterministicIdProvider
        this.Header = header;
        this._lazySections = undefined; // lazy initialization
    }

    protected GetSections(): ArrayLike<Section> {
        if (!this._lazySections) {
            this._lazySections = this.CreateSections();
        }
        const sections = this._lazySections;
        if (sections.length == 0) {
            Throw.InvalidOperationException('MustNotReturnNull', 'CreateSections');
        }

        return sections;
    }

    protected abstract CreateSections(): ArrayLike<Section>

    protected abstract SerializeSection(name: string, location: SectionLocation): BlobBuilder

    protected abstract GetDirectories(): PEDirectoriesBuilder;

    public Serialize(builder: BlobBuilder): BlobContentId {
        // Define and serialize sections in two steps.
        // We need to know about all sections before serializing them.
        const serializedSections = this.SerializeSections();

        // The positions and sizes of directories are calculated during section serialization.
        const directories = this.GetDirectories();

        PEBuilder.WritePESignature(builder);
        const stampFixup = this.WriteCoffHeader(builder, serializedSections);
        this.WritePEHeader(builder, directories, serializedSections);
        PEBuilder.WriteSectionHeaders(builder, serializedSections);
        builder.Align(this.Header.FileAlignment);

        for (const section of Array.from(serializedSections)) {
            builder.LinkSuffix(section.Builder);
            builder.Align(this.Header.FileAlignment);
        }

        const contentId = this.IdProvider(builder.GetBlobs().ToArray());

        // patch timestamp in COFF header:
        const stampWriter = BlobWriter.FromBlob(stampFixup);
        stampWriter.WriteUInt32(contentId.Stamp);
        assert(stampWriter.RemainingBytes == 0);

        return contentId;
    }

    private SerializeSections(): ArrayLike<SerializedSection> {
        const sections = Array.from(this.GetSections());
        const result = new Array<SerializedSection>();
        const sizeOfPeHeaders = this.Header.ComputeSizeOfPEHeaders(sections.length);

        let nextRva = BitArithmetic.Align32(sizeOfPeHeaders, this.Header.SectionAlignment);
        let nextPointer = BitArithmetic.Align32(sizeOfPeHeaders, this.Header.FileAlignment);

        for (const section of sections) {
            const builder = this.SerializeSection(section.Name, new SectionLocation(nextRva, nextPointer));

            const serialized = new SerializedSection(
                builder,
                section.Name,
                section.Characteristics,
                nextRva,
                BitArithmetic.Align32(builder.Count, this.Header.FileAlignment),
                nextPointer);

            result.push(serialized);

            nextRva = BitArithmetic.Align32(serialized.RelativeVirtualAddress + serialized.VirtualSize, this.Header.SectionAlignment);
            nextPointer = serialized.PointerToRawData + serialized.SizeOfRawData;
        }

        return [...result];
    }

    private static WritePESignature(builder: BlobBuilder): void {
        // MS-DOS stub (128 bytes)
        const header = PEBuilder.DosHeader;
        assert(PEBuilder.DosHeader.length == PEBuilder.DosHeaderSize);
        builder.WriteBytesArray(header, header.length);

        // PE Signature "PE\0\0"
        builder.WriteUInt32(PEHeaders.PESignature);
    }

    static DosHeaderSize = 0x80;

    private static get DosHeader(): Uint8Array {
        return Uint8Array.from([
            0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00,
            0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00,
            0xb8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,

            0x80, 0x00, 0x00, 0x00, // NT Header offset (0x80 == DosHeader.Length)

            0x0e, 0x1f, 0xba, 0x0e, 0x00, 0xb4, 0x09, 0xcd,
            0x21, 0xb8, 0x01, 0x4c, 0xcd, 0x21, 0x54, 0x68,
            0x69, 0x73, 0x20, 0x70, 0x72, 0x6f, 0x67, 0x72,
            0x61, 0x6d, 0x20, 0x63, 0x61, 0x6e, 0x6e, 0x6f,
            0x74, 0x20, 0x62, 0x65, 0x20, 0x72, 0x75, 0x6e,
            0x20, 0x69, 0x6e, 0x20, 0x44, 0x4f, 0x53, 0x20,
            0x6d, 0x6f, 0x64, 0x65, 0x2e, 0x0d, 0x0d, 0x0a,
            0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
    }

    private WriteCoffHeader(builder: BlobBuilder, sections: ArrayLike<SerializedSection>): Blob {
        // Machine
        builder.WriteUInt16((this.Header.Machine == 0 ? Machine.I386 : this.Header.Machine));

        // NumberOfSections
        builder.WriteUInt16(sections.length);

        // TimeDateStamp:
        const stampFixup = builder.ReserveBytes(sizeof('uint'));

        // PointerToSymbolTable (TODO: not supported):
        // The file pointer to the COFF symbol table, or zero if no COFF symbol table is present.
        // This value should be zero for a PE image.
        builder.WriteUInt32(0);

        // NumberOfSymbols (TODO: not supported):
        // The number of entries in the symbol table. This data can be used to locate the string table,
        // which immediately follows the symbol table. This value should be zero for a PE image.
        builder.WriteUInt32(0);

        // SizeOfOptionalHeader:
        // The size of the optional header, which is required for executable files but not for object files.
        // This value should be zero for an object file (TODO).
        builder.WriteUInt16(PEHeader.Size(this.Header.Is32Bit));

        // Characteristics
        builder.WriteUInt16(this.Header.ImageCharacteristics);

        return stampFixup;
    }

    private WritePEHeader(builder: BlobBuilder, directories: PEDirectoriesBuilder, sections: ArrayLike<SerializedSection>) {
        builder.WriteUInt16(this.Header.Is32Bit ? PEMagic.PE32 : PEMagic.PE32Plus);
        builder.WriteByte(this.Header.MajorLinkerVersion);
        builder.WriteByte(this.Header.MinorLinkerVersion);

        // SizeOfCode:
        builder.WriteUInt32(PEBuilder.SumRawDataSizes(sections, SectionCharacteristics.ContainsCode));

        // SizeOfInitializedData:
        builder.WriteUInt32(PEBuilder.SumRawDataSizes(sections, SectionCharacteristics.ContainsInitializedData));

        // SizeOfUninitializedData:
        builder.WriteUInt32(PEBuilder.SumRawDataSizes(sections, SectionCharacteristics.ContainsUninitializedData));

        // AddressOfEntryPoint:
        builder.WriteUInt32(directories.AddressOfEntryPoint);

        // BaseOfCode:
        const codeSectionIndex = PEBuilder.IndexOfSection(sections, SectionCharacteristics.ContainsCode);
        builder.WriteUInt32((codeSectionIndex != -1 ? sections[codeSectionIndex].RelativeVirtualAddress : 0));

        if (this.Header.Is32Bit) {
            // BaseOfData:
            const dataSectionIndex = PEBuilder.IndexOfSection(sections, SectionCharacteristics.ContainsInitializedData);
            builder.WriteUInt32((dataSectionIndex != -1 ? sections[dataSectionIndex].RelativeVirtualAddress : 0));

            builder.WriteUInt32(Number(this.Header.ImageBase));
        }
        else {
            builder.WriteUInt64(this.Header.ImageBase);
        }

        // NT additional fields:
        builder.WriteUInt32(this.Header.SectionAlignment);
        builder.WriteUInt32(this.Header.FileAlignment);
        builder.WriteUInt16(this.Header.MajorOperatingSystemVersion);
        builder.WriteUInt16(this.Header.MinorOperatingSystemVersion);
        builder.WriteUInt16(this.Header.MajorImageVersion);
        builder.WriteUInt16(this.Header.MinorImageVersion);
        builder.WriteUInt16(this.Header.MajorSubsystemVersion);
        builder.WriteUInt16(this.Header.MinorSubsystemVersion);

        // Win32VersionValue (reserved, should be 0)
        builder.WriteUInt32(0);

        // SizeOfImage:
        const lastSection = sections[sections.length - 1];
        builder.WriteUInt32(BitArithmetic.Align32(lastSection.RelativeVirtualAddress + lastSection.VirtualSize, this.Header.SectionAlignment));

        // SizeOfHeaders:
        builder.WriteUInt32(BitArithmetic.Align32(this.Header.ComputeSizeOfPEHeaders(sections.length), this.Header.FileAlignment));

        // Checksum:
        // Shall be zero for strong name signing.
        this._lazyChecksum = builder.ReserveBytes(sizeof('uint'));
        BlobWriter.FromBlob(this._lazyChecksum).WriteUInt32(0);

        builder.WriteUInt16(this.Header.Subsystem);
        builder.WriteUInt16(this.Header.DllCharacteristics);

        if (this.Header.Is32Bit) {
            builder.WriteUInt32(Number(this.Header.SizeOfStackReserve));
            builder.WriteUInt32(Number(this.Header.SizeOfStackCommit));
            builder.WriteUInt32(Number(this.Header.SizeOfHeapReserve));
            builder.WriteUInt32(Number(this.Header.SizeOfHeapCommit));
        }
        else {
            builder.WriteUInt64(this.Header.SizeOfStackReserve);
            builder.WriteUInt64(this.Header.SizeOfStackCommit);
            builder.WriteUInt64(this.Header.SizeOfHeapReserve);
            builder.WriteUInt64(this.Header.SizeOfHeapCommit);
        }

        // LoaderFlags
        builder.WriteUInt32(0);

        // The number of data-directory entries in the remainder of the header.
        builder.WriteUInt32(16);

        // directory entries:
        builder.WriteUInt32(directories.ExportTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.ExportTable.Size);
        builder.WriteUInt32(directories.ImportTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.ImportTable.Size);
        builder.WriteUInt32(directories.ResourceTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.ResourceTable.Size);
        builder.WriteUInt32(directories.ExceptionTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.ExceptionTable.Size);

        // Authenticode CertificateTable directory. Shall be zero before the PE is signed.
        builder.WriteUInt32(0);
        builder.WriteUInt32(0);

        builder.WriteUInt32(directories.BaseRelocationTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.BaseRelocationTable.Size);
        builder.WriteUInt32(directories.DebugTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.DebugTable.Size);
        builder.WriteUInt32(directories.CopyrightTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.CopyrightTable.Size);
        builder.WriteUInt32(directories.GlobalPointerTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.GlobalPointerTable.Size);
        builder.WriteUInt32(directories.ThreadLocalStorageTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.ThreadLocalStorageTable.Size);
        builder.WriteUInt32(directories.LoadConfigTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.LoadConfigTable.Size);
        builder.WriteUInt32(directories.BoundImportTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.BoundImportTable.Size);
        builder.WriteUInt32(directories.ImportAddressTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.ImportAddressTable.Size);
        builder.WriteUInt32(directories.DelayImportTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.DelayImportTable.Size);
        builder.WriteUInt32(directories.CorHeaderTable.RelativeVirtualAddress);
        builder.WriteUInt32(directories.CorHeaderTable.Size);

        // Reserved, should be 0
        builder.WriteUInt64(BigInt(0));
    }

    private static WriteSectionHeaders(builder: BlobBuilder, serializedSections: ArrayLike<SerializedSection>) {
        for (const serializedSection of Array.from(serializedSections)) {
            PEBuilder.WriteSectionHeader(builder, serializedSection);
        }
    }

    private static WriteSectionHeader(builder: BlobBuilder, serializedSection: SerializedSection) {
        if (serializedSection.VirtualSize == 0) {
            return;
        }

        for (let j = 0, m = serializedSection.Name.length; j < 8; j++) {
            if (j < m) {
                builder.WriteByte(serializedSection.Name.charCodeAt(j));
            }
            else {
                builder.WriteByte(0);
            }
        }

        builder.WriteUInt32(serializedSection.VirtualSize);
        builder.WriteUInt32(serializedSection.RelativeVirtualAddress);
        builder.WriteUInt32(serializedSection.SizeOfRawData);
        builder.WriteUInt32(serializedSection.PointerToRawData);

        // PointerToRelocations (TODO: not supported):
        builder.WriteUInt32(0);

        // PointerToLinenumbers (TODO: not supported):
        builder.WriteUInt32(0);

        // NumberOfRelocations (TODO: not supported):
        builder.WriteUInt16(0);

        // NumberOfLinenumbers (TODO: not supported):
        builder.WriteUInt16(0);

        builder.WriteUInt32(serializedSection.Characteristics);
    }

    private static IndexOfSection(sections: ArrayLike<SerializedSection>, characteristics: SectionCharacteristics) {
        for (let i = 0; i < sections.length; i++) {
            if ((sections[i].Characteristics & characteristics) == characteristics) {
                return i;
            }
        }

        return -1;
    }

    private static SumRawDataSizes(sections: ArrayLike<SerializedSection>, characteristics: SectionCharacteristics): number {
        let result = 0;
        for (let i = 0; i < sections.length; i++) {
            if ((sections[i].Characteristics & characteristics) == characteristics) {
                result += sections[i].SizeOfRawData;
            }
        }

        return result;
    }

    // // internal for testing
    // internal static IEnumerable<Blob> GetContentToSign(BlobBuilder peImage, int peHeadersSize, int peHeaderAlignment, Blob strongNameSignatureFixup)
    // {
    //     // Signed content includes
    //     // - PE header without its alignment padding
    //     // - all sections including their alignment padding and excluding strong name signature blob

    //     // PE specification:
    //     //   To calculate the PE image hash, Authenticode orders the sections that are specified in the section table
    //     //   by address range, then hashes the resulting sequence of bytes, passing over the exclusion ranges.
    //     //
    //     // Note that sections are by construction ordered by their address, so there is no need to reorder.

    //     int remainingHeaderToSign = peHeadersSize;
    //     int remainingHeader = BitArithmetic.Align(peHeadersSize, peHeaderAlignment);
    //     foreach (const blob in peImage.GetBlobs())
    //     {
    //         int blobStart = blob.Start;
    //         int blobLength = blob.Length;
    //         while (blobLength > 0)
    //         {
    //             if (remainingHeader > 0)
    //             {
    //                 int length;

    //                 if (remainingHeaderToSign > 0)
    //                 {
    //                     length = Math.Min(remainingHeaderToSign, blobLength);
    //                     yield return new Blob(blob.Buffer, blobStart, length);
    //                     remainingHeaderToSign -= length;
    //                 }
    //                 else
    //                 {
    //                     length = Math.Min(remainingHeader, blobLength);
    //                 }

    //                 remainingHeader -= length;
    //                 blobStart += length;
    //                 blobLength -= length;
    //             }
    //             else if (blob.Buffer == strongNameSignatureFixup.Buffer)
    //             {
    //                 yield return GetPrefixBlob(new Blob(blob.Buffer, blobStart, blobLength), strongNameSignatureFixup);
    //                 yield return GetSuffixBlob(new Blob(blob.Buffer, blobStart, blobLength), strongNameSignatureFixup);
    //                 break;
    //             }
    //             else
    //             {
    //                 yield return new Blob(blob.Buffer, blobStart, blobLength);
    //                 break;
    //             }
    //         }
    //     }
    // }

    // // internal for testing
    // internal static Blob GetPrefixBlob(Blob container, Blob blob) => new Blob(container.Buffer, container.Start, blob.Start - container.Start);
    // internal static Blob GetSuffixBlob(Blob container, Blob blob) => new Blob(container.Buffer, blob.Start + blob.Length, container.Start + container.Length - blob.Start - blob.Length);

    // // internal for testing
    // internal static IEnumerable<Blob> GetContentToChecksum(BlobBuilder peImage, Blob checksumFixup)
    // {
    //     foreach (const blob in peImage.GetBlobs())
    //     {
    //         if (blob.Buffer == checksumFixup.Buffer)
    //         {
    //             yield return GetPrefixBlob(blob, checksumFixup);
    //             yield return GetSuffixBlob(blob, checksumFixup);
    //         }
    //         else
    //         {
    //             yield return blob;
    //         }
    //     }
    // }

    // internal void Sign(BlobBuilder peImage, Blob strongNameSignatureFixup, Func<IEnumerable<Blob>, byte[]> signatureProvider)
    // {
    //     assert(peImage != null);
    //     assert(signatureProvider != null);

    //     int peHeadersSize = Header.ComputeSizeOfPEHeaders(GetSections().Length);
    //     byte[] signature = signatureProvider(GetContentToSign(peImage, peHeadersSize, Header.FileAlignment, strongNameSignatureFixup));

    //     // signature may be shorter (the rest of the reserved space is padding):
    //     if (signature == null || signature.Length > strongNameSignatureFixup.Length)
    //     {
    //         throw new InvalidOperationException(SR.SignatureProviderReturnedInvalidSignature);
    //     }

    //     const writer = new BlobWriter(strongNameSignatureFixup);
    //     writer.WriteBytes(signature);

    //     // Calculate the checksum after the strong name signature has been written.
    //     uint checksum = CalculateChecksum(peImage, _lazyChecksum);
    //     new BlobWriter(_lazyChecksum).WriteUInt32(checksum);
    // }

    // // internal for testing
    // internal static uint CalculateChecksum(BlobBuilder peImage, Blob checksumFixup)
    // {
    //     return CalculateChecksum(GetContentToChecksum(peImage, checksumFixup)) + peImage.Count;
    // }

    // private static unsafe uint CalculateChecksum(IEnumerable<Blob> blobs)
    // {
    //     uint checksum = 0;
    //     int pendingByte = -1;

    //     foreach (const blob in blobs)
    //     {
    //         const segment = blob.GetBytes();
    //         fixed (byte* arrayPtr = segment.Array)
    //         {
    //             assert(segment.Count > 0);

    //             byte* ptr = arrayPtr + segment.Offset;
    //             byte* end = ptr + segment.Count;

    //             if (pendingByte >= 0)
    //             {
    //                 // little-endian encoding:
    //                 checksum = AggregateChecksum(checksum, (ushort)(*ptr << 8 | pendingByte));
    //                 ptr++;
    //             }

    //             if ((end - ptr) % 2 != 0)
    //             {
    //                 end--;
    //                 pendingByte = *end;
    //             }
    //             else
    //             {
    //                 pendingByte = -1;
    //             }

    //             while (ptr < end)
    //             {
    //                 // little-endian encoding:
    //                 checksum = AggregateChecksum(checksum, (ushort)(ptr[1] << 8 | ptr[0]));
    //                 ptr += sizeof(ushort);
    //             }
    //         }
    //     }

    //     if (pendingByte >= 0)
    //     {
    //         checksum = AggregateChecksum(checksum, (ushort)pendingByte);
    //     }

    //     return checksum;
    // }

    // private static uint AggregateChecksum(uint checksum, ushort value)
    // {
    //     uint sum = checksum + value;
    //     return (sum >> 16) + unchecked((ushort)sum);
    // }
}