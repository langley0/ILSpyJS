import { StreamingContext } from "./StreamingContext";

export interface IObjectReference
{
     GetRealObject( context: StreamingContext) : object;
}