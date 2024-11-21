// namespace System.Reflection.Metadata.Ecma335
import { Throw, sizeof } from "System";
import { MemoryBlock } from "System.Reflection.Internal";
import { TableIndex } from "System.Reflection.Metadata.Ecma335";

export class DocumentTableReader {
    public readonly NumberOfRows: number;

    private readonly _isGuidHeapRefSizeSmall: boolean;
    private readonly _isBlobHeapRefSizeSmall: boolean;

    private static readonly NameOffset = 0;
    private readonly _hashAlgorithmOffset: number;
    private readonly _hashOffset: number;
    private readonly _languageOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        guidHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._isGuidHeapRefSizeSmall = guidHeapRefSize == 2;
        this._isBlobHeapRefSizeSmall = blobHeapRefSize == 2;

        this._hashAlgorithmOffset = DocumentTableReader.NameOffset + blobHeapRefSize;
        this._hashOffset = this._hashAlgorithmOffset + guidHeapRefSize;
        this._languageOffset = this._hashOffset + blobHeapRefSize;
        this.RowSize = this._languageOffset + guidHeapRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public DocumentNameBlobHandle GetName(DocumentHandle handle)
    // {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return DocumentNameBlobHandle.FromOffset(Block.PeekHeapReference(rowOffset + NameOffset, _isBlobHeapRefSizeSmall));
    // }

    // public GuidHandle GetHashAlgorithm(DocumentHandle handle)
    // {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return GuidHandle.FromIndex(Block.PeekHeapReference(rowOffset + _hashAlgorithmOffset, _isGuidHeapRefSizeSmall));
    // }

    // public BlobHandle GetHash(DocumentHandle handle)
    // {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return BlobHandle.FromOffset(Block.PeekHeapReference(rowOffset + _hashOffset, _isBlobHeapRefSizeSmall));
    // }

    // public GuidHandle GetLanguage(DocumentHandle handle)
    // {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return GuidHandle.FromIndex(Block.PeekHeapReference(rowOffset + _languageOffset, _isGuidHeapRefSizeSmall));
    // }
}

export class MethodDebugInformationTableReader {
    public readonly NumberOfRows: number;

    private readonly _isDocumentRefSmall: boolean;
    private readonly _isBlobHeapRefSizeSmall: boolean;

    private static readonly DocumentOffset = 0;
    private readonly _sequencePointsOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        documentRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number) {
        this.NumberOfRows = numberOfRows;
        this._isDocumentRefSmall = documentRefSize == 2;
        this._isBlobHeapRefSizeSmall = blobHeapRefSize == 2;

        this._sequencePointsOffset = MethodDebugInformationTableReader.DocumentOffset + documentRefSize;
        this.RowSize = this._sequencePointsOffset + blobHeapRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public DocumentHandle GetDocument(MethodDebugInformationHandle handle)
    // {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return DocumentHandle.FromRowId(Block.PeekReference(rowOffset + DocumentOffset, _isDocumentRefSmall));
    // }

    // public BlobHandle GetSequencePoints(MethodDebugInformationHandle handle)
    // {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return BlobHandle.FromOffset(Block.PeekHeapReference(rowOffset + _sequencePointsOffset, _isBlobHeapRefSizeSmall));
    // }
}

export class LocalScopeTableReader {
    public readonly NumberOfRows: number;

    private readonly _isMethodRefSmall: boolean;
    private readonly _isImportScopeRefSmall: boolean;
    private readonly _isLocalConstantRefSmall: boolean;
    private readonly _isLocalVariableRefSmall: boolean;

    private static readonly MethodOffset = 0;
    private readonly _importScopeOffset: number;
    private readonly _variableListOffset: number;
    private readonly _constantListOffset: number;
    private readonly _startOffsetOffset: number;
    private readonly _lengthOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        methodRefSize: number,
        importScopeRefSize: number,
        localVariableRefSize: number,
        localConstantRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._isMethodRefSmall = methodRefSize == 2;
        this._isImportScopeRefSmall = importScopeRefSize == 2;
        this._isLocalVariableRefSmall = localVariableRefSize == 2;
        this._isLocalConstantRefSmall = localConstantRefSize == 2;

