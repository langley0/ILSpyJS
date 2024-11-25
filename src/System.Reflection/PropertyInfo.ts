import { Type } from 'System';
import { MemberInfo } from './MemberInfo';
import { ParameterInfo } from './ParameterInfo';
import { MemberTypes } from './MemberTypes';

export abstract class PropertyInfo implements MemberInfo {
    protected constructor() { }

    // of MemberInfo 
    public abstract get Name(): string;
    public abstract get DeclaringType(): Type;
    public abstract get ReflectedType(): Type;
    public get MemberType(): MemberTypes { return MemberTypes.Property; }

    // of ICustomAttributeProvider 
    public abstract GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[];
    public abstract IsDefined(attributeType: Type, inherit: boolean): boolean;
    
    // of PropertyInfo members
    public abstract get PropertyType(): Type;
    public abstract GetIndexParameters(): ParameterInfo[];

    // public abstract PropertyAttributes Attributes { get; }
    // public bool IsSpecialName => (Attributes & PropertyAttributes.SpecialName) != 0;

    // public abstract bool CanRead { get; }
    // public abstract bool CanWrite { get; }

    // public MethodInfo[] GetAccessors() => GetAccessors(nonPublic: false);
    // public abstract MethodInfo[] GetAccessors(bool nonPublic);

    // public virtual MethodInfo? GetMethod => GetGetMethod(nonPublic: true);
    // public MethodInfo? GetGetMethod() => GetGetMethod(nonPublic: false);
    // public abstract MethodInfo? GetGetMethod(bool nonPublic);

    // public virtual MethodInfo? SetMethod => GetSetMethod(nonPublic: true);
    // public MethodInfo? GetSetMethod() => GetSetMethod(nonPublic: false);
    // public abstract MethodInfo? GetSetMethod(bool nonPublic);

    // public virtual Type GetModifiedPropertyType() => throw new NotSupportedException();
    // public virtual Type[] GetOptionalCustomModifiers() => Type.EmptyTypes;
    // public virtual Type[] GetRequiredCustomModifiers() => Type.EmptyTypes;

    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public object? GetValue(object? obj) => GetValue(obj, index: null);
    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public virtual object? GetValue(object? obj, object?[]? index) => GetValue(obj, BindingFlags.Default, binder: null, index: index, culture: null);
    // public abstract object? GetValue(object? obj, BindingFlags invokeAttr, Binder? binder, object?[]? index, CultureInfo? culture);

    // public virtual object? GetConstantValue() { throw NotImplemented.ByDesign; }
    // public virtual object? GetRawConstantValue() { throw NotImplemented.ByDesign; }

    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public void SetValue(object? obj, object? value) => SetValue(obj, value, index: null);
    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public virtual void SetValue(object? obj, object? value, object?[]? index) => SetValue(obj, value, BindingFlags.Default, binder: null, index: index, culture: null);
    // public abstract void SetValue(object? obj, object? value, BindingFlags invokeAttr, Binder? binder, object?[]? index, CultureInfo? culture);

    // public override bool Equals(object? obj) => base.Equals(obj);
    // public override int GetHashCode() => base.GetHashCode();

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public static bool operator ==(PropertyInfo? left, PropertyInfo? right)
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

    // public static bool operator !=(PropertyInfo? left, PropertyInfo? right) => !(left == right);
}