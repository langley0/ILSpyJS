export * from './Throw';
export * from "./Version";
export * from "./Guid";  
export * from "./Type";
export * from "./BitConverter";
export * from "./Attribute"; 

export function sizeof(type: 'byte' | 'int' | 'uint' | 'long' | 'ulong' | 'float' | 'double' | 'boolean' | 'short' | 'ushort' | 'Guid'): number {
    switch (type) {
        case 'byte':
            return 1;
        case 'short':
        case 'ushort':
            return 2;
        case 'int':
        case 'uint':
            return 4;
        case 'long':
        case 'ulong':
            return 8;
        case 'float':
            return 4;
        case 'double':
            return 8;
        case 'boolean':
            return 1;
        case 'Guid':
            return 16;
        default:
            throw new Error(`Invalid type: ${type}`);
    }
}