import assert from "assert";
import { RoGenericParameterType } from "System.Reflection.TypeLoading/Types/RoGenericParameterType";
import { EcmaModule } from "./EcmaModule";
import { GenericParameterHandle, MetadataReader } from "System.Reflection.Metadata";
import { TypeContext } from "System.Reflection.TypeLoading/General/TypeContext";

export abstract class EcmaGenericParameterType extends RoGenericParameterType {
    private readonly _ecmaModule: EcmaModule;

    public constructor(handle: GenericParameterHandle, module: EcmaModule) {
        super();
        assert(!handle.IsNil);

        this.Handle = handle;
        this._ecmaModule = module;
        // this._neverAccessThisExceptThroughGenericParameterProperty = handle.GetGenericParameter(Reader);
    }

    // internal sealed override RoModule GetRoModule() => _ecmaModule;

    // protected sealed override int ComputePosition() => GenericParameter.Index;
    // protected sealed override string ComputeName() => GenericParameter.Name.GetString(Reader);
    // public sealed override GenericParameterAttributes GenericParameterAttributes => GenericParameter.Attributes;

    // public sealed override IEnumerable<CustomAttributeData> CustomAttributes => GenericParameter.GetCustomAttributes().ToTrueCustomAttributes(GetEcmaModule());
    // internal sealed override bool IsCustomAttributeDefined(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name) => GenericParameter.GetCustomAttributes().IsCustomAttributeDefined(ns, name, GetEcmaModule());
    // internal sealed override CustomAttributeData? TryFindCustomAttribute(ReadOnlySpan<byte> ns, ReadOnlySpan<byte> name) => GenericParameter.GetCustomAttributes().TryFindCustomAttribute(ns, name, GetEcmaModule());

    // public sealed override int MetadataToken => Handle.GetToken();

    // protected sealed override RoType[] ComputeGenericParameterConstraints()
    // {
    //     MetadataReader reader = Reader;
    //     GenericParameterConstraintHandleCollection handles = GenericParameter.GetConstraints();
    //     int count = handles.Count;
    //     if (count == 0)
    //         return Array.Empty<RoType>();

    //     TypeContext typeContext = TypeContext;
    //     RoType[] constraints = new RoType[count];
    //     int index = 0;
    //     foreach (GenericParameterConstraintHandle h in handles)
    //     {
    //         RoType constraint = h.GetGenericParameterConstraint(reader).Type.ResolveTypeDefRefOrSpec(GetEcmaModule(), typeContext);

    //         // A constraint can have modifiers such as 'System.Runtime.InteropServices.UnmanagedType' which here is a 'System.ValueType'
    //         // modified type with a modreq for 'UnmanagedType' which would be obtainable through 'GetRequiredCustomModifiers()'.
    //         // However, for backwards compat, just return the unmodified type ('ValueType' in this case). This also prevents modified types from
    //         // "leaking" into an unmodified type hierarchy.
    //         if (constraint is RoModifiedType)
    //         {
    //             constraint = (RoType)constraint.UnderlyingSystemType;
    //         }

    //         constraints[index++] = constraint;
    //     }
    //     return constraints;
    // }

    // protected abstract override RoType? ComputeDeclaringType();
    // public abstract override MethodBase? DeclaringMethod { get; }

    public Handle: GenericParameterHandle;
    public GetEcmaModule(): EcmaModule { return this._ecmaModule; }
    public get Reader(): MetadataReader { return this.GetEcmaModule().Reader; }
    protected abstract get TypeContext(): TypeContext;

    // protected get GenericParameter(): GenericParameter { return this. _neverAccessThisExceptThroughGenericParameterProperty; } 
    // [DebuggerBrowsable(DebuggerBrowsableState.Never)]  // Block from debugger watch windows so they don't AV the debugged process.
    // private readonly  _neverAccessThisExceptThroughGenericParameterProperty: GenericParameter;
}