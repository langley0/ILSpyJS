import { RoType } from "./RoType";

export abstract class RoInstantiationProviderType extends RoType {
    protected constructor() {
        super();
    }

    public abstract get Instantiation(): RoType[];
}