        this._importScopeOffset = LocalScopeTableReader.MethodOffset + methodRefSize;
        this._variableListOffset = this._importScopeOffset + importScopeRefSize;
        this._constantListOffset = this._variableListOffset + localVariableRefSize;
        this._startOffsetOffset = this._constantListOffset + localConstantRefSize;
        this._lengthOffset = this._startOffsetOffset + sizeof('uint');
        this.RowSize = this._lengthOffset + sizeof('uint');

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (numberOfRows > 0 && !declaredSorted) {
            Throw.TableNotSorted(TableIndex.LocalScope);
        }
    }

    // public MethodDefinitionHandle GetMethod(number rowId) {
    //     number rowOffset = (rowId - 1) * RowSize;
    //     return MethodDefinitionHandle.FromRowId(Block.PeekReference(rowOffset + MethodOffset, _isMethodRefSmall));
    // }

    // public ImportScopeHandle GetImportScope(LocalScopeHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return ImportScopeHandle.FromRowId(Block.PeekReference(rowOffset + _importScopeOffset, _isImportScopeRefSmall));
    // }

    // public number GetVariableStart(number rowId) {
    //     number rowOffset = (rowId - 1) * RowSize;
    //     return Block.PeekReference(rowOffset + _variableListOffset, _isLocalVariableRefSmall);
    // }

    // public number GetConstantStart(number rowId) {
    //     number rowOffset = (rowId - 1) * RowSize;
    //     return Block.PeekReference(rowOffset + _constantListOffset, _isLocalConstantRefSmall);
    // }

    // public number GetStartOffset(number rowId) {
    //     number rowOffset = (rowId - 1) * RowSize;
    //     return Block.PeekInt32(rowOffset + _startOffsetOffset);
    // }

    // public number GetLength(number rowId) {
    //     number rowOffset = (rowId - 1) * RowSize;
    //     return Block.PeekInt32(rowOffset + _lengthOffset);
    // }

    // public number GetEndOffset(number rowId) {
    //     number rowOffset = (rowId - 1) * RowSize;

    //     long result =
    //         Block.PeekUInt32(rowOffset + _startOffsetOffset) +
    //         Block.PeekUInt32(rowOffset + _lengthOffset);

    //     if (unchecked((number)result) != result) {
    //         Throw.ValueOverflow();
    //     }

    //     return (number)result;
    // }

    // public void GetLocalScopeRange(number methodDefRid, out number firstScopeRowId, out number lastScopeRowId) {
    //     number startRowNumber, endRowNumber;
    //     Block.BinarySearchReferenceRange(
    //         NumberOfRows,
    //         RowSize,
    //         MethodOffset,
    //         (uint)methodDefRid,
    //         _isMethodRefSmall,
    //         out startRowNumber,
    //         out endRowNumber
    //     );

    //     if (startRowNumber == -1) {
    //         firstScopeRowId = 1;
    //         lastScopeRowId = 0;
    //     }
    //     else {
    //         firstScopeRowId = startRowNumber + 1;
    //         lastScopeRowId = endRowNumber + 1;
    //     }
    // }
}

export class LocalVariableTableReader {
    public readonly NumberOfRows: number;
    private readonly _isStringHeapRefSizeSmall: boolean;
    private readonly _attributesOffset: number;
    private readonly _indexOffset: number;
    private readonly _nameOffset: number;
    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._isStringHeapRefSizeSmall = stringHeapRefSize == 2;

        this._attributesOffset = 0;
        this._indexOffset = this._attributesOffset + sizeof('ushort');
        this._nameOffset = this._indexOffset + sizeof('ushort');
        this.RowSize = this._nameOffset + stringHeapRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public LocalVariableAttributes GetAttributes(LocalVariableHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return (LocalVariableAttributes)Block.PeekUInt16(rowOffset + _attributesOffset);
    // }

    // public ushort GetIndex(LocalVariableHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return Block.PeekUInt16(rowOffset + _indexOffset);
    // }

    // public StringHandle GetName(LocalVariableHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return StringHandle.FromOffset(Block.PeekHeapReference(rowOffset + _nameOffset, _isStringHeapRefSizeSmall));
    // }
}

export class LocalConstantTableReader {
    public readonly NumberOfRows: number;
    private readonly _isStringHeapRefSizeSmall: boolean;
    private readonly _isBlobHeapRefSizeSmall: boolean;

    private static readonly NameOffset = 0;
    private readonly _signatureOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        stringHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._isStringHeapRefSizeSmall = stringHeapRefSize == 2;
        this._isBlobHeapRefSizeSmall = blobHeapRefSize == 2;

        this._signatureOffset = LocalConstantTableReader.NameOffset + stringHeapRefSize;
        this.RowSize = this._signatureOffset + blobHeapRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public StringHandle GetName(LocalConstantHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return StringHandle.FromOffset(Block.PeekHeapReference(rowOffset + NameOffset, _isStringHeapRefSizeSmall));
    // }

    // public BlobHandle GetSignature(LocalConstantHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return BlobHandle.FromOffset(Block.PeekHeapReference(rowOffset + _signatureOffset, _isBlobHeapRefSizeSmall));
    // }
}

export class StateMachineMethodTableReader {
    public readonly NumberOfRows: number;

    private readonly _isMethodRefSizeSmall: boolean;

    private static readonly MoveNextMethodOffset = 0;
    private readonly _kickoffMethodOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        methodRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number,
    ) {
        this.NumberOfRows = numberOfRows;
        this._isMethodRefSizeSmall = methodRefSize == 2;

        this._kickoffMethodOffset = methodRefSize;
        this.RowSize = this._kickoffMethodOffset + methodRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (numberOfRows > 0 && !declaredSorted) {
            Throw.TableNotSorted(TableIndex.StateMachineMethod);
        }
    }

