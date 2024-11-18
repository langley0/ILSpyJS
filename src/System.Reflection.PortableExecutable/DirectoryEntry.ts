import {PEBinaryReader} from "./PEBinaryReader";

export class DirectoryEntry
    {
        public readonly RelativeVirtualAddress: number;
        public readonly Size: number;
        

        public constructor(relativeVirtualAddress: number, size: number)
        {
            this.RelativeVirtualAddress = relativeVirtualAddress;
            this.Size = size;
        }

        public static FromReader(reader: PEBinaryReader) {
            const relativeVirtualAddress = reader.ReadInt32();
            const size = reader.ReadInt32();
            return new DirectoryEntry(relativeVirtualAddress, size);
        }
    }