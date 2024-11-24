// import {
//     IReflect,
//     MethodBase,
//     Assembly,
//     Module,
//     TypeAttributes,
//     GenericParameterAttributes,
// } from "System.Reflection";

import { Assembly } from "System.Reflection/Assembly";
import { Module } from "System.Reflection/Module";
import { IReflect } from "System.Reflection/IReflect";
import { TypeAttributes } from "System.Reflection/TypeAttributes";
import { GenericParameterAttributes } from "System.Reflection/GenericParameterAttributes";
import { MethodBase } from "System.Reflection/MethodBase";
import { MemberInfo } from "System.Reflection/MemberInfo";
import { MemberTypes } from "System.Reflection/MemberTypes";
import { CustomAttributeData } from "System.Reflection/CustomAttributeData";
import { ICustomAttributeProvider } from "System.Reflection/ICustomAttributeProvider";

export abstract class Type implements IReflect, ICustomAttributeProvider, MemberInfo {
    protected constructor() { }

    public get MemberType(): MemberTypes { return MemberTypes.TypeInfo }
    public GetType(): Type  { throw new Error("?????"); }

    public abstract get Namespace(): string | undefined;
    public abstract get AssemblyQualifiedName(): string | undefined;
    public abstract get FullName(): string | undefined;

    public abstract get Assembly(): Assembly | undefined;
    public abstract get Module(): Module;
    public get IsInterface(): boolean {


        return (this.GetAttributeFlagsImpl() & TypeAttributes.ClassSemanticsMask) == TypeAttributes.Interface;

    }

    public get IsNested(): boolean { return this.DeclaringType != undefined; }
    public get DeclaringType(): Type | undefined { return undefined; }
    public get DeclaringMethod(): MethodBase | undefined { return undefined; }

    public get ReflectedType(): Type | undefined { return undefined; }
    public abstract get UnderlyingSystemType(): Type;

    public get IsTypeDefinition(): boolean { throw new Error("NotImplemented.ByDesign"); }
    public get IsArray(): boolean { return this.IsArrayImpl(); }
    protected abstract IsArrayImpl(): boolean;
    public get IsByRef(): boolean { return this.IsByRefImpl(); }
    protected abstract IsByRefImpl(): boolean;
    public get IsPointer(): boolean { return this.IsPointerImpl(); }
    protected abstract IsPointerImpl(): boolean;
    public get IsConstructedGenericType(): boolean { throw new Error("NotImplemented.ByDesign"); }
    public get IsGenericParameter(): boolean { return false; }
    public get IsGenericTypeParameter(): boolean { return this.IsGenericParameter && this.DeclaringMethod == undefined; }
    public get IsGenericMethodParameter(): boolean { return this.IsGenericParameter && this.DeclaringMethod != undefined; }
    public get IsGenericType(): boolean { return false; }
    public get IsGenericTypeDefinition(): boolean { return false; }

    public get IsSZArray(): boolean { throw new Error("NotImplemented.ByDesign"); }
    public get IsVariableBoundArray(): boolean { return this.IsArray && !this.IsSZArray; }

    public get IsByRefLike(): boolean { throw new Error("NotSupported_SubclassOverride"); }

    public get IsFunctionPointer(): boolean { return false; }
    public get IsUnmanagedFunctionPointer(): boolean { return false; }

    public get HasElementType(): boolean { return this.HasElementTypeImpl(); }
    protected abstract HasElementTypeImpl(): boolean;
    public abstract GetElementType(): Type | undefined;

    public GetArrayRank(): number { throw new Error("NotSupported_SubclassOverride"); }

    // // [Intrinsic]
    public GetGenericTypeDefinition(): Type { throw new Error("NotSupported_SubclassOverride"); };
    public get GenericTypeArguments(): Type[] { return (this.IsGenericType && !this.IsGenericTypeDefinition) ? this.GetGenericArguments() : Type.EmptyTypes; }
    public GetGenericArguments(): Type[] { throw new Error("NotSupported_SubclassOverride"); };

    public GetOptionalCustomModifiers(): Type[] { return Type.EmptyTypes; }
    public GetRequiredCustomModifiers(): Type[] { return Type.EmptyTypes; }

    public get GenericParameterPosition(): number { throw new Error("Arg_NotGenericParameter"); }
    public get GenericParameterAttributes(): GenericParameterAttributes { throw new Error("NotSupportedException"); }
    public GetGenericParameterConstraints(): Type[] {
        if (!this.IsGenericParameter) {
            throw new Error("Arg_NotGenericParameter");
        }
        throw new Error("InvalidOperationException");
    }

    public get Attributes(): TypeAttributes { return this.GetAttributeFlagsImpl(); }
    protected abstract GetAttributeFlagsImpl(): TypeAttributes;

    //         public bool IsAbstract => (GetAttributeFlagsImpl() & TypeAttributes.Abstract) != 0;
    //         public bool IsImport => (GetAttributeFlagsImpl() & TypeAttributes.Import) != 0;
    //         public bool IsSealed => (GetAttributeFlagsImpl() & TypeAttributes.Sealed) != 0;
    //         public bool IsSpecialName => (GetAttributeFlagsImpl() & TypeAttributes.SpecialName) != 0;

    //         public bool IsClass => (GetAttributeFlagsImpl() & TypeAttributes.ClassSemanticsMask) == TypeAttributes.Class && !IsValueType;

    //         public bool IsNestedAssembly => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NestedAssembly;
    //         public bool IsNestedFamANDAssem => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NestedFamANDAssem;
    //         public bool IsNestedFamily => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NestedFamily;
    //         public bool IsNestedFamORAssem => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NestedFamORAssem;
    //         public bool IsNestedPrivate => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NestedPrivate;
    //         public bool IsNestedPublic => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NestedPublic;
    //         public bool IsNotPublic => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.NotPublic;
    //         public bool IsPublic => (GetAttributeFlagsImpl() & TypeAttributes.VisibilityMask) == TypeAttributes.Public;

    //         public bool IsAutoLayout => (GetAttributeFlagsImpl() & TypeAttributes.LayoutMask) == TypeAttributes.AutoLayout;
    //         public bool IsExplicitLayout => (GetAttributeFlagsImpl() & TypeAttributes.LayoutMask) == TypeAttributes.ExplicitLayout;
    //         public bool IsLayoutSequential => (GetAttributeFlagsImpl() & TypeAttributes.LayoutMask) == TypeAttributes.SequentialLayout;

    //         public bool IsAnsiClass => (GetAttributeFlagsImpl() & TypeAttributes.StringFormatMask) == TypeAttributes.AnsiClass;
    //         public bool IsAutoClass => (GetAttributeFlagsImpl() & TypeAttributes.StringFormatMask) == TypeAttributes.AutoClass;
    //         public bool IsUnicodeClass => (GetAttributeFlagsImpl() & TypeAttributes.StringFormatMask) == TypeAttributes.UnicodeClass;

