import { BlobBuilder } from "System.Reflection.Metadata";
import { SectionLocation } from "./SectionLocation";

export abstract class ResourceSectionBuilder {
    public ResourceSectionBuilder() {
    }

    public abstract Serialize(builder: BlobBuilder, location: SectionLocation): void;
}