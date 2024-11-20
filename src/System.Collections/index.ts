export * from "./Internal/Hash";

export function SequenceEqual<T>(from: ArrayLike<T>, to: ArrayLike<T>): boolean {
    if (from.length !== to.length) {
        return false;
    }

    for (let i = 0; i < from.length; i++) {
        if (from[i] !== to[i]) {
            return false;
        }
    }

    return true;
}

export function IsDefault(array: ArrayLike<number>): boolean {
    if (array.length > 0) {
        // 모두 0 으로 되어 있는지 확인
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== 0) {
                return false;
            }
        }
    }
    return true;
}