    //         public bool IsCOMObject => IsCOMObjectImpl();
    //         protected abstract bool IsCOMObjectImpl();
    //         public bool IsContextful => IsContextfulImpl();
    //         protected virtual bool IsContextfulImpl() => false;

    //         public virtual bool IsEnum { [Intrinsic] get => IsSubclassOf(typeof(Enum)); }
    //         public bool IsMarshalByRef => IsMarshalByRefImpl();
    //         protected virtual bool IsMarshalByRefImpl() => false;
    //         public bool IsPrimitive
    //         {
    //             [Intrinsic]
    //             get => IsPrimitiveImpl();
    //         }
    //         protected abstract bool IsPrimitiveImpl();
    //         public bool IsValueType
    //         {
    //             [Intrinsic]
    //             get => IsValueTypeImpl();
    //         }
    //         protected virtual bool IsValueTypeImpl() => IsSubclassOf(typeof(ValueType));

    //         [Intrinsic]
    //         public bool IsAssignableTo([NotNullWhen(true)] Type? targetType) => targetType?.IsAssignableFrom(this) ?? false;

    //         public virtual bool IsSignatureType => false;

    //         public virtual bool IsSecurityCritical => throw NotImplemented.ByDesign;
    //         public virtual bool IsSecuritySafeCritical => throw NotImplemented.ByDesign;
    //         public virtual bool IsSecurityTransparent => throw NotImplemented.ByDesign;

    //         public virtual StructLayoutAttribute? StructLayoutAttribute { throw new Error("NotSupportedException"); }

    //         public ConstructorInfo? TypeInitializer
    //         {
    //             [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //             get => GetConstructorImpl(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic, undefined, CallingConventions.Any, EmptyTypes, undefined);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors)]
    //         public ConstructorInfo? GetConstructor(Type[] types) => GetConstructor(BindingFlags.Public | BindingFlags.Instance, undefined, types, undefined);

    //         /// <summary>
    //         /// Searches for a constructor whose parameters match the specified argument types, using the specified binding constraints.
    //         /// </summary>
    //         /// <param name="bindingAttr">
    //         /// A bitwise combination of the enumeration values that specify how the search is conducted.
    //         /// -or-
    //         /// Default to return undefined.
    //         /// </param>
    //         /// <param name="types">
    //         /// An array of Type objects representing the number, order, and type of the parameters for the constructor to get.
    //         /// -or-
    //         /// An empty array of the type <see cref="Type"/> (that is, Type[] types = Array.Empty{Type}()) to get a constructor that takes no parameters.
    //         /// -or-
    //         /// <see cref="EmptyTypes"/>.
    //         /// </param>
    //         /// <returns>
    //         /// A <see cref="ConstructorInfo"/> object representing the constructor that matches the specified requirements, if found; otherwise, undefined.
    //         /// </returns>
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //         public ConstructorInfo? GetConstructor(BindingFlags bindingAttr, Type[] types) => GetConstructor(bindingAttr, binder: undefined, types, modifiers: undefined);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //         public ConstructorInfo? GetConstructor(BindingFlags bindingAttr, Binder? binder, Type[] types, ParameterModifier[]? modifiers) => GetConstructor(bindingAttr, binder, CallingConventions.Any, types, modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //         public ConstructorInfo? GetConstructor(BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[] types, ParameterModifier[]? modifiers)
    //         {
    //             ArgumentNullException.ThrowIfNull(types);

    //             for (int i = 0; i < types.Length; i++)
    //             {
    //                 ArgumentNullException.ThrowIfNull(types[i], nameof(types));
    //             }
    //             return GetConstructorImpl(bindingAttr, binder, callConvention, types, modifiers);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //         protected abstract ConstructorInfo? GetConstructorImpl(BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[] types, ParameterModifier[]? modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors)]
    //         public ConstructorInfo[] GetConstructors() => GetConstructors(BindingFlags.Public | BindingFlags.Instance);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //         public abstract ConstructorInfo[] GetConstructors(BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicEvents)]
    //         public EventInfo? GetEvent(string name) => GetEvent(name, DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicEvents | DynamicallyAccessedMemberTypes.NonPublicEvents)]
    //         public abstract EventInfo? GetEvent(string name, BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicEvents)]
    //         public virtual EventInfo[] GetEvents() => GetEvents(DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicEvents | DynamicallyAccessedMemberTypes.NonPublicEvents)]
    //         public abstract EventInfo[] GetEvents(BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields)]
    //         public FieldInfo? GetField(string name) => GetField(name, DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields | DynamicallyAccessedMemberTypes.NonPublicFields)]
    //         public abstract FieldInfo? GetField(string name, BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields)]
    //         public FieldInfo[] GetFields() => GetFields(DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields | DynamicallyAccessedMemberTypes.NonPublicFields)]
    //         public abstract FieldInfo[] GetFields(BindingFlags bindingAttr);

    public GetFunctionPointerCallingConventions(): Type[] { throw new Error("NotSupportedException"); }
    public GetFunctionPointerReturnType(): Type { throw new Error("NotSupportedException"); }
    public GetFunctionPointerParameterTypes(): Type[] { throw new Error("NotSupportedException"); }

    //         [DynamicallyAccessedMembers(
    //             DynamicallyAccessedMemberTypes.PublicFields |
    //             DynamicallyAccessedMemberTypes.PublicMethods |
    //             DynamicallyAccessedMemberTypes.PublicEvents |
    //             DynamicallyAccessedMemberTypes.PublicProperties |
    //             DynamicallyAccessedMemberTypes.PublicConstructors |
    //             DynamicallyAccessedMemberTypes.PublicNestedTypes)]
    //         public MemberInfo[] GetMember(string name) => GetMember(name, DefaultLookup);

    //         [DynamicallyAccessedMembers(GetAllMembers)]
    //         public virtual MemberInfo[] GetMember(string name, BindingFlags bindingAttr) => GetMember(name, MemberTypes.All, bindingAttr);

    //         [DynamicallyAccessedMembers(GetAllMembers)]
    //         public virtual MemberInfo[] GetMember(string name, MemberTypes type, BindingFlags bindingAttr) { throw new Error("NotSupported_SubclassOverride"); };

    //         [DynamicallyAccessedMembers(
    //             DynamicallyAccessedMemberTypes.PublicFields |
    //             DynamicallyAccessedMemberTypes.PublicMethods |
    //             DynamicallyAccessedMemberTypes.PublicEvents |
    //             DynamicallyAccessedMemberTypes.PublicProperties |
    //             DynamicallyAccessedMemberTypes.PublicConstructors |
    //             DynamicallyAccessedMemberTypes.PublicNestedTypes)]
    //         public MemberInfo[] GetMembers() => GetMembers(DefaultLookup);

