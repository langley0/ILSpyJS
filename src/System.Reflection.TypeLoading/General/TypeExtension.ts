import {
    TypeInfo,
    Assembly,
    MethodInfo,
} from "System.Reflection";

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

export abstract class LeveledAssembly extends Assembly {
}

// export abstract class LeveledConstructorInfo extends ConstructorInfo
// {
// }

export abstract class LeveledMethodInfo extends MethodInfo {
}

// export abstract class LeveledEventInfo extends EventInfo
// {
// }

// export abstract class LeveledFieldInfo extends FieldInfo
// {
// }

// export abstract class LeveledParameterInfo extends ParameterInfo
// {
// }

// export abstract class LeveledPropertyInfo extends PropertyInfo
// {
// }

// export abstract class LeveledCustomAttributeData extends CustomAttributeData
// {
// }
// }
