
// using System.Collections.Generic;
// using System.Diagnostics.CodeAnalysis;

import { RoType } from "System.Reflection.TypeLoading";

// namespace System.Reflection.TypeLoading
class SentinelType extends RoStubType {
    public constructor() { super(); }
}

class SentinelAssembly extends RoStubAssembly {
    public constructor() { super(); }
}

class SentinelMethod extends RoMethod {
    public constructor() { super(Sentinels.RoType); }
    // public  override RoType GetRoDeclaringType() => throw undefined!;
    // public  override RoModule GetRoModule() => throw undefined!;
    // public  override int MetadataToken => throw undefined!;
    // public  override IEnumerable<CustomAttributeData> CustomAttributes => throw undefined!;
    // public  override bool IsConstructedGenericMethod => throw undefined!;
    // public  override bool IsGenericMethodDefinition => throw undefined!;
    // public  override bool Equals(object? obj) => throw undefined!;
    // public  override MethodInfo GetGenericMethodDefinition() => throw undefined!;
    // public  override int GetHashCode() => throw undefined!;
    // public  override MethodBody GetMethodBody() => throw undefined!;
    // [RequiresUnreferencedCode("If some of the generic arguments are annotated (either with DynamicallyAccessedMembersAttribute, or generic constraints), trimming can't validate that the requirements of those annotations are met.")]
    // public  override MethodInfo MakeGenericMethod(params Type[] typeArguments) => throw undefined!;
    // protected  override MethodAttributes ComputeAttributes() => throw undefined!;
    // protected  override CallingConventions ComputeCallingConvention() => throw undefined!;
    // protected  override RoType[] ComputeGenericArgumentsOrParameters() => throw undefined!;
    // protected  override MethodImplAttributes ComputeMethodImplementationFlags() => throw undefined!;
    // protected  override MethodSig<RoParameter> ComputeMethodSig() => throw undefined!;
    // protected  override MethodSig<string> ComputeMethodSigStrings() => throw undefined!;
    // protected  override string ComputeName() => throw undefined!;
    // public  override RoType[] GetGenericTypeArgumentsNoCopy() => throw undefined!;
    // public  override RoType[] GetGenericTypeParametersNoCopy() => throw undefined!;
    // public  override TypeContext TypeContext => throw undefined!;
}

//
// These sentinel instances are used only for lazy-evaluation latches when "undefined" is a valid value for that property.
//
export class Sentinels {
    public static readonly RoType: RoType = new SentinelType();
    public static readonly RoMethod: RoMethod = new SentinelMethod();
}
