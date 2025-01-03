import assert from "assert";
import { SequenceEqual } from "System.Collections";
import {
    PEBuilder,
    PEDirectoriesBuilder,
    PEHeaderBuilder,
    Section,
    SectionLocation,
    DirectoryEntry,
} from "System.Reflection.PortableExecutable";

import {
    BlobBuilder,
    BlobContentId,

} from "System.Reflection.Metadata";

class TestPEBuilder extends PEBuilder {
    private readonly _dirBuilder = new PEDirectoriesBuilder();

    public constructor() {
        super(
            new PEHeaderBuilder(/*machine*/0, /*sectionAlignment: */512, /*fileAlignment: */512),
            _ => new BlobContentId(new Uint8Array(), 0));
    }

    protected override CreateSections(): ArrayLike<Section> {
        return [
            new Section(".s1", 0),
            new Section(".s2", 0),
            new Section(".s3", 0),
        ];
    }

    protected override SerializeSection(name: string, location: SectionLocation): BlobBuilder {
        if (name == ".s2") {
            this._dirBuilder.CopyrightTable = new DirectoryEntry(location.RelativeVirtualAddress + 5, 10);
        }

        var builder = new BlobBuilder();
        builder.WriteBytes(name.charCodeAt(name.length - 1), 10);
        return builder;
    }

    public override GetDirectories(): PEDirectoriesBuilder {
        return this._dirBuilder;
    }
}


export class SynthesizedPeImages {
    public static readonly Image1: Uint8Array = SynthesizedPeImages.CreateImage();

    private static CreateImage(): Uint8Array {
        const peBuilder = new TestPEBuilder();

        const peImageBuilder = new BlobBuilder();
        var contentId = peBuilder.Serialize(peImageBuilder);
        var peImage = peImageBuilder.ToImmutableArray();

        const correctImage = Buffer.concat([Uint8Array.from([
            // headers:
            0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00,
            0xB8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00,
            0x0E, 0x1F, 0xBA, 0x0E, 0x00, 0xB4, 0x09, 0xCD, 0x21, 0xB8, 0x01, 0x4C, 0xCD, 0x21, 0x54, 0x68,
            0x69, 0x73, 0x20, 0x70, 0x72, 0x6F, 0x67, 0x72, 0x61, 0x6D, 0x20, 0x63, 0x61, 0x6E, 0x6E, 0x6F,
            0x74, 0x20, 0x62, 0x65, 0x20, 0x72, 0x75, 0x6E, 0x20, 0x69, 0x6E, 0x20, 0x44, 0x4F, 0x53, 0x20,
            0x6D, 0x6F, 0x64, 0x65, 0x2E, 0x0D, 0x0D, 0x0A, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x50, 0x45, 0x00, 0x00, 0x4C, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0xE0, 0x00, 0x00, 0x20, 0x0B, 0x01, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
            0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x08, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x40, 0x85,
            0x00, 0x00, 0x10, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x10, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x05, 0x04, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x73, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x0A, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x2E, 0x73, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00,
            0x00, 0x02, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x73, 0x33, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x0A, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]),
        // .s1
        SynthesizedPeImages.Pad(512, Uint8Array.from([0x31, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31])),
        // .s2
        SynthesizedPeImages.Pad(512, Uint8Array.from([0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32])),
        // .s3
        SynthesizedPeImages.Pad(512, Uint8Array.from([0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33])),
        ]);

        assert(SequenceEqual(correctImage, peImage));

        return peImage;
    }

    private static Pad(length: number, bytes: Uint8Array): Uint8Array {
        assert(bytes.length <= length);
        var result = new Uint8Array(length).fill(0);
        for (let i = 0; i < bytes.length; i++) {
            result[i] = bytes[i];
        }
        return result;
    }
}
