import { TypeInfo } from "System.Reflection";

// This file makes NetStandard Reflection's "subclassing" surface area look as much like NetCore as possible so the rest of the code can be written without #if's.
//     public static class NetCoreApiEmulators
//     {
//         // On NetCore, call the real thing.

//         public static bool IsSignatureType(this Type type) => type.IsSignatureType;
//         public static bool IsSZArray(this Type type) => type.IsSZArray;
//         public static bool IsVariableBoundArray(this Type type) => type.IsVariableBoundArray;
//         public static bool IsGenericMethodParameter(this Type type) => type.IsGenericMethodParameter;
//         public static Type MakeSignatureGenericType(this Type genericTypeDefinition, Type[] typeArguments) => Type.MakeGenericSignatureType(genericTypeDefinition, typeArguments);
//     }

/// <summary>
/// Another layer of base types. Empty for NetCore.
/// </summary>
export abstract class LeveledTypeInfo extends TypeInfo {
    protected constructor() { super(); }
}

//     public abstract class LeveledAssembly : Assembly
//     {
//     }

//     public abstract class LeveledConstructorInfo : ConstructorInfo
//     {
//     }

//     public abstract class LeveledMethodInfo : MethodInfo
//     {
//     }

//     public abstract class LeveledEventInfo : EventInfo
//     {
//     }

//     public abstract class LeveledFieldInfo : FieldInfo
//     {
//     }

//     public abstract class LeveledParameterInfo : ParameterInfo
//     {
//     }

//     public abstract class LeveledPropertyInfo : PropertyInfo
//     {
//     }

//     public abstract class LeveledCustomAttributeData : CustomAttributeData
//     {
//     }
// }
