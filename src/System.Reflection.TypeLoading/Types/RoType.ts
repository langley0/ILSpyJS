import { Binder } from "Microsoft.CSharp.RuntimeBinder";
import { Throw, Type } from "System";
import {
    MetadataLoadContext,
    Assembly,
    Module,
    GenericParameterAttributes,
    TypeAttributes,
    CustomAttributeData,
    MethodBase,
    BindingFlags,
    CallingConventions,
    ParameterModifier,
    EventInfo,
    FieldInfo,
} from "System.Reflection";
import { LeveledTypeInfo, CoreType, RoModule, Utf8Constants, ToReadOnlyCollection } from "System.Reflection.TypeLoading";
import { ConstructorInfo } from "System.Reflection/ConstructorInfo";

enum TypeClassification {
    Computed = 0x00000001,    // Always set (to indicate that the lazy evaluation has occurred)
    IsByRefLike = 0x00000004,
}


enum BaseTypeClassification {
    Computed = 0x00000001,    // Always set (to indicate that the lazy evaluation has occurred)
    IsValueType = 0x00000002,
    IsEnum = 0x00000004,
}


export abstract class RoType extends LeveledTypeInfo {
    private readonly TypeAttributesSentinel: TypeAttributes = -1 as TypeAttributes;

    protected constructor() { super(); }

    // public override  AsType(): Type { return this; }
    public override get UnderlyingSystemType(): Type { return this; }

    //         public override bool Equals([NotNullWhen(true)] object ? obj)
    // {
    //     if (obj is RoType objType)
    //     {
    //         if (obj is not RoModifiedType)
    //         {
    //             return base.Equals(objType);
    //         }
    //     }

    //     return false;
    // }

    public override  GetHashCode(): number { return super.GetHashCode(); }
    public abstract override get IsTypeDefinition(): boolean;
    public abstract override get IsGenericTypeDefinition(): boolean;
    protected abstract override  HasElementTypeImpl(): boolean;
    public Call_HasElementTypeImpl(): boolean { return this.HasElementTypeImpl(); }
    protected abstract override  IsArrayImpl(): boolean;
    public Call_IsArrayImpl(): boolean { return this.IsArrayImpl(); }
    public abstract override get IsSZArray(): boolean;
    public abstract override get IsVariableBoundArray(): boolean;
    protected abstract override  IsByRefImpl(): boolean;
    public Call_IsByRefImpl(): boolean { return this.IsByRefImpl(); }
    protected abstract override  IsPointerImpl(): boolean;
    public lCall_IsPointerImpl(): boolean { return this.IsPointerImpl(); }
    public abstract override get IsConstructedGenericType(): boolean;
    public abstract override get IsGenericParameter(): boolean;
    public abstract override get IsGenericTypeParameter(): boolean;
    public abstract override get IsGenericMethodParameter(): boolean;
    public override get IsByRefLike(): boolean { return (this.GetClassification() & TypeClassification.IsByRefLike) != 0; }

    public abstract override get IsFunctionPointer(): boolean;
    public abstract override get IsUnmanagedFunctionPointer(): boolean;

    //         public override Type[] GetFunctionPointerCallingConventions()
    //         {
    //             if (!IsFunctionPointer)
    //             {
    //                 throw new InvalidOperationException(SR.InvalidOperation_NotFunctionPointer);
    //             }

    //             // Requires a modified type to return the modifiers.
    //             return EmptyTypes;
    //         }

    public abstract override GetFunctionPointerReturnType(): Type;
    public abstract override GetFunctionPointerParameterTypes(): Type[];

    //         // RoModifiedType overrides these.
    //         public override Type[] GetOptionalCustomModifiers() { return this.EmptyTypes;
    //         public override Type[] GetRequiredCustomModifiers() { return this.EmptyTypes;

    public abstract override get ContainsGenericParameters(): boolean;
    //         // Applies if IsGenericTypeDefinition == true
    //         public  override Type[] GenericTypeParameters { return this.GetGenericTypeParametersNoCopy().CloneArray<Type>();
    //         public abstract RoType[] GetGenericTypeParametersNoCopy();

    // Applies if HasElementType == true
    public override  GetElementType(): Type | undefined { return this.GetRoElementType(); }
    public abstract GetRoElementType(): RoType | undefined;

