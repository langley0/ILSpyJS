import assert from "assert";
import { Throw } from "System"
import { BlobBuilder } from "./BlobBuilder";
import { BlobWriter } from "./BlobWriter";


export class BlobWriterImpl {
    public static readonly SingleByteCompressedIntegerMaxValue = 0x7f;
    public static readonly TwoByteCompressedIntegerMaxValue = 0x3fff;
    public static readonly MaxCompressedIntegerValue = 0x1fffffff;
    public static readonly MinSignedCompressedIntegerValue = 0xF0000000;
    public static readonly MaxSignedCompressedIntegerValue = 0x0FFFFFFF;

    public static GetCompressedIntegerSize(value: number): number {
        assert(value <= BlobWriterImpl.MaxCompressedIntegerValue);

        if (value <= BlobWriterImpl.SingleByteCompressedIntegerMaxValue) {
            return 1;
        }

        if (value <= BlobWriterImpl.TwoByteCompressedIntegerMaxValue) {
            return 2;
        }

        return 4;
    }

    public static WriteCompressedInteger(writer: BlobWriter, value: number): void {
        if (value <= BlobWriterImpl.SingleByteCompressedIntegerMaxValue) {
            writer.WriteByte(value);
        }
        else if (value <= BlobWriterImpl.TwoByteCompressedIntegerMaxValue) {
            writer.WriteUInt16BE(0x8000 | value);
        }
        else if (value <= BlobWriterImpl.MaxCompressedIntegerValue) {
            writer.WriteUInt32BE(0xc0000000 | value);
        }
        else {
            Throw.ArgumentOutOfRange("value");
        }

    }



    // public static  WriteCompressedSignedInteger(BlobWriter writer, int value)
    // {
    //     unchecked
    //     {
    //         const int b6 = (1 << 6) - 1;
    //         const int b13 = (1 << 13) - 1;
    //         const int b28 = (1 << 28) - 1;

    //         // 0xffffffff for negative value
    //         // 0x00000000 for non-negative
    //         int signMask = value >> 31;

    //         if ((value & ~b6) == (signMask & ~b6))
    //         {
    //             int n = ((value & b6) << 1) | (signMask & 1);
    //             writer.WriteByte((byte)n);
    //         }
    //         else if ((value & ~b13) == (signMask & ~b13))
    //         {
    //             int n = ((value & b13) << 1) | (signMask & 1);
    //             writer.WriteUInt16BE((ushort)(0x8000 | n));
    //         }
    //         else if ((value & ~b28) == (signMask & ~b28))
    //         {
    //             int n = ((value & b28) << 1) | (signMask & 1);
    //             writer.WriteUInt32BE(0xc0000000 | (uint)n);
    //         }
    //         else
    //         {
    //             Throw.ValueArgumentOutOfRange();
    //         }
    //     }
    // }

    // public static void WriteCompressedSignedInteger(BlobBuilder writer, int value)
    // {
    //     unchecked
    //     {
    //         const int b6 = (1 << 6) - 1;
    //         const int b13 = (1 << 13) - 1;
    //         const int b28 = (1 << 28) - 1;

    //         // 0xffffffff for negative value
    //         // 0x00000000 for non-negative
    //         int signMask = value >> 31;

    //         if ((value & ~b6) == (signMask & ~b6))
    //         {
    //             int n = ((value & b6) << 1) | (signMask & 1);
    //             writer.WriteByte((byte)n);
    //         }
    //         else if ((value & ~b13) == (signMask & ~b13))
    //         {
    //             int n = ((value & b13) << 1) | (signMask & 1);
    //             writer.WriteUInt16BE((ushort)(0x8000 | n));
    //         }
    //         else if ((value & ~b28) == (signMask & ~b28))
    //         {
    //             int n = ((value & b28) << 1) | (signMask & 1);
    //             writer.WriteUInt32BE(0xc0000000 | (uint)n);
    //         }
    //         else
    //         {
    //             Throw.ValueArgumentOutOfRange();
    //         }
    //     }
    // }

    // public static void WriteConstant(ref BlobWriter writer, object? value)
    // {
    //     if (value == undefined)
    //     {
    //         // The encoding of Type for the nullref value for FieldInit is ELEMENT_TYPE_CLASS with a Value of a 32-bit.
    //         writer.WriteUInt32(0);
    //         return;
    //     }

    //     var type = value.GetType();
    //     if (type.GetTypeInfo().IsEnum)
    //     {
    //         type = Enum.GetUnderlyingType(type);
    //     }

