import { Type } from "System";
import { MemberTypes } from "./MemberTypes";
import { MemberInfo } from "./MemberInfo";

export abstract class FieldInfo implements MemberInfo {
    protected constructor() { }

    // of MemberInfo 
    public abstract get Name(): string;
    public abstract get DeclaringType(): Type;
    public abstract get ReflectedType(): Type;
    public get MemberType(): MemberTypes { return MemberTypes.Field; }

    // of ICustomAttributeProvider 
    public abstract GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[];
    public abstract IsDefined(attributeType: Type, inherit: boolean): boolean;


    // public abstract FieldAttributes Attributes { get; }
    // public abstract Type FieldType { get; }

    // public bool IsInitOnly => (Attributes & FieldAttributes.InitOnly) != 0;
    // public bool IsLiteral => (Attributes & FieldAttributes.Literal) != 0;
    // [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // public bool IsNotSerialized => (Attributes & FieldAttributes.NotSerialized) != 0;
    // public bool IsPinvokeImpl => (Attributes & FieldAttributes.PinvokeImpl) != 0;
    // public bool IsSpecialName => (Attributes & FieldAttributes.SpecialName) != 0;
    // public bool IsStatic => (Attributes & FieldAttributes.Static) != 0;

    // public bool IsAssembly => (Attributes & FieldAttributes.FieldAccessMask) == FieldAttributes.Assembly;
    // public bool IsFamily => (Attributes & FieldAttributes.FieldAccessMask) == FieldAttributes.Family;
    // public bool IsFamilyAndAssembly => (Attributes & FieldAttributes.FieldAccessMask) == FieldAttributes.FamANDAssem;
    // public bool IsFamilyOrAssembly => (Attributes & FieldAttributes.FieldAccessMask) == FieldAttributes.FamORAssem;
    // public bool IsPrivate => (Attributes & FieldAttributes.FieldAccessMask) == FieldAttributes.Private;
    // public bool IsPublic => (Attributes & FieldAttributes.FieldAccessMask) == FieldAttributes.Public;

    // public virtual bool IsSecurityCritical => true;
    // public virtual bool IsSecuritySafeCritical => false;
    // public virtual bool IsSecurityTransparent => false;

    // public abstract RuntimeFieldHandle FieldHandle { get; }

    // public override bool Equals(object? obj) => base.Equals(obj);
    // public override int GetHashCode() => base.GetHashCode();

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    // public static bool operator ==(FieldInfo? left, FieldInfo? right)
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

    // public static bool operator !=(FieldInfo? left, FieldInfo? right) => !(left == right);

    // public abstract object? GetValue(object? obj);

    // [DebuggerHidden]
    // [DebuggerStepThrough]
    // public void SetValue(object? obj, object? value) => SetValue(obj, value, BindingFlags.Default, Type.DefaultBinder, null);
    // public abstract void SetValue(object? obj, object? value, BindingFlags invokeAttr, Binder? binder, CultureInfo? culture);

    // [CLSCompliant(false)]
    // public virtual void SetValueDirect(TypedReference obj, object value) { throw new NotSupportedException(SR.NotSupported_AbstractNonCLS); }
    // [CLSCompliant(false)]
    // public virtual object? GetValueDirect(TypedReference obj) { throw new NotSupportedException(SR.NotSupported_AbstractNonCLS); }

    // public virtual object? GetRawConstantValue() { throw new NotSupportedException(SR.NotSupported_AbstractNonCLS); }

    // public virtual Type GetModifiedFieldType() => throw new NotSupportedException();

    // public virtual Type[] GetOptionalCustomModifiers() { throw NotImplemented.ByDesign; }
    // public virtual Type[] GetRequiredCustomModifiers() { throw NotImplemented.ByDesign; }
}