    //         // Applies if IsArray == true
    //         public abstract override int GetArrayRank();

    //         // Applies if IsConstructedGenericType == true
    //         public abstract override Type GetGenericTypeDefinition();
    //         public  override Type[] GenericTypeArguments { return this.GetGenericTypeArgumentsNoCopy().CloneArray<Type>();
    //         public abstract RoType[] GetGenericTypeArgumentsNoCopy();

    // Applies if IsGenericParameter == true
    public abstract override get GenericParameterAttributes(): GenericParameterAttributes;
    public abstract override get GenericParameterPosition(): number;
    public abstract override GetGenericParameterConstraints(): Type[];

    //         // .NET 2.0 apis for detecting/deconstructing generic type definition/constructed generic types.
    //         public  override bool IsGenericType { return this.IsConstructedGenericType || IsGenericTypeDefinition;

    //         //  Don't seal since we may need to convert any modified types to unmodified.
    //         public override Type[] GetGenericArguments() { return this.GetGenericArgumentsNoCopy().CloneArray();

    //         protected public abstract RoType[] GetGenericArgumentsNoCopy();

    // Naming
    public override get Name(): string { this._lazyName = this._lazyName ?? this.ComputeName(); return this._lazyName; }
    protected abstract ComputeName(): string;
    public Call_ComputeName(): string | undefined { return this.ComputeName(); }
    private _lazyName: string | undefined = undefined;

    public override get Namespace(): string | undefined { this._lazyNamespace = this._lazyNamespace ?? this.ComputeNamespace(); return this._lazyNamespace; }
    protected abstract ComputeNamespace(): string | undefined;
    public Call_ComputeNamespace(): string | undefined { return this.ComputeNamespace(); }
    private _lazyNamespace: string | undefined = undefined;

    public override get FullName(): string | undefined { this._lazyFullName = this._lazyFullName ?? this.ComputeFullName(); return this._lazyFullName; }
    protected abstract ComputeFullName(): string | undefined;
    public Call_ComputeFullName(): string | undefined { return this.ComputeFullName(); }
    private _lazyFullName: string | undefined = undefined;
    public override get AssemblyQualifiedName(): string | undefined { this._lazyAssemblyQualifiedFullName = this._lazyAssemblyQualifiedFullName ?? this.ComputeAssemblyQualifiedName(); return this._lazyAssemblyQualifiedFullName; }
    private ComputeAssemblyQualifiedName(): string | undefined {
        const fullName = this.FullName;
        if (fullName == undefined)   // Open types return undefined for FullName by design.
            return undefined;
        const assemblyName = this.Assembly.FullName;
        return fullName + ", " + assemblyName;
    }
    private _lazyAssemblyQualifiedFullName: string | undefined = undefined;

    // Assembly and module
    public override get Assembly(): Assembly { return this.Module.Assembly; }
    public override get Module(): Module { return this.GetRoModule(); }
    public abstract GetRoModule(): RoModule;

    // Nesting
    public override get DeclaringType(): Type | undefined { return this.GetRoDeclaringType(); }
    protected abstract ComputeDeclaringType(): RoType | undefined;
    public GetRoDeclaringType(): RoType | undefined {
        this._lazyDeclaringType ??= this.ComputeDeclaringType();
        return this._lazyDeclaringType;
    }
    public Call_ComputeDeclaringType(): RoType | undefined { return this.ComputeDeclaringType(); }
    private _lazyDeclaringType: RoType | undefined = undefined;

    public abstract override get DeclaringMethod(): MethodBase | undefined;
    // .NET Framework compat: For types, ReflectedType == DeclaringType. Nested types are always looked up as if BindingFlags.DeclaredOnly was passed.
    // For non-nested types, the concept of a ReflectedType doesn't even make sense.
    public override get ReflectedType(): Type | undefined { return this.DeclaringType; }

    // CustomAttributeData
    public override  GetCustomAttributesData(): Array<CustomAttributeData> { return ToReadOnlyCollection(this.CustomAttributes); }
    public abstract override get CustomAttributes(): Array<CustomAttributeData>;

    //         // Optimized routines that find a custom attribute by type name only.
    public abstract IsCustomAttributeDefined(ns: Uint8Array, name: Uint8Array): boolean
    public abstract TryFindCustomAttribute(ns: Uint8Array, name: Uint8Array): CustomAttributeData | undefined;

