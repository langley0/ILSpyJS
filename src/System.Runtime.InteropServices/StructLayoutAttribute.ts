import { Attribute } from "System";
import { LayoutKind } from "./LayoutKind";
import { CharSet } from "./CharSet";

export class StructLayoutAttribute extends Attribute {
    public constructor(layoutKind: LayoutKind) {
        super();
        this.Value = layoutKind;
    }

    public readonly Value: LayoutKind;

    public Pack: number = 0;
    public Size: number = 0;
    public CharSet: CharSet = 0 as CharSet;
}