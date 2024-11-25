// import { Type } from 'System';
import { ICustomAttributeProvider } from './ICustomAttributeProvider';
import { MemberTypes } from './MemberTypes';
// import { Module } from './Module';
// import { CustomAttributeData } from './CustomAttributeData';

export interface MemberInfo extends ICustomAttributeProvider {
    get Name(): string;
    get MemberType(): MemberTypes;


    //     public abstract MemberTypes MemberType { get; }
    //     public abstract string Name { get; }
    //     public abstract Type? DeclaringType { get; }
    //     public abstract Type? ReflectedType { get; }

    //     public virtual Module Module
    //     {
    //         get
    //         {
    //             // This check is necessary because for some reason, Type adds a new "Module" property that hides the inherited one instead
    //             // of overriding.

    //             if (this is Type type)
    //                 return type.Module;

    //             throw NotImplemented.ByDesign;
    //         }
    //     }

    //     public virtual bool HasSameMetadataDefinitionAs(MemberInfo other) { throw NotImplemented.ByDesign; }

    //     public abstract bool IsDefined(Type attributeType, bool inherit);
    //     public abstract object[] GetCustomAttributes(bool inherit);
        // public abstract GetCustomAttributes( attributeType: Type,  inherit?: boolean): object[];

    //     public virtual IEnumerable<CustomAttributeData> CustomAttributes => GetCustomAttributesData();
    //     public virtual IList<CustomAttributeData> GetCustomAttributesData() { throw NotImplemented.ByDesign; }
    //     public virtual bool IsCollectible => true;
    //     public virtual int MetadataToken => throw new InvalidOperationException();

    //     public override bool Equals(object? obj) => base.Equals(obj);
    //     public override int GetHashCode() => base.GetHashCode();

    //     [MethodImpl(MethodImplOptions.AggressiveInlining)]
    //     public static bool operator ==(MemberInfo? left, MemberInfo? right)
    //     {
    //         // Test "right" first to allow branch elimination when inlined for null checks (== null)
    //         // so it can become a simple test
    //         if (right is null)
    //         {
    //             return left is null;
    //         }

    //         // Try fast reference equality and opposite null check prior to calling the slower virtual Equals
    //         if (ReferenceEquals(left, right))
    //         {
    //             return true;
    //         }

    //         return (left is null) ? false : left.Equals(right);
    //     }

    //     public static bool operator !=(MemberInfo? left, MemberInfo? right) => !(left == right);
    // }
}