    //         /// <summary>
    //         /// Searches for the <see cref="MemberInfo"/> on the current <see cref="Type"/> that matches the specified <see cref="MemberInfo"/>.
    //         /// </summary>
    //         /// <param name="member">
    //         /// The <see cref="MemberInfo"/> to find on the current <see cref="Type"/>.
    //         /// </param>
    //         /// <returns>An object representing the member on the current <see cref="Type"/> that matches the specified member.</returns>
    //         /// <remarks>This method can be used to find a constructed generic member given a member from a generic type definition.</remarks>
    //         /// <exception cref="ArgumentNullException"><paramref name="member"/> is <see langword="undefined"/>.</exception>
    //         /// <exception cref="ArgumentException"><paramref name="member"/> does not match a member on the current <see cref="Type"/>.</exception>
    //         [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2085:UnrecognizedReflectionPattern",
    //             Justification = "This is finding the MemberInfo with the same MetadataToken as specified MemberInfo. If the specified MemberInfo " +
    //                             "exists and wasn't trimmed, then the current Type's MemberInfo couldn't have been trimmed.")]
    //         public virtual MemberInfo GetMemberWithSameMetadataDefinitionAs(MemberInfo member)
    //         {
    //             ArgumentNullException.ThrowIfNull(member);

    //             const BindingFlags all = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.Instance;
    //             foreach (MemberInfo myMemberInfo in GetMembers(all))
    //             {
    //                 if (myMemberInfo.HasSameMetadataDefinitionAs(member))
    //                 {
    //                     return myMemberInfo;
    //                 }
    //             }

    //             throw CreateGetMemberWithSameMetadataDefinitionAsNotFoundException(member);
    //         }

    //         private protected static ArgumentException CreateGetMemberWithSameMetadataDefinitionAsNotFoundException(MemberInfo member) =>
    //             new ArgumentException(SR.Format(SR.Arg_MemberInfoNotFound, member.Name), nameof(member));

    //         [DynamicallyAccessedMembers(GetAllMembers)]
    //         public abstract MemberInfo[] GetMembers(BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)]
    //         public MethodInfo? GetMethod(string name) => GetMethod(name, DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, BindingFlags bindingAttr)
    //         {
    //             ArgumentNullException.ThrowIfNull(name);

    //             return GetMethodImpl(name, bindingAttr, undefined, CallingConventions.Any, undefined, undefined);
    //         }

