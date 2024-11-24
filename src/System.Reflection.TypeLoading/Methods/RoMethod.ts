import assert from "assert";
import { LeveledMethodInfo, IRoMethodBase, TypeContext, RoModule, MethodSig, RoType } from "System.Reflection.TypeLoading";
import { MethodBase, MetadataLoadContext, Module } from "System.Reflection";
import { Type } from "System/Type";

export abstract class RoMethod extends LeveledMethodInfo implements IRoMethodBase {
    private readonly _reflectedType: Type;

    protected constructor(reflectedType?: Type) {
        super();

        assert(reflectedType != undefined);
        this._reflectedType = reflectedType;
    }

    // public abstract override bool Equals(object? obj);
    // public abstract override int GetHashCode();

    public get DeclaringType(): Type { return this.GetRoDeclaringType(); }
    public abstract GetRoDeclaringType(): RoType;

    public get ReflectedType(): Type { return this._reflectedType; }

    public get Name(): string { this._lazyName = this._lazyName ?? this.ComputeName(); return this._lazyName; }
    protected abstract ComputeName(): string;
    private _lazyName: string | undefined = undefined;

    public get Module(): Module { return this.GetRoModule(); }
    public abstract GetRoModule(): RoModule;

    // public abstract override int MetadataToken { get; }
    // public  override bool HasSameMetadataDefinitionAs(MemberInfo other) => this.HasSameMetadataDefinitionAsCore(other);

    // public abstract override IEnumerable<CustomAttributeData> CustomAttributes { get; }
    // public  override IList<CustomAttributeData> GetCustomAttributesData() => CustomAttributes.ToReadOnlyCollection();

    public GetCustomAttributes(attributeType: Type, inherit?: boolean): object[] { throw new Error("Arg_InvalidOperation_Reflection"); }
    public IsDefined(attributeType: Type, inherit: boolean): boolean { throw new Error("Arg_InvalidOperation_Reflection"); }

    // public abstract override bool IsConstructedGenericMethod { get; }
    // public abstract override bool IsGenericMethodDefinition { get; }
    // public  override bool IsGenericMethod => IsGenericMethodDefinition || IsConstructedGenericMethod;

    // public  override MethodAttributes Attributes => (_lazyMethodAttributes == MethodAttributesSentinel) ? (_lazyMethodAttributes = ComputeAttributes()) : _lazyMethodAttributes;
    // protected abstract MethodAttributes ComputeAttributes();
    // private const MethodAttributes MethodAttributesSentinel = (MethodAttributes)(-1);
    // private volatile MethodAttributes _lazyMethodAttributes = MethodAttributesSentinel;

    // public  override CallingConventions CallingConvention => (_lazyCallingConventions == CallingConventionsSentinel) ? (_lazyCallingConventions = ComputeCallingConvention()) : _lazyCallingConventions;
    // protected abstract CallingConventions ComputeCallingConvention();
    // private const CallingConventions CallingConventionsSentinel = (CallingConventions)(-1);
    // private volatile CallingConventions _lazyCallingConventions = CallingConventionsSentinel;

    // public  override MethodImplAttributes MethodImplementationFlags => (_lazyMethodImplAttributes == MethodImplAttributesSentinel) ? (_lazyMethodImplAttributes = ComputeMethodImplementationFlags()) : _lazyMethodImplAttributes;
    // protected abstract MethodImplAttributes ComputeMethodImplementationFlags();
    // private const MethodImplAttributes MethodImplAttributesSentinel = (MethodImplAttributes)(-1);
    // private volatile MethodImplAttributes _lazyMethodImplAttributes = MethodImplAttributesSentinel;

    // public  override MethodImplAttributes GetMethodImplementationFlags() => MethodImplementationFlags;
    // public abstract override MethodBody? GetMethodBody();

    // public  override bool ContainsGenericParameters
    // {
    //     get
    //     {
    //         if (GetRoDeclaringType().ContainsGenericParameters)
    //             return true;

    //         Type[] pis = GetGenericArgumentsOrParametersNoCopy();
    //         for (int i = 0; i < pis.Length; i++)
    //         {
    //             if (pis[i].ContainsGenericParameters)
    //                 return true;
    //         }

    //         return false;
    //     }
    // }

    // public  override ParameterInfo[] GetParameters() => GetParametersNoCopy().CloneArray<ParameterInfo>();
    // public  override ParameterInfo ReturnParameter => MethodSig.Return;
    // public RoParameter[] GetParametersNoCopy() => MethodSig.Parameters;

    // private MethodSig<RoParameter> MethodSig => _lazyMethodSig ??= ComputeMethodSig();
    // protected abstract MethodSig<RoParameter> ComputeMethodSig();
    // private volatile MethodSig<RoParameter>? _lazyMethodSig;

    // public  override ICustomAttributeProvider ReturnTypeCustomAttributes => ReturnParameter;
    // public  override Type ReturnType => ReturnParameter.ParameterType;

    // public abstract override MethodInfo GetGenericMethodDefinition();

    // public  override Type[] GetGenericArguments() => GetGenericArgumentsOrParametersNoCopy().CloneArray<Type>();
    // public RoType[] GetGenericArgumentsOrParametersNoCopy() => _lazyGenericArgumentsOrParameters ??= ComputeGenericArgumentsOrParameters();
    // protected abstract RoType[] ComputeGenericArgumentsOrParameters();
    // private volatile RoType[]? _lazyGenericArgumentsOrParameters;

    // public abstract RoType[] GetGenericTypeParametersNoCopy();
    // public abstract RoType[] GetGenericTypeArgumentsNoCopy();

    // [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
    // public abstract override MethodInfo MakeGenericMethod(params Type[] typeArguments);

    // public  override string ToString() => Loader.GetDisposedString() ?? this.ToString(ComputeMethodSigStrings());
    protected abstract ComputeMethodSigStrings(): MethodSig<string>;

    // public  override MethodInfo GetBaseDefinition() => throw new NotSupportedException(SR.NotSupported_GetBaseDefinition);

    // // No trust environment to apply these to.
    // public  override bool IsSecurityCritical => throw new InvalidOperationException(SR.InvalidOperation_IsSecurity);
    // public  override bool IsSecuritySafeCritical => throw new InvalidOperationException(SR.InvalidOperation_IsSecurity);
    // public  override bool IsSecurityTransparent => throw new InvalidOperationException(SR.InvalidOperation_IsSecurity);

    // // Not valid in a ReflectionOnly context
    // public  override object Invoke(object? obj, BindingFlags invokeAttr, Binder? binder, object?[]? parameters, CultureInfo? culture) => throw new InvalidOperationException(SR.Arg_ReflectionOnlyInvoke);
    // public  override Delegate CreateDelegate(Type delegateType){ throw new Error("Arg_InvalidOperation_Reflection");}
    // public  override Delegate CreateDelegate(Type delegateType, object? target){ throw new Error("Arg_InvalidOperation_Reflection");}
    // public  override RuntimeMethodHandle MethodHandle{ throw new Error("Arg_InvalidOperation_Reflection");}

    public get MethodBase(): MethodBase { return this; }
    public get Loader(): MetadataLoadContext { return this.GetRoModule().Loader; }
    public abstract get TypeContext(): TypeContext;
    public GetMethodSigString(position: number): string { return this.ComputeMethodSigStrings().Get(position)!; }
}