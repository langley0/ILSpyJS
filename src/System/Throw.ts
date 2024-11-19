export class ArgumentOutOfRangeException extends Error {
    constructor(parameterName: string) {
        super(`ArgumentOutOfRange: ${parameterName}`);
    }
}

export class ArgumentNullException extends Error {
    constructor(parameterName: string) {
        super(`ArgumentNull: ${parameterName}`);
    }
}

export class Throw {
    static ImageTooSmall(): never {
        throw new Error("ImageTooSmall: Attempted to read beyond the end of the stream.");
    }

    static InvalidArgument(description: string, parameterName: string): never {
        throw new Error(`InvalidArgument: ${description}, ${parameterName}`);
    }

    static InvalidOperation_TableNotSorted(param: any): never {
        throw new Error(`InvalidOperation: Table is not sorted.${param}`);
    }

    static InvalidOperation_PEImageNotAvailable(): never {
        throw new Error("InvalidOperation: PE image is not available.");
    }

    static PEReaderDisposed(): never {
        throw new Error("PEReaderDisposed: The PE reader has been disposed.");
    }

    static OutOfBounds() : never {
        throw new Error("OutOfBounds: Attempted to read beyond the end of the stream.");
    }

    static EntityOrUserStringHandleRequired(): never {
        throw new Error("InvalidOperation: Entity or UserString handle expected.");
    }

    static ArgumentException(description: string, parameterName: string): never {
        throw new Error(`ArgumentException: ${description}, ${parameterName}`);
    }

    static ArgumentNull(parameterName: string): never {
        throw new ArgumentNullException(parameterName);
    }

    static ArgumentOutOfRange(parameterName: string): never {
        throw new ArgumentOutOfRangeException(parameterName);
    }

    static InvalidOperationBuilderAlreadyLinked(): never {
        throw new Error("InvalidOperation: Builder is already linked to another metadata.");
    }

    static InvalidOperationException(description: string, parameterName: string): never {
        throw new Error(`InvalidOperation: ${description}, ${parameterName}`);
    }

    static ThrowIfNull(value: any, name?: string) {
        if (value == null || value == undefined) {
            if (name) {
                throw new Error(`ArgumentNull: ${name}`);
            } else {
                throw new Error("ArgumentNull");
            }
        }
    }

    static ThrowIfNegative(value: number, name?: string) {
        if (value < 0) {
            if (name) {
                throw new Error(`ArgumentOutOfRange: ${name}`);
            } else {
                throw new Error("ArgumentOutOfRange");
            }
        }
    }

    static ThrowIfFalse(value: boolean, name?: string) {
        if (!value) {
            if (name) {
                throw new Error(`ArgumentOutOfRange: ${name}`);
            } else {
                throw new Error("ArgumentOutOfRange");
            }
        }
    }

    static ThrowEndOfFileException() {
        throw new Error("EndOfStream: Attempted to read beyond the end of the stream.");
    }

    static ThrowIfErrorNotMatched<T extends ErrorConstructor>(errorCtor: new () => T, action: () => void) {
        try {
            action();
        } catch (e) {
            if (e instanceof errorCtor) {
                // it's ok
                return;
            }
            throw e;
        }
    }

}