import { sizeof } from "System";
import { Machine } from "System.Reflection.Metadata";
import { Characteristics } from "./PEFileFlags";
import { PEBinaryReader } from "./PEBinaryReader";

export class CoffHeader
    {
        private readonly _machine: Machine;
        private readonly _numberOfSections: number;
        private readonly _timeDateStamp: number;
        private readonly _pointerToSymbolTable: number;
        private readonly _numberOfSymbols: number;
        private readonly _sizeOfOptionalHeader: number;
        private readonly _characteristics: Characteristics;

        /// <summary>
        /// The type of target machine.
        /// </summary>
        public get Machine(): Machine { 
            return this._machine;
        }

        /// <summary>
        /// The number of sections. This indicates the size of the section table, which immediately follows the headers.
        /// </summary>
        public get NumberOfSections(): number {
            return this._numberOfSections;
        }

        /// <summary>
        /// The low 32 bits of the number of seconds since 00:00 January 1, 1970, that indicates when the file was created.
        /// </summary>
        public get TimeDateStamp(): number {
            return this._timeDateStamp;
        }

        /// <summary>
        /// The file pointer to the COFF symbol table, or zero if no COFF symbol table is present.
        /// This value should be zero for a PE image.
        /// </summary>
        public  get PointerToSymbolTable(): number {
            return this._pointerToSymbolTable;
        }

        /// <summary>
        /// The number of entries in the symbol table. This data can be used to locate the string table,
        /// which immediately follows the symbol table. This value should be zero for a PE image.
        /// </summary>
        public get NumberOfSymbols(): number {
            return this._numberOfSymbols;
        }

        /// <summary>
        /// The size of the optional header, which is required for executable files but not for object files.
        /// This value should be zero for an object file.
        /// </summary>
        public get SizeOfOptionalHeader(): number {
            return this._sizeOfOptionalHeader;
        }

        /// <summary>
        /// The flags that indicate the attributes of the file.
        /// </summary>
        public get Characteristics(): Characteristics {
            return this._characteristics;
        }

        static Size =
            sizeof('short') + // Machine
            sizeof('short') + // NumberOfSections
            sizeof('int') +   // TimeDateStamp:
            sizeof('int') +   // PointerToSymbolTable
            sizeof('int') +   // NumberOfSymbols
            sizeof('short') + // SizeOfOptionalHeader:
            sizeof('ushort'); // Characteristics

        public constructor(reader: PEBinaryReader)
        {
            this._machine = reader.ReadUInt16();
            this._numberOfSections = reader.ReadInt16();
            this._timeDateStamp = reader.ReadInt32();
            this._pointerToSymbolTable = reader.ReadInt32();
            this._numberOfSymbols = reader.ReadInt32();
            this._sizeOfOptionalHeader = reader.ReadInt16();
            this._characteristics = reader.ReadUInt16();
        }
    }