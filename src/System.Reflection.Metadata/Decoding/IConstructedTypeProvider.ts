import { ISZArrayTypeProvider } from './ISZArrayTypeProvider';

export interface IConstructedTypeProvider<TType> extends ISZArrayTypeProvider<TType>
    {
        // /// <summary>
        // /// Gets the type symbol for a generic instantiation of the given generic type with the given type arguments.
        // /// </summary>
        // TType GetGenericInstantiation(TType genericType, ImmutableArray<TType> typeArguments);

        // /// <summary>
        // /// Gets the type symbol for a generalized array of the given element type and shape.
        // /// </summary>
        // TType GetArrayType(TType elementType, ArrayShape shape);

        // /// <summary>
        // /// Gets the type symbol for a managed pointer to the given element type.
        // /// </summary>
        // TType GetByReferenceType(TType elementType);

        // /// <summary>
        // /// Gets the type symbol for an unmanaged pointer to the given element ty
        // /// </summary>
        // TType GetPointerType(TType elementType);
    }
