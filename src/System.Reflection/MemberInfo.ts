import { Type } from 'System';
import { ICustomAttributeProvider } from './ICustomAttributeProvider';

export abstract class MemberInfo implements ICustomAttributeProvider {
    // protected MemberInfo() { }

    // public abstract MemberTypes MemberType { get; }
    // public abstract string Name { get; }
    // public abstract Type? DeclaringType { get; }
    // public abstract Type? ReflectedType { get; }

    // public virtual Module Module
    // {
    //     get
    //     {
    //         // This check is necessary because for some reason, Type adds a new "Module" property that hides the inherited one instead
    //         // of overriding.

    //         if (this is Type type)
    //             return type.Module;

    //         throw NotImplemented.ByDesign;
    //     }
    // }

    // public virtual boolean HasSameMetadataDefinitionAs(MemberInfo other) { throw NotImplemented.ByDesign; }

    public abstract IsDefined(attributeType: Type, inherit: boolean): boolean;
    public abstract GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[];

    // public virtual IEnumerable<CustomAttributeData> CustomAttributes => GetCustomAttributesData();
    // public virtual IList<CustomAttributeData> GetCustomAttributesData() { throw NotImplemented.ByDesign; }
    // public virtual boolean IsCollectible => true;
    // public virtual int MetadataToken => throw new InvalidOperationException();

    // public override boolean Equals(object? obj) => base.Equals(obj);
    // public override int GetHashCode() => base.GetHashCode();

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