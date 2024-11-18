import assert from "assert";

function CountBits(v: number): number {
    // 나중에 bigint 용으로 바꾸어야 함
    // high 32 / low 32 이렇게 두번에 걸쳐서 처리해야한다
    const Mask01010101 = Number.parseInt("0x5555555555555555");
    const Mask00110011 = Number.parseInt("0x3333333333333333");
    const Mask00001111 = Number.parseInt("0x0F0F0F0F0F0F0F0F");
    const Mask00000001 = Number.parseInt("0x0101010101010101");
    v -= ((v >> 1) & Mask01010101);
    v = (v & Mask00110011) + ((v >> 2) & Mask00110011);
    return (((v + (v >> 4) & Mask00001111) * Mask00000001) >> 56);
}


export class BitArithmetic {
    public static CountBits(v: number): number {
        v -= ((v >> 1) & 0x55555555);
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
        return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
    }

    public static Align(position: number, alignment: number) {
        assert(position >= 0 && alignment > 0);
        assert(CountBits(alignment) == 1);

        const result = position & ~(alignment - 1);
        if (result == position) {
            return result;
        }

        return result + alignment;
    }
}