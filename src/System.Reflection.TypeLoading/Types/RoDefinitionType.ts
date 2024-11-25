// using System.Collections.Generic;
// using System.Diagnostics;
// using System.Diagnostics.CodeAnalysis;
// using System.Runtime.InteropServices;
// namespace System.Reflection.TypeLoading
import assert from "assert";
import { Type } from "System";
import { RoInstantiationProviderType, RoType } from "System.Reflection.TypeLoading";
import { CustomAttributeData } from "System.Reflection/CustomAttributeData";
import { GenericParameterAttributes } from "System.Reflection/GenericParameterAttributes";
import { MethodBase } from "System.Reflection/MethodBase";
import { TypeAttributes } from "System.Reflection/TypeAttributes";

/// <summary>
/// Base type for all RoTypes that return true for IsTypeDefinition.
/// </summary>
export abstract class RoDefinitionType extends RoInstantiationProviderType {
    protected constructor() {
        super();
    }

    public override get IsTypeDefinition() { return true; }
    protected override  HasElementTypeImpl() { return false; }
    protected override  IsArrayImpl() { return false; }
    public override get IsSZArray() { return false; }
    public override get IsVariableBoundArray() { return false; }
    protected override  IsByRefImpl() { return false; }
    protected override  IsPointerImpl() { return false; }
    public override get IsFunctionPointer() { return false; }
    public override get IsUnmanagedFunctionPointer() { return false; }
    public override get IsConstructedGenericType() { return false; }
    public override get IsGenericParameter() { return false; }
    public override get IsGenericTypeParameter() { return false; }
    public override get IsGenericMethodParameter() { return false; }
    public override get ContainsGenericParameters() { return this.IsGenericTypeDefinition; }

    protected override  ComputeFullName(): string | undefined {
        assert(!this.IsConstructedGenericType);
        assert(!this.IsGenericParameter);
        assert(!this.HasElementType);

        const name = this.Name;

        const declaringType = this.DeclaringType;
        if (declaringType != undefined) {
            const declaringTypeFullName = declaringType.FullName;
            return declaringTypeFullName + "+" + name;
        }

        const ns = this.Namespace;
        if (ns == undefined)
            return name;
        return ns + "." + name;
    }

    public override ToString() { return this.FullName!; }
    public abstract GetGenericParameterCount(): number;
    public abstract GetGenericTypeParametersNoCopy(): RoType[];

    public override get CustomAttributes(): Array<CustomAttributeData> {
        // const result = new Array<CustomAttributeData>();
        //     for (const cad of this.GetTrueCustomAttributes())
        //     {
        //         result.push(cad);
        //     }

        //     if (0 != (this.Attributes & TypeAttributes.Import))
        //     {
        //         const ci = this.Loader.TryGetComImportCtor();
        //         if (ci != undefined)
        //             result.push(new RoPseudoCustomAttributeData(ci));
        //     }
        //     return result;
        throw new Error("Not implemented");
    }

    protected abstract GetTrueCustomAttributes(): Array<CustomAttributeData>;

    // public  override Type GetGenericTypeDefinition() => IsGenericTypeDefinition ? this : throw new InvalidOperationException(SR.InvalidOperation_NotGenericType);

    public  override  ComputeBaseTypeWithoutDesktopQuirk(): RoType | undefined {  return this.SpecializeBaseType(this.Instantiation); }
    public abstract  SpecializeBaseType(instantiation: RoType[] ): RoType | undefined;

    // internal  override IEnumerable<RoType> ComputeDirectlyImplementedInterfaces() => SpecializeInterfaces(Instantiation);
    // internal abstract IEnumerable<RoType> SpecializeInterfaces(RoType[] instantiation);

    // [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
    // public  override Type MakeGenericType(params Type[] typeArguments)
    // {
    //     if (typeArguments is undefined)
    //         throw new ArgumentNullException(nameof(typeArguments));

    //     if (!IsGenericTypeDefinition)
    //         throw new InvalidOperationException(SR.Format(SR.Arg_NotGenericTypeDefinition, this));

