import { HandleType } from "System.Reflection.Metadata.Ecma335";

export enum HandleKind 
{
    ModuleDefinition = HandleType.Module,
    TypeReference = HandleType.TypeRef,
    TypeDefinition = HandleType.TypeDef,
    FieldDefinition = HandleType.FieldDef,
    MethodDefinition = HandleType.MethodDef,
    Parameter = HandleType.ParamDef,
    InterfaceImplementation = HandleType.InterfaceImpl,
    MemberReference = HandleType.MemberRef,
    Constant = HandleType.Constant,
    CustomAttribute = HandleType.CustomAttribute,
    DeclarativeSecurityAttribute = HandleType.DeclSecurity,
    StandaloneSignature = HandleType.Signature,
    EventDefinition = HandleType.Event,
    PropertyDefinition = HandleType.Property,
    MethodImplementation = HandleType.MethodImpl,
    ModuleReference = HandleType.ModuleRef,
    TypeSpecification = HandleType.TypeSpec,
    AssemblyDefinition = HandleType.Assembly,
    AssemblyFile = HandleType.File,
    AssemblyReference = HandleType.AssemblyRef,
    ExportedType = HandleType.ExportedType,
    GenericParameter = HandleType.GenericParam,
    MethodSpecification = HandleType.MethodSpec,
    GenericParameterConstraint = HandleType.GenericParamConstraint,
    ManifestResource = HandleType.ManifestResource,

    // Debug handles
    Document = HandleType.Document,
    MethodDebugInformation = HandleType.MethodDebugInformation,
    LocalScope = HandleType.LocalScope,
    LocalVariable = HandleType.LocalVariable,
    LocalConstant = HandleType.LocalConstant,
    ImportScope = HandleType.ImportScope,
    CustomDebugInformation = HandleType.CustomDebugInformation,

    // Heap handles
    NamespaceDefinition = HandleType.Namespace,
    UserString = HandleType.UserString,
    String = HandleType.String,
    Blob = HandleType.Blob,
    Guid = HandleType.Guid,

    // note that the highest bit is reserved for virtual bit on Handle
}