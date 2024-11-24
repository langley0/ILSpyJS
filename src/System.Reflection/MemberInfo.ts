// import { Type } from 'System';
// import { ICustomAttributeProvider } from './ICustomAttributeProvider';
import { MemberTypes } from './MemberTypes';
// import { Module } from './Module';
// import { CustomAttributeData } from './CustomAttributeData';

export interface MemberInfo {
    get Name(): string;
    get MemberType(): MemberTypes;

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public static boolean operator ==(MemberInfo? left, MemberInfo? right)
    // {
    //     // Test "right" first to allow branch elimination when inlined for undefined checks (== undefined)
    //     // so it can become a simple test
    //     if (right is undefined)
    //     {
    //         return left is undefined;
    //     }

    //     // Try fast reference equality and opposite undefined check prior to calling the slower virtual Equals
    //     if (ReferenceEquals(left, right))
    //     {
    //         return true;
    //     }

    //     return (left is undefined) ? false : left.Equals(right);
    // }

    // public static boolean operator !=(MemberInfo? left, MemberInfo? right) => !(left == right);
}