    //         // Inheritance
    public override get BaseType(): Type | undefined {
        return this.GetRoBaseType();
    }
    public GetRoBaseType(): RoType | undefined {
        return this._lazyBaseType == undefined ? (this._lazyBaseType = this.ComputeBaseType()) : this._lazyBaseType;
    }
    private ComputeBaseType(): RoType | undefined {
        let baseType = this.ComputeBaseTypeWithoutDesktopQuirk();
        if (baseType != undefined && baseType.IsGenericParameter) {
            // .NET Framework quirk: a generic parameter whose constraint is another generic parameter reports its BaseType as System.Object
            // unless that other generic parameter has a "class" constraint.
            const genericParameterAttributes = baseType.GenericParameterAttributes;
            if (0 == (genericParameterAttributes & GenericParameterAttributes.ReferenceTypeConstraint))
                baseType = this.Loader.GetCoreType(CoreType.Object);
        }
        return baseType;
    }
    private _lazyBaseType: RoType | undefined = undefined;

    //         //
    //         // This public method implements BaseType without the following .NET Framework quirk:
    //         //
    //         //     class Foo<X,Y>
    //         //       where X:Y
    //         //       where Y:MyReferenceClass
    //         //
    //         // .NET Framework reports "X"'s base type as "System.Object" rather than "Y", even though it does
    //         // report any interfaces that are in MyReferenceClass's interface list.
    //         //
    //         // This seriously messes up the implementation of Type.GetInterfaces() which assumes
    //         // that it can recover the transitive interface closure by combining the directly mentioned interfaces and
    //         // the BaseType's own interface closure.
    //         //
    //         // To implement this with the least amount of code smell, we'll implement the idealized version of BaseType here
    //         // and make the special-case adjustment in the public version of BaseType.
    //         //
    public abstract ComputeBaseTypeWithoutDesktopQuirk(): RoType | undefined;

    //         public  override Type[] GetInterfaces() { return this.GetInterfacesNoCopy().CloneArray<Type>();

    //         public  override IEnumerable<Type> ImplementedInterfaces
    //         {
    //             get
    //             {
    //                 foreach (Type ifc in GetInterfacesNoCopy())
    //                 {
    //                     yield return ifc;
    //                 }
    //             }
    //         }

    //         public abstract IEnumerable<RoType> ComputeDirectlyImplementedInterfaces();

    //         public RoType[] GetInterfacesNoCopy() { return this._lazyInterfaces ??= ComputeInterfaceClosure();
    //         private RoType[] ComputeInterfaceClosure()
    //         {
    //             HashSet<RoType> ifcs = new HashSet<RoType>();

    //             RoType? baseType = ComputeBaseTypeWithoutDesktopQuirk();
    //             if (baseType != undefined)
    //             {
    //                 foreach (RoType ifc in baseType.GetInterfacesNoCopy())
    //                 {
    //                     ifcs.Add(ifc);
    //                 }
    //             }

    //             foreach (RoType ifc in ComputeDirectlyImplementedInterfaces())
    //             {
    //                 bool notSeenBefore = ifcs.Add(ifc);
    //                 if (!notSeenBefore)
    //                 {
    //                     foreach (RoType indirectIfc in ifc.GetInterfacesNoCopy())
    //                     {
    //                         ifcs.Add(indirectIfc);
    //                     }
    //                 }
    //             }

    //             if (ifcs.Count == 0)
    //             {
    //                 return Array.Empty<RoType>();
    //             }

    //             var arr = new RoType[ifcs.Count];
    //             ifcs.CopyTo(arr);
    //             return arr;
    //         }

    //         private volatile RoType[]? _lazyInterfaces;

    //         public  override InterfaceMapping GetInterfaceMap(Type interfaceType) { return this.throw new NotSupportedException(SR.NotSupported_InterfaceMapping);

    //         // Assignability
    //         public  override bool IsAssignableFrom(TypeInfo? typeInfo) { return this.IsAssignableFrom((Type?)typeInfo);
    //         public  override bool IsAssignableFrom(Type? c)
    //         {
    //             if (c == undefined)
    //                 return false;

    //             if (object.ReferenceEquals(c, this))
    //                 return true;