    //     if (type == typeof(bool))
    //     {
    //         writer.WriteBoolean((bool)value);
    //     }
    //     else if (type == typeof)
    //     {
    //         writer.WriteInt32(value);
    //     }
    //     else if (type == typeof(string))
    //     {
    //         writer.WriteUTF16((string)value);
    //     }
    //     else if (type == typeof(byte))
    //     {
    //         writer.WriteByte((byte)value);
    //     }
    //     else if (type == typeof(char))
    //     {
    //         writer.WriteUInt16((char)value);
    //     }
    //     else if (type == typeof(double))
    //     {
    //         writer.WriteDouble((double)value);
    //     }
    //     else if (type == typeof(short))
    //     {
    //         writer.WriteInt16((short)value);
    //     }
    //     else if (type == typeof(long))
    //     {
    //         writer.WriteInt64((long)value);
    //     }
    //     else if (type == typeof(sbyte))
    //     {
    //         writer.WriteSByte((sbyte)value);
    //     }
    //     else if (type == typeof(float))
    //     {
    //         writer.WriteSingle((float)value);
    //     }
    //     else if (type == typeof(ushort))
    //     {
    //         writer.WriteUInt16((ushort)value);
    //     }
    //     else if (type == typeof(uint))
    //     {
    //         writer.WriteUInt32((uint)value);
    //     }
    //     else if (type == typeof(ulong))
    //     {
    //         writer.WriteUInt64((ulong)value);
    //     }
    //     else
    //     {
    //         throw new ArgumentException(SR.Format(SR.InvalidConstantValueOfType, type));
    //     }
    // }

    // public static void WriteConstant(BlobBuilder writer, object? value)
    // {
    //     if (value == undefined)
    //     {
    //         // The encoding of Type for the nullref value for FieldInit is ELEMENT_TYPE_CLASS with a Value of a 32-bit.
    //         writer.WriteUInt32(0);
    //         return;
    //     }

    //     var type = value.GetType();
    //     if (type.GetTypeInfo().IsEnum)
    //     {
    //         type = Enum.GetUnderlyingType(type);
    //     }

    //     if (type == typeof(bool))
    //     {
    //         writer.WriteBoolean((bool)value);
    //     }
    //     else if (type == typeof)
    //     {
    //         writer.WriteInt32(value);
    //     }
    //     else if (type == typeof(string))
    //     {
    //         writer.WriteUTF16((string)value);
    //     }
    //     else if (type == typeof(byte))
    //     {
    //         writer.WriteByte((byte)value);
    //     }
    //     else if (type == typeof(char))
    //     {
    //         writer.WriteUInt16((char)value);
    //     }
    //     else if (type == typeof(double))
    //     {
    //         writer.WriteDouble((double)value);
    //     }
    //     else if (type == typeof(short))
    //     {
    //         writer.WriteInt16((short)value);
    //     }
    //     else if (type == typeof(long))
    //     {
    //         writer.WriteInt64((long)value);
    //     }
    //     else if (type == typeof(sbyte))
    //     {
    //         writer.WriteSByte((sbyte)value);
    //     }
    //     else if (type == typeof(float))
    //     {
    //         writer.WriteSingle((float)value);
    //     }
    //     else if (type == typeof(ushort))
    //     {
    //         writer.WriteUInt16((ushort)value);
    //     }
    //     else if (type == typeof(uint))
    //     {
    //         writer.WriteUInt32((uint)value);
    //     }
    //     else if (type == typeof(ulong))
    //     {
    //         writer.WriteUInt64((ulong)value);
    //     }
    //     else
    //     {
    //         throw new ArgumentException(SR.Format(SR.InvalidConstantValueOfType, type));
    //     }
    // }
}

export class BlobBuilderImpl {
    public static WriteCompressedInteger(writer: BlobBuilder, value: number): void {
        if (value <= BlobWriterImpl.SingleByteCompressedIntegerMaxValue) {
            writer.WriteByte(value);
        }
        else if (value <= BlobWriterImpl.TwoByteCompressedIntegerMaxValue) {
            writer.WriteUInt16BE(0x8000 | value);
        }
        else if (value <= BlobWriterImpl.MaxCompressedIntegerValue) {
            writer.WriteUInt32BE(0xc0000000 | value);
        }
        else {
            Throw.ArgumentOutOfRange("value");
        }
    }
}
