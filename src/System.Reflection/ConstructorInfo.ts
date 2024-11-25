import { MemberTypes } from "./MemberTypes";
import { MethodBase } from "./MethodBase";

export abstract class ConstructorInfo extends MethodBase {
    protected constructor() {
        super();
    }

    public override get MemberType(): MemberTypes {
        return MemberTypes.Constructor;
    }


    // public object Invoke(object?[]? parameters) => Invoke(BindingFlags.Default, binder: null, parameters: parameters, culture: null);
    // public abstract object Invoke(BindingFlags invokeAttr, Binder? binder, object?[]? parameters, CultureInfo? culture);

    // public override bool Equals(object? obj) => base.Equals(obj);
    // public override int GetHashCode() => base.GetHashCode();

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public static bool operator ==(ConstructorInfo? left, ConstructorInfo? right)
    // {
    //     // Test "right" first to allow branch elimination when inlined for null checks (== null)
    //     // so it can become a simple test
    //     if (right is null)
    //     {
    //         return left is null;
    //     }

    //     // Try fast reference equality and opposite null check prior to calling the slower virtual Equals
    //     if (ReferenceEquals(left, right))
    //     {
    //         return true;
    //     }

    //     return (left is null) ? false : left.Equals(right);
    // }

    // public static bool operator !=(ConstructorInfo? left, ConstructorInfo? right) => !(left == right);

    public static readonly ConstructorName = ".ctor";
    public static readonly TypeConstructorName = ".cctor";
}