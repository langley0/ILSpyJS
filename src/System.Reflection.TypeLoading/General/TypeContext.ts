import { RoType } from "System.Reflection.TypeLoading/Types/RoType";

export class TypeContext {
    public constructor(genericTypeArguments: RoType[], genericMethodArguments?: RoType[]) {
        this.GenericTypeArguments = genericTypeArguments;
        this.GenericMethodArguments = genericMethodArguments;
    }

    public readonly GenericTypeArguments: RoType[];
    public readonly GenericMethodArguments: RoType[] | undefined;

    public GetGenericTypeArgumentOrNull(index: number): RoType | undefined {
        if (this.GenericTypeArguments == undefined || index >= this.GenericTypeArguments.length)
            return undefined;
        return this.GenericTypeArguments[index];
    }

    public GetGenericMethodArgumentOrNull(index: number): RoType | undefined {
        if (this.GenericMethodArguments == undefined || index >= this.GenericMethodArguments.length)
            return undefined;
        return this.GenericMethodArguments[index];
    }
}