    //             c = c.UnderlyingSystemType;
    //             if (!(c is RoType roType && roType.Loader == Loader))
    //                 return false;

    //             return Assignability.IsAssignableFrom(this, c, Loader.GetAllFoundCoreTypes());
    //         }

    //         // Identify interesting subgroups of Types
    protected override  IsCOMObjectImpl(): boolean { return false; }   // RCW's are irrelevant in a MetadataLoadContext without object creation.
    public override get IsEnum(): boolean { return (this.GetBaseTypeClassification() & BaseTypeClassification.IsEnum) != 0; }
    protected override  IsValueTypeImpl(): boolean { return (this.GetBaseTypeClassification() & BaseTypeClassification.IsValueType) != 0; }

    //         // Metadata
    public abstract override get MetadataToken(): number;
    //         public  override bool HasSameMetadataDefinitionAs(MemberInfo other) { return this.this.HasSameMetadataDefinitionAsCore(other);

    // TypeAttributes
    protected override  GetAttributeFlagsImpl(): TypeAttributes {
        this._lazyTypeAttributes = this._lazyTypeAttributes == this.TypeAttributesSentinel
            ? this.ComputeAttributeFlags()
            : this._lazyTypeAttributes;
        return this._lazyTypeAttributes;
    }
    protected abstract ComputeAttributeFlags(): TypeAttributes;
    public Call_ComputeAttributeFlags(): TypeAttributes { return this.ComputeAttributeFlags(); }
    private _lazyTypeAttributes: TypeAttributes = this.TypeAttributesSentinel;

    //         // Miscellaneous properties
    //         public  override MemberTypes MemberType { return this.IsPublic || IsNotPublic ? MemberTypes.TypeInfo : MemberTypes.NestedType;
    //         protected abstract override TypeCode GetTypeCodeImpl();
    //         public TypeCode Call_GetTypeCodeImpl() { return this.GetTypeCodeImpl();
    public abstract override  ToString(): string;

    //         // Random interop stuff
    //         public abstract override Guid GUID { get; }
    //         public abstract override StructLayoutAttribute? StructLayoutAttribute { get; }

    //         public  override MemberInfo[] GetDefaultMembers()
    //         {
    //             string? defaultMemberName = GetDefaultMemberName();
    //             return defaultMemberName != undefined ? GetMember(defaultMemberName) : Array.Empty<MemberInfo>();
    //         }

    //         private string? GetDefaultMemberName()
    //         {
    //             for (RoType? type = this; type != undefined; type = type.GetRoBaseType())
    //             {
    //                 CustomAttributeData? attribute = type.TryFindCustomAttribute(Utf8Constants.SystemReflection, Utf8Constants.DefaultMemberAttribute);
    //                 if (attribute != undefined)
    //                 {
    //                     IList<CustomAttributeTypedArgument> fixedArguments = attribute.ConstructorArguments;
    //                     if (fixedArguments.Count == 1 && fixedArguments[0].Value is string memberName)
    //                         return memberName;
    //                 }
    //             }
    //             return undefined;
    //         }

    //         // Type Factories
    //         public  override Type MakeArrayType() { return this.this.GetUniqueArrayType();
    //         public  override Type MakeArrayType(int rank)
    //         {
    //             if (rank <= 0)
    //                 throw new IndexOutOfRangeException(); // This is an impressively uninformative exception, unfortunately, this is the compatible behavior.

    //             return this.GetUniqueArrayType(rank);
    //         }

    //         public  override Type MakeByRefType() { return this.this.GetUniqueByRefType();
    //         public  override Type MakePointerType() { return this.this.GetUniquePointerType();
    //         [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
    //         public abstract override Type MakeGenericType(params Type[] typeArguments);

    //         // Enum methods
    //         public  override Type GetEnumUnderlyingType() { return this._lazyUnderlyingEnumType ??= ComputeEnumUnderlyingType();
    //         protected public abstract RoType ComputeEnumUnderlyingType();
    //         private volatile RoType? _lazyUnderlyingEnumType;
    //         public  override Array GetEnumValues() { return this.throw new InvalidOperationException(SR.Arg_InvalidOperation_Reflection);

