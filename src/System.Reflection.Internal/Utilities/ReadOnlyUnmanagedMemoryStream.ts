import { Throw } from "System";
import { Stream, SeekOrigin } from "System.IO";

export class ReadOnlyUnmanagedMemoryStream extends Stream
{
    private readonly _data: Uint8Array;
    private readonly _length: number;
    private _position: number;

    public constructor(data:Uint8Array , length: number)
    {
        super();
        this._data = data;
        this._length = length;
        this._position = 0;
    }

//     public override unsafe int ReadByte()
//     {
//         if (_position >= _length)
//         {
//             return -1;
//         }

//         return _data[_position++];
//     }

    public override Read(buffer: Uint8Array,  offset: number,  count: number): number
    {
        const bytesRead = Math.min(count, this._length - this._position);
        for (let i = 0; i < bytesRead; i++)
        {
            buffer[offset + i] = this._data[this._position + i];
        }
        this._position += bytesRead;
        return bytesRead;
    }

// #if NET
//     // Duplicate the Read(byte[]) logic here instead of refactoring both to use Spans
//     // so we don't affect perf on .NET Framework.
//     public override int Read(Span<byte> buffer)
//     {
//         int bytesRead = Math.Min(buffer.Length, _length - _position);
//         new Span<byte>(_data + _position, bytesRead).CopyTo(buffer);
//         _position += bytesRead;
//         return bytesRead;
//     }
// #endif

//     public override void Flush()
//     {
//     }

    public override get CanRead(): boolean {
        return true;
    } 
    public override get CanSeek(): boolean {
        return true;
    }
    public override get CanWrite(): boolean {
        return false;
    }
    public override get Length() : number {
        return this._length;
    }

    public override get Position() : number 
    {
            return this._position;
    }

    public override set Position(value: number) {
        this.Seek(value, SeekOrigin.Begin);
        
    }

    public override Seek(offset: number,  origin: SeekOrigin): number
    {
        let target: number = -1;
        if(origin == SeekOrigin.Begin) {
            target = offset;
        } else if (origin == SeekOrigin.Current) {
            target = offset + this._position;
        } else if (origin == SeekOrigin.End) {
            target = offset + this._length;
        }
    
        if (target < 0 || target > Number.MAX_VALUE)
        {
            Throw.ArgumentOutOfRange('offset');
        }

        this._position = target;
        return target;
    }

//     public override void SetLength(long value)
//     {
//         throw new NotSupportedException();
//     }

//     public override void Write(byte[] buffer, int offset, int count)
//     {
//         throw new NotSupportedException();
//     }
}