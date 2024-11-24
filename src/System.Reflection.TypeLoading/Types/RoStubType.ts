import { GenericParameterAttributes } from "System.Reflection/GenericParameterAttributes";
import { RoType } from "./RoType";
import { Type } from "System/Type";
import { RoModule } from "System.Reflection.TypeLoading/Modules/RoModule";
import { TypeAttributes } from "System.Reflection/TypeAttributes";

export abstract class RoStubType extends RoType {
    protected constructor() { super(); }

    public override get IsTypeDefinition(): boolean { throw null!; }
    public override get IsGenericTypeDefinition(): boolean { throw null!; }
    protected override  HasElementTypeImpl(): boolean { throw null!; }
    protected override  IsArrayImpl(): boolean { throw null!; }
    public override get IsSZArray(): boolean { throw null!; }
    public override get IsVariableBoundArray(): boolean { throw null!; }
    protected override  IsByRefImpl(): boolean { throw null!; }
    protected override  IsPointerImpl(): boolean { throw null!; }
    public override get IsFunctionPointer(): boolean { throw null!; }
    public override get IsUnmanagedFunctionPointer(): boolean { throw null!; }
    public override get IsConstructedGenericType(): boolean { throw null!; }
    public override get IsGenericParameter(): boolean { throw null!; }
    public override get IsGenericTypeParameter(): boolean { throw null!; }
    public override get IsGenericMethodParameter(): boolean { throw null!; }
    public override get ContainsGenericParameters(): boolean { throw null!; }

    public override  GetRoModule(): RoModule { throw null!; }

    public override  GetArrayRank(): number { throw null!; }

    protected override  ComputeName(): string { throw null!; }
    protected override  ComputeNamespace(): string { throw null!; }
    protected override  ComputeFullName(): string { throw null!; }

    protected override  ComputeAttributeFlags(): TypeAttributes { throw null!; }
    // protected  override TypeCode GetTypeCodeImpl() { throw null!; }

    // public  override string ToString() => GetType().ToString();

    // public  override MethodBase DeclaringMethod { throw null!; }
    // protected  override RoType ComputeDeclaringType() { throw null!; }

    // public  override IEnumerable<CustomAttributeData> CustomAttributes { throw null!; }
    // public  override boolean IsCustomAttributeDefined(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name) { throw null!; }
    // public  override CustomAttributeData TryFindCustomAttribute(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name) { throw null!; }

    // public  override int MetadataToken { throw null!; }

    public override  GetRoElementType(): RoType { throw null!; }

    // public  override Type GetGenericTypeDefinition() { throw null!; }
    // public  override RoType[] GetGenericTypeParametersNoCopy() { throw null!; }
    // public  override RoType[] GetGenericTypeArgumentsNoCopy() { throw null!; }
    // protected public  override RoType[] GetGenericArgumentsNoCopy() { throw null!; }
    // [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
    // public  override Type MakeGenericType(params Type[] typeArguments) { throw null!; }

    public override  get GenericParameterAttributes(): GenericParameterAttributes { throw null!; }
    public override get GenericParameterPosition(): number { throw null!; }
    public override GetGenericParameterConstraints(): Type[] { throw null!; }
    public override  GetFunctionPointerReturnType(): Type { throw null!; }
    public override  GetFunctionPointerParameterTypes(): Type[] { throw null!; }

    // public  override Guid GUID { throw null!; }
    // public  override StructLayoutAttribute StructLayoutAttribute { throw null!; }
    // protected public  override RoType ComputeEnumUnderlyingType() { throw null!; }

    public override  ComputeBaseTypeWithoutDesktopQuirk(): RoType { throw null!; }
    // public  override IEnumerable<RoType> ComputeDirectlyImplementedInterfaces() { throw null!; }

    // // Low level support for the BindingFlag-driven enumerator apis.
    // public  override IEnumerable<ConstructorInfo> GetConstructorsCore(NameFilter? filter) { throw null!; }
    // public  override IEnumerable<MethodInfo> GetMethodsCore(NameFilter? filter, Type reflectedType) { throw null!; }
    // public  override IEnumerable<EventInfo> GetEventsCore(NameFilter? filter, Type reflectedType) { throw null!; }
    // public  override IEnumerable<FieldInfo> GetFieldsCore(NameFilter? filter, Type reflectedType) { throw null!; }
    // public  override IEnumerable<PropertyInfo> GetPropertiesCore(NameFilter? filter, Type reflectedType) { throw null!; }
    // public  override IEnumerable<RoType> GetNestedTypesCore(NameFilter? filter) { throw null!; }
}