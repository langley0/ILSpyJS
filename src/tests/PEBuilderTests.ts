import { 
    Throw, 
    ArgumentNullException, 
    ArgumentOutOfRangeException,
} from "System";
import { 
    MetadataRootBuilder,
    BlobBuilder,
    MetadataBuilder,
} from "System.Reflection.Metadata";   
import { PEHeaderBuilder } from "System.Reflection.PortableExecutable";

export function ManagedPEBuilder_Errors() {
    var hdr = new PEHeaderBuilder();
    var ms = new MetadataRootBuilder(new MetadataBuilder());
    var il = new BlobBuilder();

    // Throw.ThrowIfErrorNotMatched(ArgumentNullException, () => new ManagedPEBuilder(null, ms, il));

    // Assert.Throws<ArgumentNullException>(() => new ManagedPEBuilder(null, ms, il));
    // Assert.Throws<ArgumentNullException>(() => new ManagedPEBuilder(hdr, null, il));
    // Assert.Throws<ArgumentNullException>(() => new ManagedPEBuilder(hdr, ms, null));
    // Assert.Throws<ArgumentOutOfRangeException>(() => new ManagedPEBuilder(hdr, ms, il, strongNameSignatureSize: -1));
}
