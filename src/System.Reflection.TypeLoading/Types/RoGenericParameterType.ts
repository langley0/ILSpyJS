import { TypeAttributes } from "System.Reflection/TypeAttributes";
import { RoType } from "./RoType";

export abstract class RoGenericParameterType extends RoType
    {
        protected constructor()
        {
            super();
        }

        public  override get IsTypeDefinition(): boolean { return  false; }
        public  override get IsGenericTypeDefinition(): boolean { return false; }
        protected  override  HasElementTypeImpl() {return false; }
        protected  override  IsArrayImpl() { return false; }
        public  override get IsSZArray(): boolean { return false; }
        public  override get IsVariableBoundArray() { return false; }
        protected  override  IsByRefImpl() { return false; }
        protected  override  IsPointerImpl() { return false; }
        public  override get IsFunctionPointer() { return  false; }
        public  override get IsUnmanagedFunctionPointer () { return  false; }
        public  override get IsConstructedGenericType() { return  false; }
        public  override get IsGenericParameter () { return  true; }
        public  override get ContainsGenericParameters () { return  true; }

        protected  override ComputeNamespace(): string | undefined { return this.DeclaringType!.Namespace; }
        protected  override  ComputeFullName(): string | undefined { return undefined; }
        // public  override  ToString(): string => Loader.GetDisposedString() ?? Name;

        protected  override  ComputeAttributeFlags(): TypeAttributes { return TypeAttributes.Public; }
        // protected  override TypeCode GetTypeCodeImpl() => TypeCode.Object;

        // internal  override RoType? GetRoElementType() => undefined;
        // public  override int GetArrayRank() => throw new ArgumentException(SR.Argument_HasToBeArrayClass);

        // public  override Type GetGenericTypeDefinition() => throw new InvalidOperationException(SR.InvalidOperation_NotGenericType);
        // internal  override RoType[] GetGenericTypeParametersNoCopy() => Array.Empty<RoType>();
        // internal  override RoType[] GetGenericTypeArgumentsNoCopy() => Array.Empty<RoType>();
        // protected internal  override RoType[] GetGenericArgumentsNoCopy() => Array.Empty<RoType>();
        // [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
        // public  override Type MakeGenericType(params Type[] typeArguments) => throw new InvalidOperationException(SR.Format(SR.Arg_NotGenericTypeDefinition, this));

        // public  override int GenericParameterPosition => (_lazyPosition == -1) ? (_lazyPosition = ComputePosition()) : _lazyPosition;
        // protected abstract int ComputePosition();
        // private volatile int _lazyPosition = -1;

        // public  override Type[] GetGenericParameterConstraints() => GetGenericParameterConstraintsNoCopy().CloneArray<Type>();
        // private RoType[] GetGenericParameterConstraintsNoCopy() => _lazyConstraints ??= ComputeGenericParameterConstraints();
        // protected abstract RoType[] ComputeGenericParameterConstraints();
        // private volatile RoType[]? _lazyConstraints;

        // public  override Type GetFunctionPointerReturnType() => throw new InvalidOperationException(SR.InvalidOperation_NotFunctionPointer);
        // public  override Type[] GetFunctionPointerParameterTypes() => throw new InvalidOperationException(SR.InvalidOperation_NotFunctionPointer);
        // public  override Guid GUID => Guid.Empty;
        // public  override StructLayoutAttribute? StructLayoutAttribute => undefined;
        // protected internal  override RoType ComputeEnumUnderlyingType() => throw new ArgumentException(SR.Arg_MustBeEnum);

        // internal  override RoType? ComputeBaseTypeWithoutDesktopQuirk()
        // {
        //     RoType[] constraints = GetGenericParameterConstraintsNoCopy();
        //     foreach (RoType constraint in constraints)
        //     {
        //         if (!constraint.IsInterface)
        //             return constraint;
        //     }
        //     return Loader.GetCoreType(CoreType.Object);
        // }

        // internal  override IEnumerable<RoType> ComputeDirectlyImplementedInterfaces()
        // {
        //     RoType[] constraints = GetGenericParameterConstraintsNoCopy();
        //     foreach (RoType constraint in constraints)
        //     {
        //         if (constraint.IsInterface)
        //             yield return constraint;
        //     }
        // }

        // // Low level support for the BindingFlag-driven enumerator apis.
        // internal  override IEnumerable<ConstructorInfo> GetConstructorsCore(NameFilter? filter) => Array.Empty<ConstructorInfo>();
        // internal  override IEnumerable<MethodInfo> GetMethodsCore(NameFilter? filter, Type reflectedType) => Array.Empty<MethodInfo>();
        // internal  override IEnumerable<EventInfo> GetEventsCore(NameFilter? filter, Type reflectedType) => Array.Empty<EventInfo>();
        // internal  override IEnumerable<FieldInfo> GetFieldsCore(NameFilter? filter, Type reflectedType) => Array.Empty<FieldInfo>();
        // internal  override IEnumerable<PropertyInfo> GetPropertiesCore(NameFilter? filter, Type reflectedType) => Array.Empty<PropertyInfo>();
        // internal  override IEnumerable<RoType> GetNestedTypesCore(NameFilter? filter) => Array.Empty<RoType>();
    }