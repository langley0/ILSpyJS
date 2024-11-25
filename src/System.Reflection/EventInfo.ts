import { Type } from "System";
import { MemberTypes } from "./MemberTypes";
import { MemberInfo } from "./MemberInfo";


export abstract class EventInfo implements MemberInfo {
    protected constructor() { }

    // of MemberInfo 
    public abstract get Name(): string;
    public abstract get DeclaringType(): Type;
    public abstract get ReflectedType(): Type;
    public get MemberType(): MemberTypes { return MemberTypes.Event; }

    // of ICustomAttributeProvider 
    public abstract GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[];
    public abstract IsDefined(attributeType: Type, inherit: boolean): boolean;




    // public abstract EventAttributes Attributes { get; }
    // public bool IsSpecialName => (Attributes & EventAttributes.SpecialName) != 0;

    // public MethodInfo[] GetOtherMethods() => GetOtherMethods(nonPublic: false);
    // public virtual MethodInfo[] GetOtherMethods(bool nonPublic) { throw NotImplemented.ByDesign; }

    // public virtual MethodInfo? AddMethod => GetAddMethod(nonPublic: true);
    // public virtual MethodInfo? RemoveMethod => GetRemoveMethod(nonPublic: true);
    // public virtual MethodInfo? RaiseMethod => GetRaiseMethod(nonPublic: true);

    // public MethodInfo? GetAddMethod() => GetAddMethod(nonPublic: false);
    // public MethodInfo? GetRemoveMethod() => GetRemoveMethod(nonPublic: false);
    // public MethodInfo? GetRaiseMethod() => GetRaiseMethod(nonPublic: false);

    // public abstract MethodInfo? GetAddMethod(bool nonPublic);
    // public abstract MethodInfo? GetRemoveMethod(bool nonPublic);
    // public abstract MethodInfo? GetRaiseMethod(bool nonPublic);

    // public virtual bool IsMulticast
    // {
    //     get
    //     {
    //         Type? cl = EventHandlerType;
    //         Type mc = typeof(MulticastDelegate);
    //         return mc.IsAssignableFrom(cl);
    //     }
    // }

    // public virtual Type? EventHandlerType
    // {
    //     get
    //     {
    //         MethodInfo m = GetAddMethod(true)!;
    //         ReadOnlySpan<ParameterInfo> p = m.GetParametersAsSpan();
    //         Type del = typeof(Delegate);
    //         for (int i = 0; i < p.Length; i++)
    //         {
    //             Type c = p[i].ParameterType;
    //             if (c.IsSubclassOf(del))
    //                 return c;
    //         }
    //         return null;
    //     }
    // }

    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public virtual void AddEventHandler(object? target, Delegate? handler)
    // {
    //     MethodInfo addMethod = GetAddMethod(nonPublic: false) ?? throw new InvalidOperationException(SR.InvalidOperation_NoPublicAddMethod);
    //     addMethod.Invoke(target, [handler]);
    // }

    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public virtual void RemoveEventHandler(object? target, Delegate? handler)
    // {
    //     MethodInfo removeMethod = GetRemoveMethod(nonPublic: false) ?? throw new InvalidOperationException(SR.InvalidOperation_NoPublicRemoveMethod);
    //     removeMethod.Invoke(target, [handler]);
    // }

    // public override bool Equals(object? obj) => base.Equals(obj);
    // public override int GetHashCode() => base.GetHashCode();

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public static bool operator ==(EventInfo? left, EventInfo? right)
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

    // public static bool operator !=(EventInfo? left, EventInfo? right) => !(left == right);
}