    // #if NET
    //         [UnconditionalSuppressMessage("ReflectionAnalysis", "IL2085:UnrecognizedReflectionPattern",
    //             Justification = "Enum Types are not trimmed.")]
    //         public override Array GetEnumValuesAsUnderlyingType()
    //         {
    //             if (!IsEnum)
    //                 throw new ArgumentException(SR.Arg_MustBeEnum, "enumType");

    //             FieldInfo[] enumFields = GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static);
    //             int numValues = enumFields.Length;
    //             Array ret = Type.GetTypeCode(GetEnumUnderlyingType()) switch
    //             {
    //                 TypeCode.Byte { return this.new byte[numValues],
    //                 TypeCode.SByte { return this.new sbyte[numValues],
    //                 TypeCode.UInt16 { return this.new ushort[numValues],
    //                 TypeCode.Int16 { return this.new short[numValues],
    //                 TypeCode.UInt32 { return this.new uint[numValues],
    //                 TypeCode.Int32 { return this.new int[numValues],
    //                 TypeCode.UInt64 { return this.new ulong[numValues],
    //                 TypeCode.Int64 { return this.new long[numValues],
    //                 _ { return this.throw new NotSupportedException(),
    //             };

    //             for (int i = 0; i < numValues; i++)
    //             {
    //                 ret.SetValue(enumFields[i].GetRawConstantValue(), i);
    //             }

    //             return ret;
    //         }
    // #endif

    //         // No trust environment to apply these to.
    //         public  override bool IsSecurityCritical { return this.throw new InvalidOperationException(SR.InvalidOperation_IsSecurity);
    //         public  override bool IsSecuritySafeCritical { return this.throw new InvalidOperationException(SR.InvalidOperation_IsSecurity);
    //         public  override bool IsSecurityTransparent { return this.throw new InvalidOperationException(SR.InvalidOperation_IsSecurity);

    //         // Prohibited for ReflectionOnly types
    //         public  override RuntimeTypeHandle TypeHandle { return this.throw new InvalidOperationException(SR.Arg_InvalidOperation_Reflection);
    //         public  override object[] GetCustomAttributes(bool inherit) { return this.throw new InvalidOperationException(SR.Arg_ReflectionOnlyCA);
    public GetCustomAttributes(attributeTypeOrInherit: Type | boolean, inherit?: boolean): object[] { Throw.InvalidOperationException("Arg_ReflectionOnlyCA"); }
    public IsDefined(attributeType: Type, inherit: boolean): boolean { Throw.InvalidOperationException('Arg_ReflectionOnlyCA'); }
    //         public  override object? InvokeMember(string name, BindingFlags invokeAttr, Binder? binder, object? target, object?[]? args, ParameterModifier[]? modifiers, CultureInfo? culture, string[]? namedParameters) { return this.throw new InvalidOperationException(SR.Arg_ReflectionOnlyInvoke);

    //         // Low level support for the BindingFlag-driven enumerator apis. These return members declared (not inherited) on the current
    //         // type, possibly doing case-sensitive/case-insensitive filtering on a supplied name.
    //         public abstract IEnumerable<ConstructorInfo> GetConstructorsCore(NameFilter? filter);
    //         public abstract IEnumerable<MethodInfo> GetMethodsCore(NameFilter? filter, Type reflectedType);
    //         public abstract IEnumerable<EventInfo> GetEventsCore(NameFilter? filter, Type reflectedType);
    //         public abstract IEnumerable<FieldInfo> GetFieldsCore(NameFilter? filter, Type reflectedType);
    //         public abstract IEnumerable<PropertyInfo> GetPropertiesCore(NameFilter? filter, Type reflectedType);
    //         public abstract IEnumerable<RoType> GetNestedTypesCore(NameFilter? filter);

    //         // Backdoor for RoModule to invoke GetMethodImpl();
    //         public MethodInfo? InternalGetMethodImpl(string name, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers)
    //         {
    //             return GetMethodImpl(name, bindingAttr, binder, callConvention, types, modifiers);
    //         }

    //         // Returns the MetadataLoadContext used to load this type.
    public get Loader(): MetadataLoadContext { return this.GetRoModule().Loader; }

