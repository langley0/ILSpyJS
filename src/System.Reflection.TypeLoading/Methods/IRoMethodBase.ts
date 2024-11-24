import { MetadataLoadContext, MethodBase } from "System.Reflection";
import { TypeContext } from "System.Reflection.TypeLoading";

export interface IRoMethodBase {
    get MethodBase(): MethodBase;
    get Loader(): MetadataLoadContext;
    get TypeContext(): TypeContext;
    GetMethodSigString(position: number): string;
}