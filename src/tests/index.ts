import { ReadNullPaddedUTF8RemovesNullPadding } from "./PEBinaryReaderTests";
import { InvalidSectionCount } from "./BadImageFormat";
import { ManagedPEBuilder_Errors } from "./PEBuilderTests";
import { Sizes } from "./PEHeadersTest";

ReadNullPaddedUTF8RemovesNullPadding();
InvalidSectionCount();
ManagedPEBuilder_Errors();
Sizes();