    // public MethodDefinitionHandle FindKickoffMethod(number moveNextMethodRowId) {
    //     number foundRowNumber =
    //         this.Block.BinarySearchReference(
    //             this.NumberOfRows,
    //             this.RowSize,
    //             MoveNextMethodOffset,
    //             (uint)moveNextMethodRowId,
    //             _isMethodRefSizeSmall);

    //     if (foundRowNumber < 0) {
    //         return default(MethodDefinitionHandle);
    // }

    // return GetKickoffMethod(foundRowNumber + 1);
    //     }

    //     private MethodDefinitionHandle GetKickoffMethod(number rowId)
    // {
    //         number rowOffset = (rowId - 1) * RowSize;
    //     return MethodDefinitionHandle.FromRowId(Block.PeekReference(rowOffset + _kickoffMethodOffset, _isMethodRefSizeSmall));
    // }
}

export class ImportScopeTableReader {
    public readonly NumberOfRows: number;

    private readonly _isImportScopeRefSizeSmall: boolean;
    private readonly _isBlobHeapRefSizeSmall: boolean;

    private static readonly ParentOffset = 0;
    private readonly _importsOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        importScopeRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._isImportScopeRefSizeSmall = importScopeRefSize == 2;
        this._isBlobHeapRefSizeSmall = blobHeapRefSize == 2;

        this._importsOffset = ImportScopeTableReader.ParentOffset + importScopeRefSize;
        this.RowSize = this._importsOffset + blobHeapRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);
    }

    // public ImportScopeHandle GetParent(ImportScopeHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return ImportScopeHandle.FromRowId(Block.PeekReference(rowOffset + ParentOffset, _isImportScopeRefSizeSmall));
    // }

    // public BlobHandle GetImports(ImportScopeHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return BlobHandle.FromOffset(Block.PeekHeapReference(rowOffset + _importsOffset, _isBlobHeapRefSizeSmall));
    // }
}

export class CustomDebugInformationTableReader {
    public readonly NumberOfRows: number;

    private readonly _isHasCustomDebugInformationRefSizeSmall: boolean;
    private readonly _isGuidHeapRefSizeSmall: boolean;
    private readonly _isBlobHeapRefSizeSmall: boolean;

    private static readonly ParentOffset = 0;
    private readonly _kindOffset: number;
    private readonly _valueOffset: number;

    public readonly RowSize: number;
    public readonly Block: MemoryBlock;

    public constructor(
        numberOfRows: number,
        declaredSorted: boolean,
        hasCustomDebugInformationRefSize: number,
        guidHeapRefSize: number,
        blobHeapRefSize: number,
        containingBlock: MemoryBlock,
        containingBlockOffset: number
    ) {
        this.NumberOfRows = numberOfRows;
        this._isHasCustomDebugInformationRefSizeSmall = hasCustomDebugInformationRefSize == 2;
        this._isGuidHeapRefSizeSmall = guidHeapRefSize == 2;
        this._isBlobHeapRefSizeSmall = blobHeapRefSize == 2;

        this._kindOffset = CustomDebugInformationTableReader.ParentOffset + hasCustomDebugInformationRefSize;
        this._valueOffset = this._kindOffset + guidHeapRefSize;
        this.RowSize = this._valueOffset + blobHeapRefSize;

        this.Block = containingBlock.GetMemoryBlockAt(containingBlockOffset, this.RowSize * numberOfRows);

        if (numberOfRows > 0 && !declaredSorted) {
            Throw.TableNotSorted(TableIndex.CustomDebugInformation);
        }
    }

    // public EntityHandle GetParent(CustomDebugInformationHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return HasCustomDebugInformationTag.ConvertToHandle(Block.PeekTaggedReference(rowOffset + ParentOffset, _isHasCustomDebugInformationRefSizeSmall));
    // }

    // public GuidHandle GetKind(CustomDebugInformationHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return GuidHandle.FromIndex(Block.PeekHeapReference(rowOffset + _kindOffset, _isGuidHeapRefSizeSmall));
    // }

    // public BlobHandle GetValue(CustomDebugInformationHandle handle) {
    //     number rowOffset = (handle.RowId - 1) * RowSize;
    //     return BlobHandle.FromOffset(Block.PeekHeapReference(rowOffset + _valueOffset, _isBlobHeapRefSizeSmall));
    // }

    // public void GetRange(EntityHandle parentHandle, out number firstImplRowId, out number lastImplRowId) {
    //     number startRowNumber, endRowNumber;

    //     Block.BinarySearchReferenceRange(
    //         NumberOfRows,
    //         RowSize,
    //         ParentOffset,
    //         HasCustomDebugInformationTag.ConvertToTag(parentHandle),
    //         _isHasCustomDebugInformationRefSizeSmall,
    //         out startRowNumber,
    //         out endRowNumber
    //     );

    //     if (startRowNumber == -1) {
    //         firstImplRowId = 1;
    //         lastImplRowId = 0;
    //     }
    //     else {
    //         firstImplRowId = startRowNumber + 1;
    //         lastImplRowId = endRowNumber + 1;
    //     }
    // }
}