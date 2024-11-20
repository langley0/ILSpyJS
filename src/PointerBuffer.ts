// export default class PointerBuffer {
//     private _buffer: Uint8Array;
//     private _offset: number;

//     public static  SharedBuffer(_buffer: Uint8Array): PointerBuffer {
//         const pointer =  new PointerBuffer(0);
//         pointer._buffer = _buffer;
//         return pointer;
//     }

//     constructor(size: number) {
//         this._buffer = new Uint8Array(size);
//         this._offset = 0;
//     }

//     public get Memory(): Uint8Array {
//         return this._buffer;
//     }

//     public get Offset(): number {
//         return this._offset;
//     }

//     public PointerTo(offset: number): PointerBuffer {
//         const pointer = new PointerBuffer(0);
//         pointer._buffer = this._buffer;
//         pointer._offset = offset + this._offset;
//         return pointer;
//     }
    
// }