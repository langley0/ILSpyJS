import { TypeInfo } from './TypeInfo';

export interface IReflectableType {
    GetTypeInfo(): TypeInfo;
}