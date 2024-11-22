import { Module } from './Module';
import { Assembly } from "./Assembly";

export class ResolveEventArgs {
    public constructor(name: string , requestingAssembly?: Assembly)
    {
        this.Name = name;
        this.RequestingAssembly = requestingAssembly;
    }

    public readonly Name: string;
    public readonly RequestingAssembly: Assembly | undefined;
}
export type ModuleResolveEventHandler  = ( sender: object,  e: ResolveEventArgs) => Module;