    //     int count = typeArguments.Length;
    //     if (count != GetGenericParameterCount())
    //         throw new ArgumentException(SR.Argument_GenericArgsCount, nameof(typeArguments));

    //     bool foundSigType = false;
    //     RoType[] runtimeTypeArguments = new RoType[count];
    //     for (int i = 0; i < count; i++)
    //     {
    //         Type typeArgument = typeArguments[i];
    //         if (typeArgument == undefined)
    //             throw new ArgumentNullException();
    //         if (typeArgument.IsSignatureType())
    //         {
    //             foundSigType = true;
    //         }
    //         else
    //         {
    //             if (!(typeArgument is RoType roTypeArgument && roTypeArgument.Loader == Loader))
    //                 throw new ArgumentException(SR.Format(SR.MakeGenericType_NotLoadedByMetadataLoadContext, typeArgument));
    //             runtimeTypeArguments[i] = roTypeArgument;
    //         }
    //     }
    //     if (foundSigType)
    //         return this.MakeSignatureGenericType(typeArguments);

    //     // We are intentionally not validating constraints as constraint validation is an execution-time issue that does not block our
    //     // library and should not block a metadata inspection tool.
    //     return this.GetUniqueConstructedGenericType(runtimeTypeArguments);
    // }

    // public  override Guid GUID
    // {
    //     get
    //     {
    //         CustomAttributeData? cad = TryFindCustomAttribute(Utf8Constants.SystemRuntimeInteropServices, Utf8Constants.GuidAttribute);
    //         if (cad == undefined)
    //             return default;
    //         IList<CustomAttributeTypedArgument> ctas = cad.ConstructorArguments;
    //         if (ctas.Count != 1)
    //             return default;
    //         CustomAttributeTypedArgument cta = ctas[0];
    //         if (cta.ArgumentType != Loader.TryGetCoreType(CoreType.String))
    //             return default;
    //         if (!(cta.Value is string guidString))
    //             return default;
    //         return new Guid(guidString);
    //     }
    // }

    // public  override StructLayoutAttribute? StructLayoutAttribute
    // {
    //     get
    //     {
    //         // Note: CoreClr checks HasElementType and IsGenericParameter in addition to IsInterface but those properties cannot be true here as this
    //         // RoType subclass is solely for TypeDef types.)
    //         if (IsInterface)
    //             return undefined;

    //         TypeAttributes attributes = Attributes;
    //         LayoutKind layoutKind = (attributes & TypeAttributes.LayoutMask) switch
    //         {
    //             TypeAttributes.ExplicitLayout => LayoutKind.Explicit,
    //             TypeAttributes.AutoLayout => LayoutKind.Auto,
    //             TypeAttributes.SequentialLayout => LayoutKind.Sequential,
    //             _ => LayoutKind.Auto,
    //         };
    //         CharSet charSet = (attributes & TypeAttributes.StringFormatMask) switch
    //         {
    //             TypeAttributes.AnsiClass => CharSet.Ansi,
    //             TypeAttributes.AutoClass => CharSet.Auto,
    //             TypeAttributes.UnicodeClass => CharSet.Unicode,
    //             _ => CharSet.None,
    //         };
    //         GetPackSizeAndSize(out int pack, out int size);

    //         return new StructLayoutAttribute(layoutKind)
    //         {
    //             CharSet = charSet,
    //             Pack = pack,
    //             Size = size,
    //         };
    //     }
    // }

    // protected abstract void GetPackSizeAndSize(out int packSize, out int size);

