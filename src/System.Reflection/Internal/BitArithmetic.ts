import assert from "assert";

function devideBigIntTo32Bits(v: bigint): [number, number] {
    const BitDivider = BigInt(0x100000000);
    return [
        Number((v / BitDivider) % BitDivider),
        Number(v % BitDivider)
    ];
}

function merge32BitsToBigInt(high: number, low: number): bigint {
    return BigInt(high) * BigInt(0x100000000) + BigInt(low);
}

export class BitArithmetic {
    static SetBit64(bitIndex: number): bigint {
        return BitArithmetic._ShiftLeft64(BigInt(1), bitIndex);
    }

    public static Count32Bits(v: number): number {
        v -= ((v >> 1) & 0x55555555);
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
        return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
    }

    public static Count64Bits(v: bigint): number {
        let [hv, lv] = devideBigIntTo32Bits(v);

        // low bits count + high bits count
        return BitArithmetic.Count32Bits(lv) + BitArithmetic.Count32Bits(hv);
    }

    public static Align32(position: number, alignment: number) {
        assert(position >= 0 && alignment > 0);
        assert(BitArithmetic.Count32Bits(alignment) == 1);

        const result = position & ~(alignment - 1);
        if (result == position) {
            return result;
        }

        return result + alignment;
    }

    public static Or64(a: bigint, b: bigint): bigint {
        const [ah, al] = devideBigIntTo32Bits(a);
        const [bh, bl] = devideBigIntTo32Bits(b);

        return merge32BitsToBigInt(ah | bh, al | bl);
    }

    public static And64(a: bigint, b: bigint): bigint {
        const [ah, al] = devideBigIntTo32Bits(a);
        const [bh, bl] = devideBigIntTo32Bits(b);

        return merge32BitsToBigInt(ah & bh, al & bl);
    }

    private static _ShiftLeft64(v: bigint, shiftBit: number): bigint {
        assert(shiftBit < 64);
        const [high, low] = devideBigIntTo32Bits(v);

        if (shiftBit < 32) {
            return merge32BitsToBigInt((high << shiftBit) | (low >>> (32 - shiftBit)), low << shiftBit);
           
        } 

        return merge32BitsToBigInt(low << (shiftBit - 32), 0);
    }

    private static _ShiftRight64(v: bigint, shiftBit: number): bigint {
        assert(shiftBit < 64);
        const [high, low] = devideBigIntTo32Bits(v);

        if (shiftBit < 32) {
            return merge32BitsToBigInt(high >>> shiftBit, (high << (32 - shiftBit)) | (low >>> shiftBit));
        }

        return merge32BitsToBigInt(0, high >>> (shiftBit - 32));
    }
}