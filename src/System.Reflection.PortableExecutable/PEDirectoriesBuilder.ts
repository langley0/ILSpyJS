import { DirectoryEntry } from './DirectoryEntry';

export class PEDirectoriesBuilder {
    public AddressOfEntryPoint?: number;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_EXPORT.
    /// </remarks>
    public ExportTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_IMPORT.
    /// </remarks>
    public ImportTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_RESOURCE.
    /// </remarks>
    public ResourceTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_EXCEPTION.
    /// </remarks>
    public ExceptionTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_BASERELOC.
    /// </remarks>
    public BaseRelocationTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_DEBUG.
    /// </remarks>
    public DebugTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_COPYRIGHT or IMAGE_DIRECTORY_ENTRY_ARCHITECTURE.
    /// </remarks>
    public CopyrightTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_GLOBALPTR.
    /// </remarks>
    public GlobalPointerTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_TLS.
    /// </remarks>
    public ThreadLocalStorageTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG.
    /// </remarks>
    public LoadConfigTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT.
    /// </remarks>
    public BoundImportTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_IAT.
    /// </remarks>
    public ImportAddressTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT.
    /// </remarks>
    public DelayImportTable?: DirectoryEntry;

    /// <remarks>
    /// Aka IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR.
    /// </remarks>
    public CorHeaderTable?: DirectoryEntry;
}