    //==============================================================================================================
    // TypeClassifications
    private GetClassification(): TypeClassification {
        this._lazyClassification = this._lazyClassification != (0 as TypeClassification) ? this._lazyClassification : this.ComputeClassification();
        return this._lazyClassification;
    }
    private ComputeClassification(): TypeClassification {
        let classification = TypeClassification.Computed;

        if (this.IsCustomAttributeDefined(Utf8Constants.SystemRuntimeCompilerServices, Utf8Constants.IsByRefLikeAttribute)) {
            classification |= TypeClassification.IsByRefLike;
        }

        return classification;
    }
    private _lazyClassification: TypeClassification = 0 as TypeClassification;

    private GetBaseTypeClassification(): BaseTypeClassification {
        this._lazyBaseTypeClassification = this._lazyBaseTypeClassification != (0 as BaseTypeClassification) ? this._lazyBaseTypeClassification : this.ComputeBaseTypeClassification();
        return this._lazyBaseTypeClassification;
    }
    private ComputeBaseTypeClassification(): BaseTypeClassification {
        let classification = BaseTypeClassification.Computed;

        const baseType = this.BaseType;
        if (baseType != null) {
            const coreTypes = this.Loader.GetAllFoundCoreTypes();

            const enumType = coreTypes.At(CoreType.Enum);
            const valueType = coreTypes.At(CoreType.ValueType);

            if (baseType.Equals(enumType))
                classification |= BaseTypeClassification.IsEnum | BaseTypeClassification.IsValueType;

            if (baseType.Equals(valueType) && this != enumType) {
                classification |= BaseTypeClassification.IsValueType;
            }
        }

        return classification;
    }
    private _lazyBaseTypeClassification: BaseTypeClassification = 0 as BaseTypeClassification;

    // Keep this separate from the other TypeClassification computations as it locks in the core assembly name.
    protected override IsPrimitiveImpl(): boolean {
        const coreTypes = this.Loader.GetAllFoundCoreTypes();
        for (const primitiveType of RoType.s_primitiveTypes) {
            if (this == coreTypes.At(primitiveType)) {
                return true;
            }
        }
        return false;
    }

    // The exact set of types for which IsPrimitive is supposed to return true.
    private static readonly s_primitiveTypes = Array.from([

        CoreType.Boolean,
        CoreType.Char,
        CoreType.SByte,
        CoreType.Byte,
        CoreType.Int16,
        CoreType.UInt16,
        CoreType.Int32,
        CoreType.UInt32,
        CoreType.Int64,
        CoreType.UInt64,
        CoreType.Single,
        CoreType.Double,
        CoreType.IntPtr,
        CoreType.UIntPtr,
    ]);

    //==============================================================================================================
    // Binding Flags
    // public sealed override ConstructorInfo[] GetConstructors(BindingFlags bindingAttr) => Query<ConstructorInfo>(bindingAttr).ToArray();

    protected override GetConstructorImpl(bindingAttr: BindingFlags, binder: Binder | undefined, callConvention: CallingConventions, types: Type[] | undefined, modifiers: ParameterModifier[] | undefined): ConstructorInfo | undefined {
        // Debug.Assert(types != null);

        // QueryResult<ConstructorInfo> queryResult = Query<ConstructorInfo>(bindingAttr);
        // ListBuilder<ConstructorInfo> candidates = default;
        // foreach (ConstructorInfo candidate in queryResult)
        // {
        //     if (candidate.QualifiesBasedOnParameterCount(bindingAttr, callConvention, types))
        //         candidates.Add(candidate);
        // }

        // // For perf and .NET Framework compat, fast-path these specific checks before calling on the binder to break ties.
        // if (candidates.Count == 0)
        //     return null;

        // if (types.Length == 0 && candidates.Count == 1)
        // {
        //     ConstructorInfo firstCandidate = candidates[0];
        //     ParameterInfo[] parameters = firstCandidate.GetParametersNoCopy();
        //     if (parameters.Length == 0)
        //         return firstCandidate;
        // }

        // if ((bindingAttr & BindingFlags.ExactBinding) != 0)
        //     return System.DefaultBinder.ExactBinding(candidates.ToArray(), types) as ConstructorInfo;

        // binder ??= Loader.GetDefaultBinder();

        // return binder.SelectMethod(bindingAttr, candidates.ToArray(), types, modifiers) as ConstructorInfo;
        throw new Error("Not implemented");
    }

