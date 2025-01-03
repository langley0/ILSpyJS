// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

// using System.Collections.Generic;
// using System.Diagnostics.CodeAnalysis;
// namespace System.Reflection
import { Type } from "System/Type";
import { IReflectableType, BindingFlags } from "System.Reflection";
import { Throw } from "System/Throw";

export abstract class TypeInfo extends Type implements IReflectableType {
    protected constructor() { super(); }

    public GetTypeInfo(): TypeInfo { return this }
    public AsType(): Type { return this; }

    public get GenericTypeParameters(): Type[] { return this.IsGenericTypeDefinition ? this.GetGenericArguments() : Type.EmptyTypes; }

    //     [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicEvents | DynamicallyAccessedMemberTypes.NonPublicEvents)]
    //     public virtual EventInfo? GetDeclaredEvent(string name) => GetEvent(name, DeclaredOnlyLookup);

    //     [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields | DynamicallyAccessedMemberTypes.NonPublicFields)]
    //     public virtual FieldInfo? GetDeclaredField(string name) => GetField(name, DeclaredOnlyLookup);

    //     [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //     public virtual MethodInfo? GetDeclaredMethod(string name) => GetMethod(name, DeclaredOnlyLookup);

    //     [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicNestedTypes | DynamicallyAccessedMemberTypes.NonPublicNestedTypes)]
    //     public virtual TypeInfo? GetDeclaredNestedType(string name) => GetNestedType(name, DeclaredOnlyLookup)?.GetTypeInfo();

    //     [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties)]
    //     public virtual PropertyInfo? GetDeclaredProperty(string name) => GetProperty(name, DeclaredOnlyLookup);

    //     [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //     public virtual IEnumerable<MethodInfo> GetDeclaredMethods(string name)
    //     {
    //         foreach (MethodInfo method in GetDeclaredOnlyMethods(this))
    //         {
    //             if (method.Name == name)
    //                 yield return method;
    //         }

    //         [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2070:UnrecognizedReflectionPattern",
    //             Justification = "The yield return state machine doesn't propagate annotations")]
    //         static MethodInfo[] GetDeclaredOnlyMethods(
    //             Type type) => type.GetMethods(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<ConstructorInfo> DeclaredConstructors
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors | DynamicallyAccessedMemberTypes.NonPublicConstructors)]
    //         get => GetConstructors(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<EventInfo> DeclaredEvents
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicEvents | DynamicallyAccessedMemberTypes.NonPublicEvents)]
    //         get => GetEvents(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<FieldInfo> DeclaredFields
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicFields | DynamicallyAccessedMemberTypes.NonPublicFields)]
    //         get => GetFields(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<MemberInfo> DeclaredMembers
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.All)]
    //         get => GetMembers(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<MethodInfo> DeclaredMethods
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods | DynamicallyAccessedMemberTypes.NonPublicMethods)]
    //         get => GetMethods(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<TypeInfo> DeclaredNestedTypes
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicNestedTypes | DynamicallyAccessedMemberTypes.NonPublicNestedTypes)]
    //         get
    //         {
    //             foreach (Type t in GetDeclaredOnlyNestedTypes(this))
    //             {
    //                 yield return t.GetTypeInfo();
    //             }

    //             [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2070:UnrecognizedReflectionPattern",
    //                 Justification = "The yield return state machine doesn't propagate annotations")]
    //             static Type[] GetDeclaredOnlyNestedTypes(
    //                 Type type) => type.GetNestedTypes(DeclaredOnlyLookup);
    //         }
    //     }

    //     public virtual IEnumerable<PropertyInfo> DeclaredProperties
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties | DynamicallyAccessedMemberTypes.NonPublicProperties)]
    //         get => GetProperties(DeclaredOnlyLookup);
    //     }

    //     public virtual IEnumerable<Type> ImplementedInterfaces
    //     {
    //         [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.Interfaces)]
    //         get => GetInterfaces();
    //     }

    //     // a re-implementation of ISAF from Type, skipping the use of UnderlyingType
    //     public virtual bool IsAssignableFrom([NotNullWhen(true)] TypeInfo? typeInfo)
    //     {
    //         if (typeInfo == null)
    //             return false;

    //         if (this == typeInfo)
    //             return true;

    //         // If c is a subclass of this class, then c can be cast to this type.
    //         if (typeInfo.IsSubclassOf(this))
    //             return true;

    //         if (this.IsInterface)
    //         {
    //             return typeInfo.ImplementInterface(this);
    //         }
    //         else if (IsGenericParameter)
    //         {
    //             Type[] constraints = GetGenericParameterConstraints();
    //             for (int i = 0; i < constraints.Length; i++)
    //                 if (!constraints[i].IsAssignableFrom(typeInfo))
    //                     return false;

    //             return true;
    //         }

    //         return false;
    //     }

    public static GetRankString(rank: number): string {
        if (rank <= 0)
            Throw.ArgumentOutOfRange('rank');

        return rank == 1 ?
            "[*]" :
            "[" + ',' + (rank - 1).toString() + "]";
    }

    private static readonly DeclaredOnlyLookup: BindingFlags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.DeclaredOnly;
}

