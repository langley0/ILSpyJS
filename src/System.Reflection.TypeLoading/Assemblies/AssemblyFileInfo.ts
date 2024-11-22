import assert from "assert";
export class AssemblyFileInfo {
    public constructor(name: string, containsMetadata: boolean, rowIndex: number) {
        assert(name != null);

        this.Name = name;
        this.ContainsMetadata = containsMetadata;
        this.RowIndex = rowIndex;
    }

    public readonly Name: string;
    public readonly RowIndex: number;  // 0 for manifest modoule - 1..N for other modules.
    public readonly ContainsMetadata: boolean;
}