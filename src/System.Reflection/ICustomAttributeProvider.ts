import { Type } from "System";

export interface ICustomAttributeProvider {
    GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[];
    IsDefined(attributeType: Type, inherit: boolean): boolean;
}