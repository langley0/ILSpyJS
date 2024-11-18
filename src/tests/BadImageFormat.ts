import assert from 'assert';
import { MemoryStream } from 'System.IO';
import { PEHeaders } from 'System.Reflection.PortableExecutable';

export function InvalidSectionCount() {
    const pe = new MemoryStream([
        0xd0, 0xcf, 0x11, 0xe0, 0xa1,
        0xb1, 0x1a, 0xe1, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00,
        0x00,
    ]);

    try {
        new PEHeaders(pe);
    } catch(e: any) {
        assert.equal(e.message, "BadImageFormatException");
    }
}
