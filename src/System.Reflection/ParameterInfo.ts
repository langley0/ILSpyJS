import { Throw, Type } from "System"
import { MemberInfo, MemberTypes, MethodBase, MethodInfo } from "System.Reflection";
import { IObjectReference, StreamingContext } from "System.Runtime.Serialization";
import { ICustomAttributeProvider } from "./ICustomAttributeProvider";
import { PropertyInfo } from "./PropertyInfo";
export abstract class ParameterInfo implements ICustomAttributeProvider, IObjectReference {
    protected constructor() { }

    // public virtual ParameterAttributes Attributes => AttrsImpl;
    // public virtual MemberInfo Member => MemberImpl;
    // public virtual string? Name => NameImpl;
    // public virtual Type ParameterType => ClassImpl!;
    // public virtual int Position => PositionImpl;

    // public bool IsIn => (Attributes & ParameterAttributes.In) != 0;
    // public bool IsLcid => (Attributes & ParameterAttributes.Lcid) != 0;
    // public bool IsOptional => (Attributes & ParameterAttributes.Optional) != 0;
    // public bool IsOut => (Attributes & ParameterAttributes.Out) != 0;
    // public bool IsRetval => (Attributes & ParameterAttributes.Retval) != 0;

    // public virtual object? DefaultValue => throw NotImplemented.ByDesign;
    // public virtual object? RawDefaultValue => throw NotImplemented.ByDesign;
    // public virtual bool HasDefaultValue => throw NotImplemented.ByDesign;

    public IsDefined(attributeType: Type, inherit: boolean): boolean {
        Throw.ThrowIfNull(attributeType);
        return false;
    }

    // public virtual IEnumerable<CustomAttributeData> CustomAttributes => GetCustomAttributesData();
    // public virtual IList<CustomAttributeData> GetCustomAttributesData() { throw NotImplemented.ByDesign; }

    public GetCustomAttributes(attributeType: Type | boolean, inherit?: boolean): object[] {
        Throw.ThrowIfNull(attributeType);
        return new Array<object>();
    }

    // public virtual Type GetModifiedParameterType() => throw new NotSupportedException();

    // public virtual Type[] GetOptionalCustomModifiers() => Type.EmptyTypes;
    // public virtual Type[] GetRequiredCustomModifiers() => Type.EmptyTypes;

    // public virtual int MetadataToken => MetadataToken_ParamDef;

    // [Obsolete(Obsoletions.LegacyFormatterImplMessage, DiagnosticId = Obsoletions.LegacyFormatterImplDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // [EditorBrowsable(EditorBrowsableState.Never)]
    public GetRealObject(context: StreamingContext): object {
        // Once all the serializable fields have come in we can set up the real
        // instance based on just two of them (MemberImpl and PositionImpl).

        if (this.MemberImpl == undefined)
            throw new Error("Serialization_InsufficientState");

        let args: ParameterInfo[];
        switch (this.MemberImpl.MemberType) {
            case MemberTypes.Constructor:
            case MemberTypes.Method:
                if (this.PositionImpl == -1) {
                    if (this.MemberImpl.MemberType == MemberTypes.Method)
                        return (this.MemberImpl as MethodInfo).ReturnParameter;
                    else
                        throw new Error("Serialization_BadParameterInfo");
                }
                else {
                    args = (this.MemberImpl as MethodInfo).GetParametersAsSpan();

                    if (this.PositionImpl < args.length)
                        return args[this.PositionImpl];
                    else
                        throw new Error("Serialization_BadParameterInfo");
                }

            case MemberTypes.Property:
                args = (this.MemberImpl as PropertyInfo).GetIndexParameters();

                if (this.PositionImpl > -1 && this.PositionImpl < args.length)
                    return args[this.PositionImpl];
                else
                    throw new Error("Serialization_BadParameterInfo");

            default:
                throw new Error("Serialization_NoParameterInfo");
        }
    }

    // public override string ToString()
    // {
    //     string typeName = ParameterType.FormatTypeName();
    //     string? name = Name;
    //     return name is undefined ? typeName : typeName + " " + name;
    // }

    // protected ParameterAttributes AttrsImpl;
    // protected Type? ClassImpl;
    // protected object? DefaultValueImpl;
    protected MemberImpl: MemberInfo | undefined = undefined!;
    protected NameImpl: string | undefined = undefined!;
    protected PositionImpl: number = 0

    // private const int MetadataToken_ParamDef = 0x08000000;
}