    public override  GetEvents(bindingAttr: BindingFlags): EventInfo[] {
        //  return this.Query<EventInfo>(bindingAttr).ToArray();
        throw new Error("Not implemented");
    }
    public override  GetEvent(name: string, bindingAttr: BindingFlags): EventInfo | undefined {
        // return this.Query<EventInfo>(name, bindingAttr).Disambiguate();
        throw new Error("Not implemented");
    }

    public override GetFields(bindingAttr: BindingFlags): FieldInfo[] {
        //return  Query<FieldInfo>(bindingAttr).ToArray();
        throw new Error("Not implemented");
    }
    public override  GetField(name: string, bindingAttr: BindingFlags): FieldInfo | undefined {
        //return  Query<FieldInfo>(name, bindingAttr).Disambiguate();
        throw new Error("Not implemented");
    }

    // public sealed override MethodInfo[] GetMethods(BindingFlags bindingAttr) => Query<MethodInfo>(bindingAttr).ToArray();

    // protected sealed override MethodInfo? GetMethodImpl(string name, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers)
    // {
    //     return GetMethodImplCommon(name, GenericParameterCountAny, bindingAttr, binder, callConvention, types, modifiers);
    // }

    // protected sealed override MethodInfo? GetMethodImpl(string name, int genericParameterCount, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers)
    // {
    //     return GetMethodImplCommon(name, genericParameterCount, bindingAttr, binder, callConvention, types, modifiers);
    // }

    // private MethodInfo? GetMethodImplCommon(string name, int genericParameterCount, BindingFlags bindingAttr, Binder? binder, CallingConventions callConvention, Type[]? types, ParameterModifier[]? modifiers)
    // {
    //     Debug.Assert(name != null);

    //     // GetMethodImpl() is a funnel for two groups of api. We can distinguish by comparing "types" to null.
    //     if (types == null)
    //     {
    //         // Group #1: This group of api accept only a name and BindingFlags. The other parameters are hard-wired by the non-virtual api entrypoints.
    //         Debug.Assert(genericParameterCount == GenericParameterCountAny);
    //         Debug.Assert(binder == null);
    //         Debug.Assert(callConvention == CallingConventions.Any);
    //         Debug.Assert(modifiers == null);
    //         return Query<MethodInfo>(name, bindingAttr).Disambiguate();
    //     }
    //     else
    //     {
    //         // Group #2: This group of api takes a set of parameter types and an optional binder.
    //         QueryResult<MethodInfo> queryResult = Query<MethodInfo>(name, bindingAttr);
    //         ListBuilder<MethodInfo> candidates = default;
    //         foreach (MethodInfo candidate in queryResult)
    //         {
    //             if (genericParameterCount != GenericParameterCountAny && genericParameterCount != candidate.GetGenericParameterCount())
    //                 continue;
    //             if (candidate.QualifiesBasedOnParameterCount(bindingAttr, callConvention, types))
    //                 candidates.Add(candidate);
    //         }

    //         if (candidates.Count == 0)
    //             return null;

    //         // For perf and .NET Framework compat, fast-path these specific checks before calling on the binder to break ties.
    //         if (types.Length == 0 && candidates.Count == 1)
    //             return candidates[0];

    //         binder ??= Loader.GetDefaultBinder();
    //         return binder.SelectMethod(bindingAttr, candidates.ToArray(), types, modifiers) as MethodInfo;
    //     }
    // }

    // public sealed override Type[] GetNestedTypes(BindingFlags bindingAttr) => Query<Type>(bindingAttr).ToArray();
    // public sealed override Type? GetNestedType(string name, BindingFlags bindingAttr) => Query<Type>(name, bindingAttr).Disambiguate();

    // public sealed override PropertyInfo[] GetProperties(BindingFlags bindingAttr) => Query<PropertyInfo>(bindingAttr).ToArray();

    // protected sealed override PropertyInfo? GetPropertyImpl(string name, BindingFlags bindingAttr, Binder? binder, Type? returnType, Type[]? types, ParameterModifier[]? modifiers)
    // {
    //     Debug.Assert(name != null);

