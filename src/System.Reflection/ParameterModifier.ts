import { Throw } from "System/Throw";

export class ParameterModifier {
    private readonly _byRef: boolean[];

    public constructor(parameterCount: number) {
        if (parameterCount <= 0)
            Throw.ArgumentException("Arg_ParmArraySize");

        this._byRef = new Array(parameterCount);
    }

    public Get(index: number): boolean {
        return this._byRef[index];
    }

    public Set(index: number, value: boolean) {
        this._byRef[index] = value;

    }
}