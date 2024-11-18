import { Version } from 'System';
import {
    BlobHandle,
    StringHandle,
    GuidHandle,
} from '../TypeSystem/Handles.TypeSystem';

export interface AssemblyRefTableRow {
    Version: Version;
    PublicKeyToken: BlobHandle;
    Name: StringHandle;
    Culture: StringHandle;
    Flags: number;
    HashValue: BlobHandle;
}

export interface ModuleRow {
    Generation: number;
    Name: StringHandle;
    ModuleVersionId: GuidHandle;
    EncId: GuidHandle;
    EncBaseId: GuidHandle;
}

export interface AssemblyRow {
    HashAlgorithm: number;
    Version: Version;
    Flags: number
    AssemblyKey: BlobHandle;
    AssemblyName: StringHandle;
    AssemblyCulture: StringHandle;
}

export interface ClassLayoutRow {
    PackingSize: number;
    ClassSize: number;
    Parent: number;
}

export interface ConstantRow {
    Type: number;
    Parent: number;
    Value: BlobHandle;
}

export interface CustomAttributeRow {
    Parent: number;
    Type: number;
    Value: BlobHandle;
}

export interface DeclSecurityRow {
    Action: number;
    Parent: number;
    PermissionSet: BlobHandle;
}

export interface EncLogRow {
    Token: number;
    FuncCode: number;
}

export interface EncMapRow {
    Token: number;
}

export interface EventRow {
    EventFlags: number;
    Name: StringHandle;
    EventType: number;
}

export interface EventMapRow {
    Parent: number;
    EventList: number;
}

export interface ExportedTypeRow {
    Flags: number;
    TypeDefId: number;
    TypeName: StringHandle;
    TypeNamespace: StringHandle;
    Implementation: number;
}

export interface FieldLayoutRow {
    Offset: number;
    Field: number;
}

export interface FieldMarshalRow {
    Parent: number;
    NativeType: BlobHandle;
}

export interface FieldRvaRow {
    Offset: number;
    Field: number;
}

export interface FieldDefRow {
    Flags: number;
    Name: StringHandle;
    Signature: BlobHandle;
}

export interface FileTableRow {
    Flags: number;
    FileName: StringHandle;
    HashValue: BlobHandle;
}

export interface GenericParamConstraintRow {
    Owner: number;
    Constraint: number;
}

export interface GenericParamRow {
    Number: number;
    Flags: number;
    Owner: number;
    Name: StringHandle;
}

export interface ImplMapRow {
    MappingFlags: number;
    MemberForwarded: number;
    ImportName: StringHandle;
    ImportScope: number;
}

export interface InterfaceImplRow {
    Class: number;
    Interface: number;
}

export interface ManifestResourceRow {
    Offset: number;
    Flags: number;
    Name: StringHandle;
    Implementation: number;
}

export interface MemberRefRow {
    Class: number;
    Name: StringHandle;
    Signature: BlobHandle;
}

export interface MethodImplRow {
    Class: number;
    MethodBody: number;
    MethodDecl: number;
}

export interface MethodSemanticsRow {
    Semantic: number;
    Method: number;
    Association: number;
}

export interface MethodSpecRow {
    Method: number;
    Instantiation: BlobHandle;
}

export interface MethodRow {
    BodyOffset: number;
    ImplFlags: number;
    Flags: number;
    Name: StringHandle;
    Signature: BlobHandle;
    ParamList: number;
}

export interface ModuleRefRow {
    Name: StringHandle;
}

export interface NestedClassRow {
    NestedClass: number;
    EnclosingClass: number;
}

export interface ParamRow {
    Flags: number;
    Sequence: number;
    Name: StringHandle;
}

export interface PropertyMapRow {
    Parent: number;
    PropertyList: number;
}

export interface PropertyRow {
    PropFlags: number;
    Name: StringHandle;
    Type: BlobHandle;
}

export interface TypeDefRow {
    Flags: number;
    Name: StringHandle;
    Namespace: StringHandle;
    Extends: number;
    FieldList: number;
    MethodList: number;
}

export interface TypeRefRow {
    ResolutionScope: number;
    Name: StringHandle;
    Namespace: StringHandle;
}

export interface TypeSpecRow {
    Signature: BlobHandle;
}

export interface StandaloneSigRow {
    Signature: BlobHandle;
}