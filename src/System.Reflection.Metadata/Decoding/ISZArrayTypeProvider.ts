export interface ISZArrayTypeProvider<TType> {
    /// <summary>
    /// Gets the type symbol for a single-dimensional array with zero lower bounds of the given element type.
    /// </summary>
    GetSZArrayType(elementType: TType): TType;
}