import assert from "assert"
import { Machine } from "System.Reflection.Metadata";
import { PEReader, PEHeaderBuilder, SectionHeader, CoffHeader, PEHeader, DirectoryEntry } from "System.Reflection.PortableExecutable";

import { SynthesizedPeImages } from "./TestResources";

export function Sizes() {
    assert(20 == CoffHeader.Size);
    assert(224 == PEHeader.Size(true));
    assert(240 == PEHeader.Size(false));
    assert(8 == SectionHeader.NameSize);
    assert(40 == SectionHeader.Size);

    assert(128 + 4 + 20 + 224 == new PEHeaderBuilder(Machine.I386).ComputeSizeOfPEHeaders(0));
    assert(128 + 4 + 20 + 224 + 16 == new PEHeaderBuilder(Machine.Amd64).ComputeSizeOfPEHeaders(0));
    assert(128 + 4 + 20 + 224 + 16 + 40 * 1 == new PEHeaderBuilder(Machine.Amd64).ComputeSizeOfPEHeaders(1));
    assert(128 + 4 + 20 + 224 + 16 + 40 * 2 == new PEHeaderBuilder(Machine.Amd64).ComputeSizeOfPEHeaders(2));
    assert(128 + 4 + 20 + 224 + 16 == new PEHeaderBuilder(Machine.Arm64).ComputeSizeOfPEHeaders(0));
    assert(128 + 4 + 20 + 224 + 16 + 40 * 1 == new PEHeaderBuilder(Machine.Arm64).ComputeSizeOfPEHeaders(1));
    assert(128 + 4 + 20 + 224 + 16 + 40 * 2 == new PEHeaderBuilder(Machine.Arm64).ComputeSizeOfPEHeaders(2));
}


       
export function  Sections()
{
    var peHeaders = PEReader.FromBuffer(SynthesizedPeImages.Image1).PEHeaders;
    // AssertEx.Equal([
    //     ".s1 offset=0x200 rva=0x200 size=512",
    //     ".s2 offset=0x400 rva=0x400 size=512",
    //     ".s3 offset=0x600 rva=0x600 size=512"
    // ] peHeaders.SectionHeaders.Select(h => $"{h.Name} offset=0x{h.PointerToRawData:x3} rva=0x{h.VirtualAddress:x3} size={h.SizeOfRawData}"));
}

        // export function  GetContainingSectionIndex()
        // {
        //     var peHeaders = new PEReader(SynthesizedPeImages.Image1).PEHeaders;

        //     assert(-1, peHeaders.GetContainingSectionIndex(0));
        //     assert(-1, peHeaders.GetContainingSectionIndex(0x200 - 1));
        //     assert(0, peHeaders.GetContainingSectionIndex(0x200));
        //     assert(1, peHeaders.GetContainingSectionIndex(0x400));
        //     assert(2, peHeaders.GetContainingSectionIndex(0x600));
        //     assert(2, peHeaders.GetContainingSectionIndex(0x600 + 9));
        //     assert(-1, peHeaders.GetContainingSectionIndex(0x600 + 10));
        // }

        // export function  TryGetDirectoryOffset()
        // {
        //     var peHeaders = new PEReader(SynthesizedPeImages.Image1).PEHeaders;
        //     var dir = peHeaders.PEHeader.CopyrightTableDirectory;

        //     assert(0x400 + 5, dir.RelativeVirtualAddress);
        //     assert(10, dir.Size);

        //     int dirOffset;
        //     Assert.True(peHeaders.TryGetDirectoryOffset(dir, out dirOffset));
        //     assert(0x400 + 5, dirOffset);

        //     Assert.False(peHeaders.TryGetDirectoryOffset(new DirectoryEntry(0, 10), out dirOffset));
        //     assert(-1, dirOffset);

        //     Assert.True(peHeaders.TryGetDirectoryOffset(new DirectoryEntry(0x600, 0x300), out dirOffset));
        //     assert(0x600, dirOffset);

        //     Assert.False(peHeaders.TryGetDirectoryOffset(new DirectoryEntry(0x1000, 10), out dirOffset));
        //     assert(-1, dirOffset);
        // }