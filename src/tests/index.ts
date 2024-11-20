import { ReadNullPaddedUTF8RemovesNullPadding } from "./PEBinaryReaderTests";
import { InvalidSectionCount } from "./BadImageFormat";
import { ManagedPEBuilder_Errors } from "./PEBuilderTests";
import { Sizes, Sections } from "./PEHeadersTest";
import { LoadBinary } from "./MeatadataContext";

ReadNullPaddedUTF8RemovesNullPadding();
InvalidSectionCount();
ManagedPEBuilder_Errors();
Sizes();
Sections()
LoadBinary();