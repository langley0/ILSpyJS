export enum MetadataReaderOptions {
    /// <summary>
    /// All options are disabled.
    /// </summary>
    None = 0x0,

    /// <summary>
    /// The options that are used when a <see cref="MetadataReader"/> is obtained
    /// via an overload that does not take a <see cref="MetadataReaderOptions"/>
    /// argument.
    /// </summary>
    Default = 0x1,//ApplyWindowsRuntimeProjections,

    /// <summary>
    /// Windows Runtime projections are enabled (on by default).
    /// </summary>
    ApplyWindowsRuntimeProjections = 0x1
}