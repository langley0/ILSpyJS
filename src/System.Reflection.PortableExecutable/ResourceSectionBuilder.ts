import { BlobBuilder } from "System.Reflection.Metadata";
import { SectionLocation } from "./SectionLocation";

export abstract class ResourceSectionBuilder {
    protected ResourceSectionBuilder() {
    }

    protected abstract Serialize(builder: BlobBuilder, location: SectionLocation): void;
}