    // protected  override TypeCode GetTypeCodeImpl()
    // {
    //     Type t = IsEnum ? GetEnumUnderlyingType() : this;
    //     CoreTypes ct = Loader.GetAllFoundCoreTypes();
    //     if (t == ct[CoreType.Boolean])
    //         return TypeCode.Boolean;
    //     if (t == ct[CoreType.Char])
    //         return TypeCode.Char;
    //     if (t == ct[CoreType.SByte])
    //         return TypeCode.SByte;
    //     if (t == ct[CoreType.Byte])
    //         return TypeCode.Byte;
    //     if (t == ct[CoreType.Int16])
    //         return TypeCode.Int16;
    //     if (t == ct[CoreType.UInt16])
    //         return TypeCode.UInt16;
    //     if (t == ct[CoreType.Int32])
    //         return TypeCode.Int32;
    //     if (t == ct[CoreType.UInt32])
    //         return TypeCode.UInt32;
    //     if (t == ct[CoreType.Int64])
    //         return TypeCode.Int64;
    //     if (t == ct[CoreType.UInt64])
    //         return TypeCode.UInt64;
    //     if (t == ct[CoreType.Single])
    //         return TypeCode.Single;
    //     if (t == ct[CoreType.Double])
    //         return TypeCode.Double;
    //     if (t == ct[CoreType.String])
    //         return TypeCode.String;
    //     if (t == ct[CoreType.DateTime])
    //         return TypeCode.DateTime;
    //     if (t == ct[CoreType.Decimal])
    //         return TypeCode.Decimal;
    //     if (t == ct[CoreType.DBNull])
    //         return TypeCode.DBNull;
    //     return TypeCode.Object;
    // }

    public override  GetRoElementType(): RoType | undefined { return undefined }
    // public  override int GetArrayRank() => throw new ArgumentException(SR.Argument_HasToBeArrayClass);
    // internal  override RoType[] GetGenericTypeArgumentsNoCopy() => Array.Empty<RoType>();
    // protected internal  override RoType[] GetGenericArgumentsNoCopy() => GetGenericTypeParametersNoCopy();
    public override get GenericParameterAttributes(): GenericParameterAttributes { throw new Error("Arg_NotGenericParameter"); }
    public  override get GenericParameterPosition(): number { throw new Error("Arg_NotGenericParameter");}
    public  override GetGenericParameterConstraints(): Type[]  { throw new Error("Arg_NotGenericParameter");}
    public  override get DeclaringMethod(): MethodBase { throw new Error("Arg_NotGenericParameter");}
    public override  GetFunctionPointerReturnType(): Type { throw new Error("InvalidOperation_NotFunctionPointer"); }
    public override  GetFunctionPointerParameterTypes(): Type[] { throw new Error("InvalidOperation_NotFunctionPointer"); }
    // internal  override IEnumerable<ConstructorInfo> GetConstructorsCore(NameFilter? filter) => SpecializeConstructors(filter, this);
    // internal  override IEnumerable<MethodInfo> GetMethodsCore(NameFilter? filter, Type reflectedType) => SpecializeMethods(filter, reflectedType, this);
    // internal  override IEnumerable<EventInfo> GetEventsCore(NameFilter? filter, Type reflectedType) => SpecializeEvents(filter, reflectedType, this);
    // internal  override IEnumerable<FieldInfo> GetFieldsCore(NameFilter? filter, Type reflectedType) => SpecializeFields(filter, reflectedType, this);
    // internal  override IEnumerable<PropertyInfo> GetPropertiesCore(NameFilter? filter, Type reflectedType) => SpecializeProperties(filter, reflectedType, this);

    // // Like CoreGetDeclared but allows specifying an alternate declaringType (which must be a generic instantiation of the true declaring type)
    // internal abstract IEnumerable<ConstructorInfo> SpecializeConstructors(NameFilter? filter, RoInstantiationProviderType declaringType);
    // internal abstract IEnumerable<MethodInfo> SpecializeMethods(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType);
    // internal abstract IEnumerable<EventInfo> SpecializeEvents(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType);
    // internal abstract IEnumerable<FieldInfo> SpecializeFields(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType);
    // internal abstract IEnumerable<PropertyInfo> SpecializeProperties(NameFilter? filter, Type reflectedType, RoInstantiationProviderType declaringType);

    // // Helpers for the typeref-resolution/name lookup logic.
    public abstract IsTypeNameEqual(ns: Uint8Array, name: Uint8Array): boolean;
    public abstract GetNestedTypeCore(utf8Name: Uint8Array): RoDefinitionType | undefined;

    public override get Instantiation(): RoType[] {
        return this.GetGenericTypeParametersNoCopy();
    }


}
