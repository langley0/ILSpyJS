import assert from "assert";

export class MethodSig<T> {
    public Return: T | undefined = undefined;
    public Parameters: T[];

    public constructor(parameterCount: number) {
        assert(parameterCount >= 0);
        this.Parameters = new Array<T>(parameterCount);
    }

    public Get(position: number): T | undefined {

        assert(position >= -1 && position < this.Parameters.length);
        return position == -1 ? this.Return : this.Parameters[position];
    }

    public Set(position: number, value: T): void {
        assert(position >= -1 && position < this.Parameters.length);
        if (position == -1) {
            this.Return = value;
        }
        else {
            this.Parameters[position] = value;
        }
    }

}