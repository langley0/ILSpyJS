import assert from "assert";
import {
    PEBinaryReader,
    SectionHeader,
} from "System.Reflection.PortableExecutable";
import { MemoryStream } from "System.IO";


export function ReadNullPaddedUTF8RemovesNullPadding() {
    const headerBytes = new Uint8Array(SectionHeader.NameSize).fill(0);
    headerBytes[0] = 80;
    headerBytes[1] = 80;
    headerBytes[2] = 80;

    var stream = new MemoryStream(headerBytes);
    stream.Position = 0;

    var reader = new PEBinaryReader(stream, headerBytes.length);
    var text = reader.ReadNullPaddedUTF8(SectionHeader.NameSize);

    assert(3 == text.length);
    assert("PPP" == text);
}

export function ReadNullPaddedUTF8WorksWithNoNullPadding() {
    const headerBytes = Uint8Array.from(Buffer.from(".abcdefg"));
    var stream = new MemoryStream(headerBytes);
    stream.Position = 0;

    var reader = new PEBinaryReader(stream, headerBytes.length);
    var text = reader.ReadNullPaddedUTF8(SectionHeader.NameSize);

    assert(".abcdefg", text);
}