    //     // GetPropertyImpl() is a funnel for two groups of api. We can distinguish by comparing "types" to null.
    //     if (types == null && returnType == null)
    //     {
    //         // Group #1: This group of api accept only a name and BindingFlags. The other parameters are hard-wired by the non-virtual api entrypoints.
    //         Debug.Assert(binder == null);
    //         Debug.Assert(modifiers == null);
    //         return Query<PropertyInfo>(name, bindingAttr).Disambiguate();
    //     }
    //     else
    //     {
    //         // Group #2: This group of api takes a set of parameter types, a return type (both cannot be null) and an optional binder.
    //         QueryResult<PropertyInfo> queryResult = Query<PropertyInfo>(name, bindingAttr);
    //         ListBuilder<PropertyInfo> candidates = default;
    //         foreach (PropertyInfo candidate in queryResult)
    //         {
    //             if (types == null || (candidate.GetIndexParameters().Length == types.Length))
    //             {
    //                 candidates.Add(candidate);
    //             }
    //         }

    //         if (candidates.Count == 0)
    //             return null;

    //         // For perf and .NET Framework compat, fast-path these specific checks before calling on the binder to break ties.
    //         if (types == null || types.Length == 0)
    //         {
    //             PropertyInfo firstCandidate = candidates[0];

    //             // no arguments
    //             if (candidates.Count == 1)
    //             {
    //                 if (!(returnType is null) && !returnType.IsEquivalentTo(firstCandidate.PropertyType))
    //                     return null;
    //                 return firstCandidate;
    //             }
    //             else
    //             {
    //                 if (returnType is null)
    //                     // if we are here we have no args or property type to select over and we have more than one property with that name
    //                     throw ThrowHelper.GetAmbiguousMatchException(firstCandidate);
    //             }
    //         }

    //         if ((bindingAttr & BindingFlags.ExactBinding) != 0)
    //             return System.DefaultBinder.ExactPropertyBinding(candidates.ToArray(), returnType, types);

    //         binder ??= Loader.GetDefaultBinder();

    //         return binder.SelectProperty(bindingAttr, candidates.ToArray(), returnType, types, modifiers);
    //     }
    // }

    // private QueryResult<M> Query<M>(BindingFlags bindingAttr) where M : MemberInfo
    // {
    //     return Query<M>(null, bindingAttr, null);
    // }

    // private QueryResult<M> Query<M>(string name, BindingFlags bindingAttr) where M : MemberInfo
    // {
    //     if (name is null)
    //     {
    //         throw new ArgumentNullException(nameof(name));
    //     }

    //     return Query<M>(name, bindingAttr, null);
    // }

    // private QueryResult<M> Query<M>(string? optionalName, BindingFlags bindingAttr, Func<M, bool>? optionalPredicate) where M : MemberInfo
    // {
    //     MemberPolicies<M> policies = MemberPolicies<M>.Default;
    //     bindingAttr = policies.ModifyBindingFlags(bindingAttr);
    //     bool immediateTypeOnly = NeedToSearchImmediateTypeOnly(bindingAttr);
    //     bool ignoreCase = (bindingAttr & BindingFlags.IgnoreCase) != 0;

    //     TypeComponentsCache cache = Cache;
    //     QueriedMemberList<M> queriedMembers;
    //     if (optionalName == null)
    //         queriedMembers = cache.GetQueriedMembers<M>(immediateTypeOnly);
    //     else
    //         queriedMembers = cache.GetQueriedMembers<M>(optionalName, ignoreCase: ignoreCase, immediateTypeOnly: immediateTypeOnly);

    //     if (optionalPredicate != null)
    //         queriedMembers = queriedMembers.Filter(optionalPredicate);
    //     return new QueryResult<M>(bindingAttr, queriedMembers);
    // }

    // private static bool NeedToSearchImmediateTypeOnly(BindingFlags bf)
    // {
    //     if ((bf & (BindingFlags.Static | BindingFlags.FlattenHierarchy)) == (BindingFlags.Static | BindingFlags.FlattenHierarchy))
    //         return false;

    //     if ((bf & (BindingFlags.Instance | BindingFlags.DeclaredOnly)) == BindingFlags.Instance)
    //         return false;

    //     return true;
    // }

    // private TypeComponentsCache Cache => _lazyCache ??= new TypeComponentsCache(this);

    // private volatile TypeComponentsCache? _lazyCache;

    // private const int GenericParameterCountAny = -1;
}