    //         /// <summary>
    //         /// Searches for the specified method whose parameters match the specified argument types, using the specified binding constraints.
    //         /// </summary>
    //         /// <param name="name">The string containing the name of the method to get.</param>
    //         /// <param name="bindingAttr">
    //         /// A bitwise combination of the enumeration values that specify how the search is conducted.
    //         /// -or-
    //         /// Default to return undefined.
    //         /// </param>
    //         /// <param name="types">
    //         /// An array of <see cref="Type"/> objects representing the number, order, and type of the parameters for the method to get.
    //         /// -or-
    //         /// An empty array of <see cref="Type"/> objects (as provided by the <see cref="EmptyTypes"/> field) to get a method that takes no parameters.
    //         /// </param>
    //         /// <returns>An object representing the method that matches the specified requirements, if found; otherwise, undefined.</returns>
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, BindingFlags bindingAttr, Type[] types) => GetMethod(name, bindingAttr, binder: undefined, types, modifiers: undefined);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)]
    //         public MethodInfo? GetMethod(string name, Type[] types) => GetMethod(name, types, undefined);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)]
    //         public MethodInfo? GetMethod(string name, Type[] types, ParameterModifier[]? modifiers) => GetMethod(name, DefaultLookup, undefined, types, modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, BindingFlags bindingAttr, Binder? binder, Type[] types, ParameterModifier[]? modifiers) => GetMethod(name, bindingAttr, binder, CallingConventions.Any, types, modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[] types, ParameterModifier[]? modifiers)
    //         {
    //             ArgumentNullException.ThrowIfNull(name);
    //             ArgumentNullException.ThrowIfNull(types);

    //             for (int i = 0; i < types.Length; i++)
    //             {
    //                 ArgumentNullException.ThrowIfNull(types[i], nameof(types));
    //             }
    //             return GetMethodImpl(name, bindingAttr, binder, callConvention, types, modifiers);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         protected abstract MethodInfo? GetMethodImpl(string name, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)]
    //         public MethodInfo? GetMethod(string name, int genericParameterCount, Type[] types) => GetMethod(name, genericParameterCount, types, undefined);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)]
    //         public MethodInfo? GetMethod(string name, int genericParameterCount, Type[] types, ParameterModifier[]? modifiers) => GetMethod(name, genericParameterCount, DefaultLookup, undefined, types, modifiers);

    //         /// <summary>
    //         /// Searches for the specified method whose parameters match the specified generic parameter count and argument types, using the specified binding constraints.
    //         /// </summary>
    //         /// <param name="name">The string containing the name of the method to get.</param>
    //         /// <param name="genericParameterCount">The number of generic type parameters of the method.</param>
    //         /// <param name="bindingAttr">
    //         /// A bitwise combination of the enumeration values that specify how the search is conducted.
    //         /// -or-
    //         /// Default to return undefined.
    //         /// </param>
    //         /// <param name="types">
    //         ///  An array of <see cref="Type"/> objects representing the number, order, and type of the parameters for the method to get.
    //         /// -or-
    //         /// An empty array of <see cref="Type"/> objects (as provided by the <see cref="EmptyTypes"/> field) to get a method that takes no parameters.
    //         /// </param>
    //         /// <returns>An object representing the method that matches the specified generic parameter count, argument types, and binding constraints, if found; otherwise, <see langword="undefined" />.</returns>
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, int genericParameterCount, BindingFlags bindingAttr, Type[] types) => GetMethod(name, genericParameterCount, bindingAttr, undefined, types, undefined);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, int genericParameterCount, BindingFlags bindingAttr, Binder? binder, Type[] types, ParameterModifier[]? modifiers) => GetMethod(name, genericParameterCount, bindingAttr, binder, CallingConventions.Any, types, modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public MethodInfo? GetMethod(string name, int genericParameterCount, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[] types, ParameterModifier[]? modifiers)
    //         {
    //             ArgumentNullException.ThrowIfNull(name);
    //             ArgumentOutOfRangeException.ThrowIfNegative(genericParameterCount);
    //             ArgumentNullException.ThrowIfNull(types);
    //             for (int i = 0; i < types.Length; i++)
    //             {
    //                 ArgumentNullException.ThrowIfNull(types[i], nameof(types));
    //             }
    //             return GetMethodImpl(name, genericParameterCount, bindingAttr, binder, callConvention, types, modifiers);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         protected virtual MethodInfo? GetMethodImpl(string name, int genericParameterCount, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers) { throw new Error("NotSupportedException"); }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)]
    //         public MethodInfo[] GetMethods() => GetMethods(DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         public abstract MethodInfo[] GetMethods(BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicNestedTypes)]
    //         public Type? GetNestedType(string name) => GetNestedType(name, DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicNestedTypes | DynamicallyAccessedMemberTypes.NonPublicNestedTypes)]
    //         public abstract Type? GetNestedType(string name, BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicNestedTypes)]
    //         public Type[] GetNestedTypes() => GetNestedTypes(DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicNestedTypes | DynamicallyAccessedMemberTypes.NonPublicNestedTypes)]
    //         public abstract Type[] GetNestedTypes(BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)]
    //         public PropertyInfo? GetProperty(string name) => GetProperty(name, DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties)]
    //         public PropertyInfo? GetProperty(string name, BindingFlags bindingAttr)
    //         {
    //             ArgumentNullException.ThrowIfNull(name);

    //             return GetPropertyImpl(name, bindingAttr, undefined, undefined, undefined, undefined);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)]
    //         [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2085:UnrecognizedReflectionPattern",
    //             Justification = "Linker doesn't recognize GetPropertyImpl(BindingFlags.Public) but this is what the body is doing")]
    //         public PropertyInfo? GetProperty(string name, Type? returnType)
    //         {
    //             ArgumentNullException.ThrowIfNull(name);

    //             return GetPropertyImpl(name, DefaultLookup, undefined, returnType, undefined, undefined);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)]
    //         public PropertyInfo? GetProperty(string name, Type[] types) => GetProperty(name, undefined, types);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)]
    //         public PropertyInfo? GetProperty(string name, Type? returnType, Type[] types) => GetProperty(name, returnType, types, undefined);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)]
    //         public PropertyInfo? GetProperty(string name, Type? returnType, Type[] types, ParameterModifier[]? modifiers) => GetProperty(name, DefaultLookup, undefined, returnType, types, modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties)]
    //         public PropertyInfo? GetProperty(string name, BindingFlags bindingAttr, Binder? binder, Type? returnType, Type[] types, ParameterModifier[]? modifiers)
    //         {
    //             ArgumentNullException.ThrowIfNull(name);
    //             ArgumentNullException.ThrowIfNull(types);

    //             return GetPropertyImpl(name, bindingAttr, binder, returnType, types, modifiers);
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties)]
    //         protected abstract PropertyInfo? GetPropertyImpl(string name, BindingFlags bindingAttr, Binder? binder, Type? returnType, Type[]? types, ParameterModifier[]? modifiers);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)]
    //         public PropertyInfo[] GetProperties() => GetProperties(DefaultLookup);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties)]
    //         public abstract PropertyInfo[] GetProperties(BindingFlags bindingAttr);

    //         [DynamicallyAccessedMembers(
    //             DynamicallyAccessedMemberTypes.PublicFields
    //             | DynamicallyAccessedMemberTypes.PublicMethods
    //             | DynamicallyAccessedMemberTypes.PublicEvents
    //             | DynamicallyAccessedMemberTypes.PublicProperties
    //             | DynamicallyAccessedMemberTypes.PublicConstructors
    //             | DynamicallyAccessedMemberTypes.PublicNestedTypes)]
    //         public virtual MemberInfo[] GetDefaultMembers() => throw NotImplemented.ByDesign;

    //         public virtual RuntimeTypeHandle TypeHandle
    //         {
    //             [Intrinsic]
    //             get { throw new Error("NotSupportedException"); }
    //         }

    //         public static RuntimeTypeHandle GetTypeHandle(object o)
    //         {
    //             ArgumentNullException.ThrowIfNull(o);

    //             return o.GetType().TypeHandle;
    //         }

    //         public static Type[] GetTypeArray(object[] args)
    //         {
    //             ArgumentNullException.ThrowIfNull(args);

    //             Type[] cls = new Type[args.Length];
    //             for (int i = 0; i < cls.Length; i++)
    //             {
    //                 if (args[i] == undefined)
    //                     throw new ArgumentException(SR.ArgumentNull_ArrayValue, nameof(args));
    //                 cls[i] = args[i].GetType();
    //             }
    //             return cls;
    //         }

    //         [MethodImpl(MethodImplOptions.AggressiveInlining)]
    //         public static TypeCode GetTypeCode(Type? type)
    //         {
    //             if (RuntimeHelpers.IsKnownConstant(type) && type is RuntimeType)
    //             {
    //                 return GetRuntimeTypeCode((RuntimeType)type);
    //             }
    //             return type?.GetTypeCodeImpl() ?? TypeCode.Empty;
    //         }

    //         [MethodImpl(MethodImplOptions.AggressiveInlining)]
    //         public static TypeCode GetRuntimeTypeCode(RuntimeType type)
    //         {
    //             RuntimeType underlyingType = type;
    //             if (type.IsActualEnum)
    //                 underlyingType = (RuntimeType)type.GetEnumUnderlyingType();

    //             if (underlyingType == typeof(sbyte))
    //                 return TypeCode.SByte;
    //             else if (underlyingType == typeof(byte))
    //                 return TypeCode.Byte;
    //             else if (underlyingType == typeof(short))
    //                 return TypeCode.Int16;
    //             else if (underlyingType == typeof(ushort))
    //                 return TypeCode.UInt16;
    //             else if (underlyingType == typeof(int))
    //                 return TypeCode.Int32;
    //             else if (underlyingType == typeof(uint))
    //                 return TypeCode.UInt32;
    //             else if (underlyingType == typeof(long))
    //                 return TypeCode.Int64;
    //             else if (underlyingType == typeof(ulong))
    //                 return TypeCode.UInt64;
    //             else if (underlyingType == typeof(bool))
    //                 return TypeCode.Boolean;
    //             else if (underlyingType == typeof(char))
    //                 return TypeCode.Char;
    //             else if (underlyingType == typeof(float))
    //                 return TypeCode.Single;
    //             else if (underlyingType == typeof(double))
    //                 return TypeCode.Double;
    //             else if (underlyingType == typeof(decimal))
    //                 return TypeCode.Decimal;
    //             else if (underlyingType == typeof(DateTime))
    //                 return TypeCode.DateTime;
    //             else if (underlyingType == typeof(string))
    //                 return TypeCode.String;
    //             else if (underlyingType == typeof(DBNull))
    //                 return TypeCode.DBNull;
    //             else
    //                 return TypeCode.Object;
    //         }

    //         protected virtual TypeCode GetTypeCodeImpl()
    //         {
    //             Type systemType = UnderlyingSystemType;
    //             if (!ReferenceEquals(this, systemType) && systemType is not undefined)
    //                 return GetTypeCode(systemType);

    //             return TypeCode.Object;
    //         }

    //         public abstract Guid GUID { get; }

    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromCLSID(Guid clsid) => GetTypeFromCLSID(clsid, undefined, throwOnError: false);
    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromCLSID(Guid clsid, bool throwOnError) => GetTypeFromCLSID(clsid, undefined, throwOnError: throwOnError);
    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromCLSID(Guid clsid, string? server) => GetTypeFromCLSID(clsid, server, throwOnError: false);
    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromCLSID(Guid clsid, string? server, bool throwOnError) => Marshal.GetTypeFromCLSID(clsid, server, throwOnError);

    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromProgID(string progID) => GetTypeFromProgID(progID, undefined, throwOnError: false);
    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromProgID(string progID, bool throwOnError) => GetTypeFromProgID(progID, undefined, throwOnError: throwOnError);
    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromProgID(string progID, string? server) => GetTypeFromProgID(progID, server, throwOnError: false);
    //         [SupportedOSPlatform("windows")]
    //         public static Type? GetTypeFromProgID(string progID, string? server, bool throwOnError) => Marshal.GetTypeFromProgID(progID, server, throwOnError);

    public abstract get BaseType(): Type | undefined;

    //         [DebuggerHidden]
    //         [DebuggerStepThrough]
    //         [DynamicallyAccessedMembers(InvokeMemberMembers)]
    //         public object? InvokeMember(string name, BindingFlags invokeAttr, Binder? binder, object? target, object?[]? args) => InvokeMember(name, invokeAttr, binder, target, args, undefined, undefined, undefined);

    //         [DebuggerHidden]
    //         [DebuggerStepThrough]
    //         [DynamicallyAccessedMembers(InvokeMemberMembers)]
    //         public object? InvokeMember(string name, BindingFlags invokeAttr, Binder? binder, object? target, object?[]? args, CultureInfo? culture) => InvokeMember(name, invokeAttr, binder, target, args, undefined, culture, undefined);

    //         [DynamicallyAccessedMembers(InvokeMemberMembers)]
    //         public abstract object? InvokeMember(string name, BindingFlags invokeAttr, Binder? binder, object? target, object?[]? args, ParameterModifier[]? modifiers, CultureInfo? culture, string[]? namedParameters);

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         [return: DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         public Type? GetInterface(string name) => GetInterface(name, ignoreCase: false);
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         [return: DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         public abstract Type? GetInterface(string name, bool ignoreCase);
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         public abstract Type[] GetInterfaces();

    //         public virtual InterfaceMapping GetInterfaceMap([DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)] Type interfaceType) { throw new Error("NotSupported_SubclassOverride"); };

    //         public virtual bool IsInstanceOfType([NotNullWhen(true)] object? o) => o == undefined ? false : IsAssignableFrom(o.GetType());
    //         public virtual bool IsEquivalentTo([NotNullWhen(true)] Type? other) => this == other;

    //         [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2085:UnrecognizedReflectionPattern",
    //             Justification = "The single instance field on enum types is never trimmed")]
    //         [Intrinsic]
    //         public virtual Type GetEnumUnderlyingType()
    //         {
    //             if (!IsEnum)
    //                 throw new ArgumentException(SR.Arg_MustBeEnum, "enumType");

    //             FieldInfo[] fields = GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
    //             if (fields == undefined || fields.Length != 1)
    //                 throw new ArgumentException(SR.Argument_InvalidEnum, "enumType");

    //             return fields[0].FieldType;
    //         }

    //         [RequiresDynamicCode("It might not be possible to create an array of the enum type at runtime. Use Enum.GetValues<T> or the GetEnumValuesAsUnderlyingType method instead.")]
    //         public virtual Array GetEnumValues()
    //         {
    //             if (!IsEnum)
    //                 throw new ArgumentException(SR.Arg_MustBeEnum, "enumType");

    //             // We don't support GetEnumValues in the default implementation because we cannot create an array of
    //             // a non-runtime type. If there is strong need we can consider returning an object or int64 array.
    //             throw NotImplemented.ByDesign;
    //         }

    //         /// <summary>
    //         /// Retrieves an array of the values of the underlying type constants of this enumeration type.
    //         /// </summary>
    //         /// <remarks>
    //         /// You can use this method to get enumeration values when it's hard to create an array of the enumeration type.
    //         /// For example, you might use this method for the <see cref="T:System.Reflection.MetadataLoadContext" /> enumeration or on a platform where run-time code generation is not available.
    //         /// </remarks>
    //         /// <returns>An array that contains the values of the underlying type constants in this enumeration type.</returns>
    //         /// <exception cref="T:System.ArgumentException">This type is not an enumeration type.</exception>
    //         public virtual Array GetEnumValuesAsUnderlyingType() { throw new Error("NotSupported_SubclassOverride"); };

    //         [RequiresDynamicCode("The code for an array of the specified type might not be available.")]
    //         public virtual Type MakeArrayType() { throw new Error("NotSupportedException"); }
    //         [RequiresDynamicCode("The code for an array of the specified type might not be available.")]
    //         public virtual Type MakeArrayType(int rank) { throw new Error("NotSupportedException"); }
    //         public virtual Type MakeByRefType() { throw new Error("NotSupportedException"); }

    //         [RequiresDynamicCode("The native code for this instantiation might not be available at runtime.")]
    //         [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
    //         public virtual Type MakeGenericType(params Type[] typeArguments) { throw new Error("NotSupported_SubclassOverride"); };

    //         public virtual Type MakePointerType() { throw new Error("NotSupportedException"); }

    //         public static Type MakeGenericSignatureType(Type genericTypeDefinition, params Type[] typeArguments) => new SignatureConstructedGenericType(genericTypeDefinition, typeArguments);

    //         public static Type MakeGenericMethodParameter(int position)
    //         {
    //             ArgumentOutOfRangeException.ThrowIfNegative(position);
    //             return new SignatureGenericMethodParameterType(position);
    //         }

    //         // This is used by the ToString() overrides of all reflection types. The legacy behavior has the following problems:
    //         //  1. Use only Name for nested types, which can be confused with global types and generic parameters of the same name.
    //         //  2. Use only Name for generic parameters, which can be confused with nested types and global types of the same name.
    //         //  3. Use only Name for all primitive types, void and TypedReference
    //         //  4. MethodBase.ToString() use "ByRef" for byref parameters which is different than Type.ToString().
    //         //  5. ConstructorInfo.ToString() outputs "Void" as the return type. Why Void?
    //         public string FormatTypeName()
    //         {
    //             Type elementType = GetRootElementType();

    //             if (elementType.IsPrimitive ||
    //                 elementType.IsNested ||
    //                 elementType == typeof(void) ||
    //                 elementType == typeof(TypedReference))
    //                 return Name;

    //             return ToString();
    //         }

    //         public override string ToString() => "Type: " + Name;  // Why do we add the "Type: " prefix?

    //         public override bool Equals(object? o) => o == undefined ? false : Equals(o as Type);
    public GetHashCode(): number {
        const systemType = this.UnderlyingSystemType;
        if (systemType !== this) {
            return systemType.GetHashCode();
        }
        return 0;
    }
    //         public virtual bool Equals(Type? o) => o == undefined ? false : ReferenceEquals(this.UnderlyingSystemType, o.UnderlyingSystemType);

    //         [Intrinsic]
    //         public static bool operator ==(Type? left, Type? right)
    //         {
    //             if (ReferenceEquals(left, right))
    //                 return true;

    //             // Runtime types are never equal to non-runtime types
    //             // If `left` is a non-runtime type with a weird Equals implementation
    //             // this is where operator `==` would differ from `Equals` call.
    //             if (left is undefined || right is undefined || left is RuntimeType || right is RuntimeType)
    //                 return false;

    //             return left.Equals(right);
    //         }

    //         [Intrinsic]
    //         public static bool operator !=(Type? left, Type? right)
    //         {
    //             return !(left == right);
    //         }

    //         [Obsolete(Obsoletions.ReflectionOnlyLoadingMessage, DiagnosticId = Obsoletions.ReflectionOnlyLoadingDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         public static Type? ReflectionOnlyGetType(string typeName, bool throwIfNotFound, bool ignoreCase) => throw new PlatformNotSupportedException(SR.PlatformNotSupported_ReflectionOnly);

    //         public static Binder DefaultBinder =>
    //             s_defaultBinder ??
    //             Interlocked.CompareExchange(ref s_defaultBinder, new DefaultBinder(), undefined) ??
    //             s_defaultBinder;

    //         private static Binder? s_defaultBinder;

    public static readonly Delimiter = '.';
    public static readonly EmptyTypes = new Array<Type>();
    // public static readonly object Missing = Reflection.Missing.Value;

    //         public static readonly MemberFilter FilterAttribute = FilterAttributeImpl!;
    //         public static readonly MemberFilter FilterName = (m, c) => FilterNameImpl(m, c!, StringComparison.Ordinal);
    //         public static readonly MemberFilter FilterNameIgnoreCase = (m, c) => FilterNameImpl(m, c!, StringComparison.OrdinalIgnoreCase);

    //         private const BindingFlags DefaultLookup = BindingFlags.Instance | BindingFlags.Static | BindingFlags.Public;
    //         // DynamicallyAccessedMemberTypes.All keeps more data than what a member can use:
    //         // - Keeps info about interfaces
    //         // - Complete Nested types (nested type body and all its members including other nested types)
    //         // - Public and private base type information
    //         // Instead, the GetAllMembers constant will keep:
    //         // - The nested types body but not the members
    //         // - Base type public information but not private information. This information should not
    //         // be visible via the derived type and is ignored by reflection
    //         public const DynamicallyAccessedMemberTypes GetAllMembers = DynamicallyAccessedMemberTypes.PublicFields | DynamicallyAccessedMemberTypes.NonPublicFields |
    //             DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods |
    //             DynamicallyAccessedMemberTypes.PublicEvents | DynamicallyAccessedMemberTypes.NonPublicEvents |
    //             DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties |
    //             DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors |
    //             DynamicallyAccessedMemberTypes.PublicNestedTypes | DynamicallyAccessedMemberTypes.NonPublicNestedTypes;

    //         public const DynamicallyAccessedMemberTypes InvokeMemberMembers = DynamicallyAccessedMemberTypes.PublicFields | DynamicallyAccessedMemberTypes.NonPublicFields |
    //             DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods |
    //             DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties |
    //             DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors;
    //     }

    //=========================================================================================================
    // From Helpers
    //     [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         public virtual bool IsSerializable
    //         {
    //             get
    //             {
    //                 if ((GetAttributeFlagsImpl() & TypeAttributes.Serializable) != 0)
    //                     return true;

    //                 Type? underlyingType = UnderlyingSystemType;
    //                 if (underlyingType is RuntimeType)
    //                 {
    //                     do
    //                     {
    //                         // In all sane cases we only need to compare the direct level base type with
    //                         // System.Enum and System.MulticastDelegate. However, a generic parameter can
    //                         // have a base type constraint that is Delegate or even a real delegate type.
    //                         // Let's maintain compatibility and return true for them.
    //                         if (underlyingType == typeof(Delegate) || underlyingType == typeof(Enum))
    //                             return true;

    //                         underlyingType = underlyingType.BaseType;
    //                     }
    //                     while (underlyingType != undefined);
    //                 }

    //                 return false;
    //             }
    //         }

    public get ContainsGenericParameters(): boolean {
        if (this.HasElementType)
            return this.GetRootElementType().ContainsGenericParameters;

        if (this.IsGenericParameter)
            return true;

        if (!this.IsGenericType)
            return false;

        const genericArguments = this.GetGenericArguments();
        for (let i = 0; i < genericArguments.length; i++) {
            if (genericArguments[i].ContainsGenericParameters)
                return true;
        }

        return false;

    }

    public GetRootElementType(): Type {
        let rootElementType: Type = this;

        while (rootElementType.HasElementType)
            rootElementType = rootElementType.GetElementType()!;

        return rootElementType;
    }

    //         public bool IsVisible
    //         {
    //             get
    //             {
    // #if CORECLR
    //                 if (this is RuntimeType rt)
    //                     return RuntimeTypeHandle.IsVisible(rt);
    // #endif //CORECLR

    //                 if (IsGenericParameter)
    //                     return true;

    //                 if (HasElementType)
    //                     return GetElementType()!.IsVisible;

    //                 Type type = this;
    //                 while (type.IsNested)
    //                 {
    //                     if (!type.IsNestedPublic)
    //                         return false;

    //                     // this should be undefined for non-nested types.
    //                     type = type.DeclaringType!;
    //                 }

    //                 // Now "type" should be a top level type
    //                 if (!type.IsPublic)
    //                     return false;

    //                 if (IsGenericType && !IsGenericTypeDefinition)
    //                 {
    //                     foreach (Type t in GetGenericArguments())
    //                     {
    //                         if (!t.IsVisible)
    //                             return false;
    //                     }
    //                 }

    //                 return true;
    //             }
    //         }

    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         public virtual Type[] FindInterfaces(TypeFilter filter, object? filterCriteria)
    //         {
    //             ArgumentNullException.ThrowIfNull(filter);

    //             Type?[] c = GetInterfaces();
    //             int cnt = 0;
    //             for (int i = 0; i < c.Length; i++)
    //             {
    //                 if (!filter(c[i]!, filterCriteria))
    //                     c[i] = undefined;
    //                 else
    //                     cnt++;
    //             }
    //             if (cnt == c.Length)
    //                 return c!;

    //             Type[] ret = new Type[cnt];
    //             cnt = 0;
    //             for (int i = 0; i < c.Length; i++)
    //             {
    //                 if (c[i] is Type t)
    //                     ret[cnt++] = t!;
    //             }
    //             return ret;
    //         }

    //         [DynamicallyAccessedMembers(GetAllMembers)]
    //         public virtual MemberInfo[] FindMembers(MemberTypes memberType, BindingFlags bindingAttr, MemberFilter? filter, object? filterCriteria)
    //         {
    //             // Define the work arrays
    //             MethodInfo?[]? m = undefined;
    //             ConstructorInfo?[]? c = undefined;
    //             FieldInfo?[]? f = undefined;
    //             PropertyInfo?[]? p = undefined;
    //             EventInfo?[]? e = undefined;
    //             Type?[]? t = undefined;

    //             int i;
    //             int cnt = 0;            // Total Matchs

    //             // Check the methods
    //             if ((memberType & MemberTypes.Method) != 0)
    //             {
    //                 m = GetMethods(bindingAttr);
    //                 if (filter != undefined)
    //                 {
    //                     for (i = 0; i < m.Length; i++)
    //                         if (!filter(m[i]!, filterCriteria))
    //                             m[i] = undefined;
    //                         else
    //                             cnt++;
    //                 }
    //                 else
    //                 {
    //                     cnt += m.Length;
    //                 }
    //             }

    //             // Check the constructors
    //             if ((memberType & MemberTypes.Constructor) != 0)
    //             {
    //                 c = GetConstructors(bindingAttr);
    //                 if (filter != undefined)
    //                 {
    //                     for (i = 0; i < c.Length; i++)
    //                         if (!filter(c[i]!, filterCriteria))
    //                             c[i] = undefined;
    //                         else
    //                             cnt++;
    //                 }
    //                 else
    //                 {
    //                     cnt += c.Length;
    //                 }
    //             }

    //             // Check the fields
    //             if ((memberType & MemberTypes.Field) != 0)
    //             {
    //                 f = GetFields(bindingAttr);
    //                 if (filter != undefined)
    //                 {
    //                     for (i = 0; i < f.Length; i++)
    //                         if (!filter(f[i]!, filterCriteria))
    //                             f[i] = undefined;
    //                         else
    //                             cnt++;
    //                 }
    //                 else
    //                 {
    //                     cnt += f.Length;
    //                 }
    //             }

    //             // Check the Properties
    //             if ((memberType & MemberTypes.Property) != 0)
    //             {
    //                 p = GetProperties(bindingAttr);
    //                 if (filter != undefined)
    //                 {
    //                     for (i = 0; i < p.Length; i++)
    //                         if (!filter(p[i]!, filterCriteria))
    //                             p[i] = undefined;
    //                         else
    //                             cnt++;
    //                 }
    //                 else
    //                 {
    //                     cnt += p.Length;
    //                 }
    //             }

    //             // Check the Events
    //             if ((memberType & MemberTypes.Event) != 0)
    //             {
    //                 e = GetEvents(bindingAttr);
    //                 if (filter != undefined)
    //                 {
    //                     for (i = 0; i < e.Length; i++)
    //                         if (!filter(e[i]!, filterCriteria))
    //                             e[i] = undefined;
    //                         else
    //                             cnt++;
    //                 }
    //                 else
    //                 {
    //                     cnt += e.Length;
    //                 }
    //             }

    //             // Check the Types
    //             if ((memberType & MemberTypes.NestedType) != 0)
    //             {
    //                 t = GetNestedTypes(bindingAttr);
    //                 if (filter != undefined)
    //                 {
    //                     for (i = 0; i < t.Length; i++)
    //                         if (!filter(t[i]!, filterCriteria))
    //                             t[i] = undefined;
    //                         else
    //                             cnt++;
    //                 }
    //                 else
    //                 {
    //                     cnt += t.Length;
    //                 }
    //             }

    //             // Allocate the Member Info
    //             MemberInfo[] ret = new MemberInfo[cnt];

    //             // Copy the Methods
    //             cnt = 0;
    //             if (m != undefined)
    //             {
    //                 for (i = 0; i < m.Length; i++)
    //                     if (m[i] != undefined)
    //                         ret[cnt++] = m[i]!;
    //             }

    //             // Copy the Constructors
    //             if (c != undefined)
    //             {
    //                 for (i = 0; i < c.Length; i++)
    //                     if (c[i] is ConstructorInfo ci)
    //                         ret[cnt++] = ci;
    //             }

    //             // Copy the Fields
    //             if (f != undefined)
    //             {
    //                 for (i = 0; i < f.Length; i++)
    //                     if (f[i] is FieldInfo fi)
    //                         ret[cnt++] = fi;
    //             }

    //             // Copy the Properties
    //             if (p != undefined)
    //             {
    //                 for (i = 0; i < p.Length; i++)
    //                     if (p[i] is PropertyInfo pi)
    //                         ret[cnt++] = pi;
    //             }

    //             // Copy the Events
    //             if (e != undefined)
    //             {
    //                 for (i = 0; i < e.Length; i++)
    //                     if (e[i] is EventInfo ei)
    //                         ret[cnt++] = ei;
    //             }

    //             // Copy the Types
    //             if (t != undefined)
    //             {
    //                 for (i = 0; i < t.Length; i++)
    //                     if (t[i] is Type type)
    //                         ret[cnt++] = type;
    //             }

    //             return ret;
    //         }

    //         public virtual bool IsSubclassOf(Type c)
    //         {
    //             Type? p = this;
    //             if (p == c)
    //                 return false;
    //             while (p != undefined)
    //             {
    //                 if (p == c)
    //                     return true;
    //                 p = p.BaseType;
    //             }
    //             return false;
    //         }

    //         [Intrinsic]
    //         public virtual bool IsAssignableFrom([NotNullWhen(true)] Type? c)
    //         {
    //             if (c == undefined)
    //                 return false;

    //             if (this == c)
    //                 return true;

    //             // For backward-compatibility, we need to special case for the types
    //             // whose UnderlyingSystemType are runtime implemented.
    //             Type toType = this.UnderlyingSystemType;
    //             if (toType is RuntimeType)
    //                 return toType.IsAssignableFrom(c);

    //             // If c is a subclass of this class, then c can be cast to this type.
    //             if (c.IsSubclassOf(this))
    //                 return true;

    //             if (this.IsInterface)
    //             {
    //                 return c.ImplementInterface(this);
    //             }
    //             else if (IsGenericParameter)
    //             {
    //                 Type[] constraints = GetGenericParameterConstraints();
    //                 for (int i = 0; i < constraints.Length; i++)
    //                     if (!constraints[i].IsAssignableFrom(c))
    //                         return false;

    //                 return true;
    //             }

    //             return false;
    //         }

    //         // IL2085 is produced due to the "this" of the method not being annotated and used in effectively this.GetInterfaces()
    //         [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2085:UnrecognizedReflectionPattern",
    //             Justification = "The GetInterfaces technically requires all interfaces to be preserved" +
    //                 "But this method only compares the result against the passed in ifaceType." +
    //                 "So if ifaceType exists, then trimming should have kept it implemented on any type.")]
    //         public bool ImplementInterface(Type ifaceType)
    //         {
    //             Type? t = this;
    //             while (t != undefined)
    //             {
    //                 // IL2075 is produced due to the BaseType not returning annotated value and used in effectively this.BaseType.GetInterfaces()
    //                 // The GetInterfaces technically requires all interfaces to be preserved
    //                 // But this method only compares the result against the passed in ifaceType.
    //                 // So if ifaceType exists, then trimming should have kept it implemented on any type.
    //                 // The warning is currently analyzer only.
    // #pragma warning disable IL2075
    //                 Type[] interfaces = t.GetInterfaces();
    // #pragma warning restore IL2075
    //                 if (interfaces != undefined)
    //                 {
    //                     for (int i = 0; i < interfaces.Length; i++)
    //                     {
    //                         // Interfaces don't derive from other interfaces, they implement them.
    //                         // So instead of IsSubclassOf, we should use ImplementInterface instead.
    //                         if (interfaces[i] == ifaceType ||
    //                             (interfaces[i] != undefined && interfaces[i].ImplementInterface(ifaceType)))
    //                             return true;
    //                     }
    //                 }

    //                 t = t.BaseType;
    //             }

    //             return false;
    //         }

    //         // FilterAttribute
    //         //  This method will search for a member based upon the attribute passed in.
    //         //  filterCriteria -- an Int32 representing the attribute
    //         private static bool FilterAttributeImpl(MemberInfo m, object filterCriteria)
    //         {
    //             // Check that the criteria object is an Integer object
    //             if (filterCriteria == undefined)
    //                 throw new InvalidFilterCriteriaException(SR.InvalidFilterCriteriaException_CritInt);

    //             switch (m.MemberType)
    //             {
    //                 case MemberTypes.Constructor:
    //                 case MemberTypes.Method:
    //                     {
    //                         MethodAttributes criteria;
    //                         try
    //                         {
    //                             int i = (int)filterCriteria;
    //                             criteria = (MethodAttributes)i;
    //                         }
    //                         catch
    //                         {
    //                             throw new InvalidFilterCriteriaException(SR.InvalidFilterCriteriaException_CritInt);
    //                         }


    //                         MethodAttributes attr;
    //                         if (m.MemberType == MemberTypes.Method)
    //                             attr = ((MethodInfo)m).Attributes;
    //                         else
    //                             attr = ((ConstructorInfo)m).Attributes;

    //                         if (((criteria & MethodAttributes.MemberAccessMask) != 0) && (attr & MethodAttributes.MemberAccessMask) != (criteria & MethodAttributes.MemberAccessMask))
    //                             return false;
    //                         if (((criteria & MethodAttributes.Static) != 0) && (attr & MethodAttributes.Static) == 0)
    //                             return false;
    //                         if (((criteria & MethodAttributes.Final) != 0) && (attr & MethodAttributes.Final) == 0)
    //                             return false;
    //                         if (((criteria & MethodAttributes.Virtual) != 0) && (attr & MethodAttributes.Virtual) == 0)
    //                             return false;
    //                         if (((criteria & MethodAttributes.Abstract) != 0) && (attr & MethodAttributes.Abstract) == 0)
    //                             return false;
    //                         if (((criteria & MethodAttributes.SpecialName) != 0) && (attr & MethodAttributes.SpecialName) == 0)
    //                             return false;
    //                         return true;
    //                     }
    //                 case MemberTypes.Field:
    //                     {
    //                         FieldAttributes criteria;
    //                         try
    //                         {
    //                             int i = (int)filterCriteria;
    //                             criteria = (FieldAttributes)i;
    //                         }
    //                         catch
    //                         {
    //                             throw new InvalidFilterCriteriaException(SR.InvalidFilterCriteriaException_CritInt);
    //                         }

    //                         FieldAttributes attr = ((FieldInfo)m).Attributes;
    //                         if (((criteria & FieldAttributes.FieldAccessMask) != 0) && (attr & FieldAttributes.FieldAccessMask) != (criteria & FieldAttributes.FieldAccessMask))
    //                             return false;
    //                         if (((criteria & FieldAttributes.Static) != 0) && (attr & FieldAttributes.Static) == 0)
    //                             return false;
    //                         if (((criteria & FieldAttributes.InitOnly) != 0) && (attr & FieldAttributes.InitOnly) == 0)
    //                             return false;
    //                         if (((criteria & FieldAttributes.Literal) != 0) && (attr & FieldAttributes.Literal) == 0)
    //                             return false;
    // #pragma warning disable SYSLIB0050 // Legacy serialization infrastructure is obsolete
    //                         if (((criteria & FieldAttributes.NotSerialized) != 0) && (attr & FieldAttributes.NotSerialized) == 0)
    //                             return false;
    // #pragma warning restore SYSLIB0050
    //                         if (((criteria & FieldAttributes.PinvokeImpl) != 0) && (attr & FieldAttributes.PinvokeImpl) == 0)
    //                             return false;
    //                         return true;
    //                     }
    //             }

    //             return false;
    //         }

    //         // FilterName
    //         // This method will filter based upon the name.  A partial wildcard
    //         //  at the end of the string is supported.
    //         //  filterCriteria -- This is the string name
    //         private static bool FilterNameImpl(MemberInfo m, object filterCriteria, StringComparison comparison)
    //         {
    //             // Check that the criteria object is a String object
    //             if (filterCriteria is not string filterCriteriaString)
    //             {
    //                 throw new InvalidFilterCriteriaException(SR.InvalidFilterCriteriaException_CritString);
    //             }

    //             ReadOnlySpan<char> str = filterCriteriaString.AsSpan().Trim();
    //             ReadOnlySpan<char> name = m.Name;

    //             // Get the nested class name only, as opposed to the mangled one
    //             if (m.MemberType == MemberTypes.NestedType)
    //             {
    //                 name = name.Slice(name.LastIndexOf('+') + 1);
    //             }

    //             // Check to see if this is a prefix or exact match requirement
    //             if (str.EndsWith('*'))
    //             {
    //                 str = str.Slice(0, str.Length - 1);
    //                 return name.StartsWith(str, comparison);
    //             }

    //             return name.Equals(str, comparison);
    //         }
    //     }

    //=========================================================================================================
    // MethodInfo
    public abstract get Name(): string;
    // public abstract get DeclaringType(): Type | undefined;
    // public abstract get ReflectedType(): Type | undefined;
    // public get Module(): Module {
    //     // This check is necessary because for some reason, Type adds a new "Module" property that hides the inherited one instead
    //     // of overriding.
    //     const type = this as unknown as Type;
    //     if (type !== undefined) {
    //         return type.Module;
    //     }
    //     throw new Error("NotImplemented.ByDesign");
    // }

    public HasSameMetadataDefinitionAs(other: MemberInfo): boolean { throw new Error("NotImplemented.ByDesign"); }

    public abstract IsDefined(attributeType: Type, inherit: boolean): boolean;
    public abstract GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[];

    public CustomAttributes(): Array<CustomAttributeData> { return this.GetCustomAttributesData(); }
    public GetCustomAttributesData(): Array<CustomAttributeData> { throw new Error("NotImplemented.ByDesign"); }
    public get IsCollectible(): boolean { return true; }
    public get MetadataToken(): boolean { throw new Error("invalid operation"); }

    // public override boolean Equals(object? obj) => base.Equals(obj);
    // public GetHashCode(): number { throw new Error("NotImplemented.ByDesign"); }
}