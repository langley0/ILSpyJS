import { RoStubAssembly } from "./RoStubAssembly";

export class RoExceptionAssembly extends RoStubAssembly {
    public constructor(exception: Error) {
        super();
        this.Exception = exception;
    }

    public readonly Exception: Error;
}